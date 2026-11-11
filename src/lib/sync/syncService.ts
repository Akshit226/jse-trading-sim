import { database, isFirebaseConfigured } from "../firebase";
import { ref, onValue, set, get } from "firebase/database";
import {
  Asset,
  AssetId,
  NewsEvent,
  PlayerPortfolio,
  RoomState,
  TradeOrder,
  StudentDesk,
} from "@/types/trading";
import {
  DEFAULT_ROUND_DURATION,
  INITIAL_ASSETS,
  TOTAL_ROUNDS,
} from "../constants";

export interface RoomMeta {
  code: string;
  status: RoomState["status"];
  currentRound: number;
  totalRounds: number;
  roundTimeRemaining: number;
  roundDurationSec: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  desk?: StudentDesk;
  totalNetWorth: number;
  returnPercent: number;
  totalTrades?: number;
}

const STORAGE_PREFIX = "trading_sim_room_";
const inMemoryRooms = new Map<string, RoomState>();
type RoomListener = (room: RoomState) => void;
const inPageListeners = new Map<string, Set<RoomListener>>();

export function normalizeRoomState(raw: any): RoomState {
  if (!raw) return raw as RoomState;
  return {
    ...raw,
    players: raw.players || {},
    recentTrades: Array.isArray(raw.recentTrades)
      ? raw.recentTrades
      : raw.recentTrades
      ? Object.values(raw.recentTrades)
      : [],
    newsHistory: Array.isArray(raw.newsHistory)
      ? raw.newsHistory
      : raw.newsHistory
      ? Object.values(raw.newsHistory)
      : [],
    assets: raw.assets || {},
  };
}

export function createInitialRoom(code: string): RoomState {
  return {
    code: code.toUpperCase(),
    status: "LOBBY",
    currentRound: 1,
    totalRounds: TOTAL_ROUNDS,
    roundTimeRemaining: DEFAULT_ROUND_DURATION,
    roundDurationSec: DEFAULT_ROUND_DURATION,
    currentNews: null,
    newsHistory: [],
    recentTrades: [],
    assets: JSON.parse(JSON.stringify(INITIAL_ASSETS)),
    players: {},
  };
}

/**
 * Loads room state from either API, Firebase, or LocalStorage
 */
export async function getRoomState(code: string): Promise<RoomState | null> {
  const upperCode = code.toUpperCase();

  if (isFirebaseConfigured && database) {
    try {
      const roomRef = ref(database, `rooms/${upperCode}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val && val.assets && val.assets.RELIANCE) {
          const norm = normalizeRoomState(val);
          inMemoryRooms.set(upperCode, norm);
          return norm;
        }
      }
    } catch (err) {
      // Permission denied or network issue -> fallback to server API
    }
  }

  // Fetch from server API if in browser
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/room?code=${upperCode}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          const norm = normalizeRoomState(json.room);
          inMemoryRooms.set(upperCode, norm);
          return norm;
        }
      }
    } catch {}

    const raw = localStorage.getItem(STORAGE_PREFIX + upperCode);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.assets && parsed.assets.RELIANCE) {
          return normalizeRoomState(parsed);
        }
      } catch {}
    }
  } else {
    // Pure Node.js environment
    try {
      const { getServerRoom } = await import("../server/roomStore");
      const serverRoom = getServerRoom(upperCode);
      return serverRoom ? normalizeRoomState(serverRoom) : null;
    } catch {}
  }

  return inMemoryRooms.get(upperCode) || null;
}

/**
 * Persists room state
 */
export async function saveRoomState(room: RoomState): Promise<void> {
  const upperCode = room.code.toUpperCase();
  const normalized = normalizeRoomState(room);
  inMemoryRooms.set(upperCode, normalized);

  // Notify local in-page subscribers immediately
  const listeners = inPageListeners.get(upperCode);
  if (listeners) {
    listeners.forEach((fn) => {
      try {
        fn(normalized);
      } catch (err) {
        console.error("Local listener error:", err);
      }
    });
  }

  // 1. Firebase sync if available
  if (isFirebaseConfigured && database) {
    try {
      const roomRef = ref(database, `rooms/${upperCode}`);
      await set(roomRef, normalized);
    } catch (err) {
      // Firebase write may be restricted by rules; local & server API will take over
    }
  }

  // 2. BroadcastChannel & LocalStorage sync
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_PREFIX + upperCode, JSON.stringify(normalized));
      const channel = new BroadcastChannel("trading_sim_" + upperCode);
      channel.postMessage({ type: "ROOM_UPDATED", room: normalized });
      setTimeout(() => channel.close(), 100);
    } catch (err) {
      console.warn("Storage/BroadcastChannel error:", err);
    }
  }
}

/**
 * Subscribes to real-time changes of a room (supports multi-device phone polling & Firebase)
 */
export function subscribeToRoom(
  code: string,
  onUpdate: (room: RoomState) => void
): () => void {
  const upperCode = code.toUpperCase();

  const safeOnUpdate = (rawRoom: RoomState) => {
    if (!rawRoom) return;
    const clean = normalizeRoomState(rawRoom);
    const current = inMemoryRooms.get(upperCode);

    // If an intentional clean reset occurred (empty room in LOBBY with no trades), do not resurrect old state
    const isExplicitReset =
      clean.status === "LOBBY" &&
      clean.currentRound === 1 &&
      clean.recentTrades.length === 0 &&
      Object.keys(clean.players || {}).length === 0;

    if (!isExplicitReset) {
      // Guard against cold serverless lambdas resetting an active session back to LOBBY
      if (current && current.status === "ACTIVE" && clean.status === "LOBBY") {
        clean.status = "ACTIVE";
      }
      // Guard against cold serverless lambdas wiping out registered players
      if (current && current.players) {
        clean.players = { ...current.players, ...clean.players };
      }
    }
    inMemoryRooms.set(upperCode, clean);
    onUpdate(clean);
  };

  // Register in-page listener
  if (!inPageListeners.has(upperCode)) {
    inPageListeners.set(upperCode, new Set());
  }
  inPageListeners.get(upperCode)!.add(safeOnUpdate);

  let unsubscribeFirebase: (() => void) | null = null;

  if (isFirebaseConfigured && database) {
    try {
      const roomRef = ref(database, `rooms/${upperCode}`);
      unsubscribeFirebase = onValue(
        roomRef,
        (snapshot) => {
          if (snapshot.exists()) {
            safeOnUpdate(snapshot.val() as RoomState);
          }
        },
        () => {
          // Gracefully suppress permission denied errors so HTTP polling handles updates
        }
      );
    } catch {
      // Firebase unavailable
    }
  }

  let pollInterval: NodeJS.Timeout | null = null;
  let channel: BroadcastChannel | null = null;

  if (typeof window !== "undefined") {
    // 1. Initial load from API
    getRoomState(upperCode).then((existing) => {
      if (existing) safeOnUpdate(existing);
    });

    // 2. Multi-device continuous polling (acts as primary sync or seamless fallback)
    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/room?code=${upperCode}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.room) {
            safeOnUpdate(json.room);
          }
        }
      } catch {}
    }, 1200);

    // 3. BroadcastChannel for same-browser instant sync
    try {
      channel = new BroadcastChannel("trading_sim_" + upperCode);
      const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === "ROOM_UPDATED" && e.data?.room) {
          safeOnUpdate(e.data.room);
        }
      };
      channel.addEventListener("message", handleMessage);
    } catch {}

    return () => {
      inPageListeners.get(upperCode)?.delete(safeOnUpdate);
      if (unsubscribeFirebase) unsubscribeFirebase();
      if (pollInterval) clearInterval(pollInterval);
      if (channel) channel.close();
    };
  }

  // Fallback for SSR
  getRoomState(upperCode).then((existing) => {
    if (existing) safeOnUpdate(existing);
  });

  return () => {
    inPageListeners.get(upperCode)?.delete(safeOnUpdate);
    if (unsubscribeFirebase) unsubscribeFirebase();
  };
}

/**
 * Granular: Subscribes ONLY to room lifecycle metadata (~120 bytes)
 */
export function subscribeToRoomMeta(
  code: string,
  onUpdate: (meta: RoomMeta) => void
): () => void {
  const upperCode = code.toUpperCase();
  let unsubStatus: (() => void) | null = null;
  let unsubRound: (() => void) | null = null;

  if (isFirebaseConfigured && database) {
    try {
      const statusRef = ref(database, `rooms/${upperCode}/status`);
      const roundRef = ref(database, `rooms/${upperCode}/currentRound`);

      const notify = () => {
        const current = inMemoryRooms.get(upperCode);
        onUpdate({
          code: upperCode,
          status: current?.status || "LOBBY",
          currentRound: current?.currentRound || 1,
          totalRounds: current?.totalRounds || TOTAL_ROUNDS,
          roundTimeRemaining: current?.roundTimeRemaining || DEFAULT_ROUND_DURATION,
          roundDurationSec: current?.roundDurationSec || DEFAULT_ROUND_DURATION,
        });
      };

      unsubStatus = onValue(statusRef, (snap) => {
        if (snap.exists()) {
          const status = snap.val() as RoomState["status"];
          const current = inMemoryRooms.get(upperCode) || createInitialRoom(upperCode);
          current.status = status;
          inMemoryRooms.set(upperCode, current);
          notify();
        }
      });

      unsubRound = onValue(roundRef, (snap) => {
        if (snap.exists()) {
          const round = Number(snap.val()) || 1;
          const current = inMemoryRooms.get(upperCode) || createInitialRoom(upperCode);
          current.currentRound = round;
          inMemoryRooms.set(upperCode, current);
          notify();
        }
      });
    } catch {}
  }

  // Also hook into in-page broadcast
  const listener: RoomListener = (room) => {
    onUpdate({
      code: room.code,
      status: room.status,
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      roundTimeRemaining: room.roundTimeRemaining,
      roundDurationSec: room.roundDurationSec,
    });
  };

  if (!inPageListeners.has(upperCode)) {
    inPageListeners.set(upperCode, new Set());
  }
  inPageListeners.get(upperCode)!.add(listener);

  return () => {
    inPageListeners.get(upperCode)?.delete(listener);
    if (unsubStatus) unsubStatus();
    if (unsubRound) unsubRound();
  };
}

/**
 * Granular: Subscribes ONLY to asset price quotes (~2.5 KB)
 */
export function subscribeToAssets(
  code: string,
  onUpdate: (assets: Record<AssetId, Asset>) => void
): () => void {
  const upperCode = code.toUpperCase();
  let unsubFirebase: (() => void) | null = null;

  if (isFirebaseConfigured && database) {
    try {
      const assetsRef = ref(database, `rooms/${upperCode}/assets`);
      unsubFirebase = onValue(assetsRef, (snap) => {
        if (snap.exists()) {
          onUpdate(snap.val() as Record<AssetId, Asset>);
        }
      });
    } catch {}
  }

  const listener: RoomListener = (room) => {
    if (room.assets) onUpdate(room.assets);
  };
  if (!inPageListeners.has(upperCode)) {
    inPageListeners.set(upperCode, new Set());
  }
  inPageListeners.get(upperCode)!.add(listener);

  return () => {
    inPageListeners.get(upperCode)?.delete(listener);
    if (unsubFirebase) unsubFirebase();
  };
}

/**
 * Granular: Subscribes ONLY to the student's personal portfolio (~300 bytes)
 */
export function subscribeToPlayerPortfolio(
  code: string,
  playerId: string,
  onUpdate: (player: PlayerPortfolio) => void
): () => void {
  const upperCode = code.toUpperCase();
  let unsubFirebase: (() => void) | null = null;

  if (isFirebaseConfigured && database && playerId) {
    try {
      const playerRef = ref(database, `rooms/${upperCode}/players/${playerId}`);
      unsubFirebase = onValue(playerRef, (snap) => {
        if (snap.exists()) {
          onUpdate(snap.val() as PlayerPortfolio);
        }
      });
    } catch {}
  }

  const listener: RoomListener = (room) => {
    if (room.players?.[playerId]) {
      onUpdate(room.players[playerId]);
    }
  };
  if (!inPageListeners.has(upperCode)) {
    inPageListeners.set(upperCode, new Set());
  }
  inPageListeners.get(upperCode)!.add(listener);

  return () => {
    inPageListeners.get(upperCode)?.delete(listener);
    if (unsubFirebase) unsubFirebase();
  };
}

/**
 * Granular: Subscribes to live recent trades ticker (~1 KB)
 */
export function subscribeToTrades(
  code: string,
  onUpdate: (trades: TradeOrder[]) => void
): () => void {
  const upperCode = code.toUpperCase();
  let unsubFirebase: (() => void) | null = null;

  if (isFirebaseConfigured && database) {
    try {
      const tradesRef = ref(database, `rooms/${upperCode}/recentTrades`);
      unsubFirebase = onValue(tradesRef, (snap) => {
        if (snap.exists()) {
          const val = snap.val();
          const list: TradeOrder[] = Array.isArray(val) ? val : Object.values(val || {});
          onUpdate(list.slice(0, 20));
        }
      });
    } catch {}
  }

  const listener: RoomListener = (room) => {
    if (room.recentTrades) onUpdate(room.recentTrades);
  };
  if (!inPageListeners.has(upperCode)) {
    inPageListeners.set(upperCode, new Set());
  }
  inPageListeners.get(upperCode)!.add(listener);

  return () => {
    inPageListeners.get(upperCode)?.delete(listener);
    if (unsubFirebase) unsubFirebase();
  };
}

/**
 * Granular: Subscribes to breaking news stream
 */
export function subscribeToNews(
  code: string,
  onUpdate: (news: NewsEvent | null) => void
): () => void {
  const upperCode = code.toUpperCase();
  let unsubFirebase: (() => void) | null = null;

  if (isFirebaseConfigured && database) {
    try {
      const newsRef = ref(database, `rooms/${upperCode}/currentNews`);
      unsubFirebase = onValue(newsRef, (snap) => {
        if (snap.exists()) {
          onUpdate(snap.val() as NewsEvent);
        } else {
          onUpdate(null);
        }
      });
    } catch {}
  }

  const listener: RoomListener = (room) => {
    onUpdate(room.currentNews);
  };
  if (!inPageListeners.has(upperCode)) {
    inPageListeners.set(upperCode, new Set());
  }
  inPageListeners.get(upperCode)!.add(listener);

  return () => {
    inPageListeners.get(upperCode)?.delete(listener);
    if (unsubFirebase) unsubFirebase();
  };
}

/**
 * Optimistic execution helper: Calculates immediate portfolio updates for 0ms UI latency
 */
export function calculateOptimisticTrade(
  player: PlayerPortfolio,
  asset: Asset,
  side: "BUY" | "SELL",
  quantity: number
): PlayerPortfolio {
  const currentHolding = player.shares[asset.id] || 0;
  const executionPrice = asset.currentPrice;
  const total = quantity * executionPrice;

  let newCash = player.cash;
  let newHolding = currentHolding;

  if (side === "BUY") {
    newCash = Math.max(0, player.cash - total);
    newHolding = currentHolding + quantity;
  } else {
    newCash = player.cash + total;
    newHolding = Math.max(0, currentHolding - quantity);
  }

  const updatedShares = {
    ...player.shares,
    [asset.id]: newHolding,
  };

  return {
    ...player,
    cash: Number(newCash.toFixed(2)),
    shares: updatedShares,
    totalTrades: player.totalTrades + 1,
    lastActive: Date.now(),
  };
}

/**
 * Registers or updates a student in the room (routes through server API for cross-device support)
 */
export async function joinPlayer(
  roomCode: string,
  player: PlayerPortfolio
): Promise<RoomState> {
  const upperCode = roomCode.toUpperCase();
  const currentLocal = inMemoryRooms.get(upperCode);

  // Instant direct Firebase RTDB write for immediate multi-client sync
  if (typeof window !== "undefined" && isFirebaseConfigured && database) {
    try {
      const playerRef = ref(database, `rooms/${upperCode}/players/${player.id}`);
      set(playerRef, player).catch(() => {});
    } catch {}
  }

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "JOIN",
          code: upperCode,
          data: {
            player,
            clientStatus: currentLocal?.status,
          },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          // Guard: if local state was already ACTIVE, never downgrade to LOBBY
          if (currentLocal?.status === "ACTIVE" && json.room.status === "LOBBY") {
            json.room.status = "ACTIVE";
          }
          await saveRoomState(json.room);
          return json.room;
        }
      }
    } catch {}
  } else {
    try {
      const { serverJoinPlayer } = await import("../server/roomStore");
      return serverJoinPlayer(upperCode, player, currentLocal?.status);
    } catch {}
  }

  const room = (await getRoomState(upperCode)) || createInitialRoom(upperCode);
  room.players[player.id] = player;
  await saveRoomState(room);
  return room;
}

/**
 * Executes a trade order in the room
 */
export async function submitOrder(
  roomCode: string,
  order: TradeOrder
): Promise<{ success: boolean; error?: string; room?: RoomState }> {
  const upperCode = roomCode.toUpperCase();

  // Instant direct Firebase order broadcast if connected
  if (typeof window !== "undefined" && isFirebaseConfigured && database) {
    try {
      const orderRef = ref(database, `rooms/${upperCode}/recentTrades/${order.id}`);
      set(orderRef, order).catch(() => {});
    } catch {}
  }

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ORDER", code: upperCode, data: order }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          await saveRoomState(json.room);
          return json;
        }
      }
    } catch (err) {
      console.warn("Server submitOrder fetch error, running local fallback:", err);
    }
  } else {
    try {
      const { serverSubmitOrder } = await import("../server/roomStore");
      return serverSubmitOrder(upperCode, order);
    } catch {}
  }

  // Fallback local execution: guarantees the student order never fails or blocks
  const existingRoom = (await getRoomState(upperCode)) || inMemoryRooms.get(upperCode);
  if (existingRoom && existingRoom.assets && existingRoom.assets[order.assetId]) {
    try {
      const { applyTradeToAsset } = await import("../engine/pricingEngine");
      const { executeTradeOnPortfolio, rankPlayers, recalculatePortfolio, validateTrade } =
        await import("../engine/portfolioCalc");

      let player = existingRoom.players[order.playerId];
      if (!player) {
        const { DESK_STARTING_PORTFOLIOS, STARTING_CASH } = await import("../constants");
        const deskSetup = DESK_STARTING_PORTFOLIOS[order.desk];
        player = {
          id: order.playerId,
          name: order.playerName,
          desk: order.desk,
          cash: deskSetup ? deskSetup.cash : STARTING_CASH,
          shares: deskSetup ? { ...deskSetup.shares } : ({} as any),
          totalNetWorth: STARTING_CASH,
          initialNetWorth: STARTING_CASH,
          returnPercent: 0,
          totalTrades: 0,
          realizedPnL: 0,
          rank: 1,
          lastActive: Date.now(),
        };
      }

      const asset = existingRoom.assets[order.assetId];
      if (!asset) return { success: false, error: "Asset not found" };

      if (existingRoom.status !== "ACTIVE") {
        return {
          success: false,
          error: existingRoom.status === "PAUSED" ? "Trading paused by instructor" : "Market is not active",
        };
      }

      const validation = validateTrade(player, asset, order.side, order.quantity);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const updatedAsset = applyTradeToAsset(asset, order);
      const updatedPlayer = executeTradeOnPortfolio(player, order);

      const updatedAssets = {
        ...existingRoom.assets,
        [asset.id]: updatedAsset,
      };

      const recalculatedPlayers: Record<string, PlayerPortfolio> = {};
      for (const pid of Object.keys(existingRoom.players)) {
        const p = pid === player.id ? updatedPlayer : existingRoom.players[pid];
        recalculatedPlayers[pid] = recalculatePortfolio(p, updatedAssets);
      }
      if (!recalculatedPlayers[player.id]) {
        recalculatedPlayers[player.id] = recalculatePortfolio(updatedPlayer, updatedAssets);
      }

      const ranked = rankPlayers(recalculatedPlayers);
      const rankedMap: Record<string, PlayerPortfolio> = {};
      ranked.forEach((p) => {
        rankedMap[p.id] = p;
      });

      const updatedTrades = [order, ...existingRoom.recentTrades].slice(0, 30);

      const updatedRoom: RoomState = {
        ...existingRoom,
        status: "ACTIVE",
        assets: updatedAssets,
        players: rankedMap,
        recentTrades: updatedTrades,
      };

      await saveRoomState(updatedRoom);
      return { success: true, room: updatedRoom };
    } catch (err) {
      console.error("Local fallback trade execution error:", err);
    }
  }

  return { success: false, error: "Network error" };
}

/**
 * Triggers a news event that shifts prices and notifies all players
 */
export async function triggerNewsEvent(
  roomCode: string,
  news: NewsEvent
): Promise<RoomState> {
  const upperCode = roomCode.toUpperCase();

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "NEWS", code: upperCode, data: news }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          await saveRoomState(json.room);
          return json.room;
        }
      }
    } catch {}
  } else {
    try {
      const { serverTriggerNews } = await import("../server/roomStore");
      return serverTriggerNews(upperCode, news);
    } catch {}
  }

  return createInitialRoom(upperCode);
}

/**
 * Advances the room to the next round or completes the game
 */
export async function advanceRound(roomCode: string): Promise<RoomState> {
  const upperCode = roomCode.toUpperCase();

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADVANCE_ROUND", code: upperCode }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          await saveRoomState(json.room);
          return json.room;
        }
      }
    } catch {}
  } else {
    try {
      const { serverAdvanceRound } = await import("../server/roomStore");
      return serverAdvanceRound(upperCode);
    } catch {}
  }

  return createInitialRoom(upperCode);
}

/**
 * Sets the room directly to any chosen round (1 to 5)
 */
export async function setRound(roomCode: string, targetRound: number): Promise<RoomState> {
  const upperCode = roomCode.toUpperCase();
  const safeRound = Math.max(1, Math.min(5, Math.floor(targetRound)));

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_ROUND", code: upperCode, data: { round: safeRound } }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          await saveRoomState(json.room);
          return json.room;
        }
      }
    } catch {}
  } else {
    try {
      const { serverSetRound } = await import("../server/roomStore");
      return serverSetRound(upperCode, safeRound);
    } catch {}
  }

  const existing = inMemoryRooms.get(upperCode) || createInitialRoom(upperCode);
  existing.currentRound = safeRound;
  existing.status = "ACTIVE";
  existing.roundTimeRemaining = existing.roundDurationSec;
  inMemoryRooms.set(upperCode, existing);
  await saveRoomState(existing);
  return existing;
}

/**
 * Spawns 30 realistic AI student classmates
 */
export async function spawnBots(roomCode: string, count: number = 30): Promise<RoomState> {
  const upperCode = roomCode.toUpperCase();

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SPAWN_BOTS", code: upperCode, data: { count } }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          await saveRoomState(json.room);
          return json.room;
        }
      }
    } catch {}
  } else {
    try {
      const { serverSpawnBots } = await import("../server/roomStore");
      return serverSpawnBots(upperCode, count);
    } catch {}
  }

  return createInitialRoom(upperCode);
}

/**
 * Updates room status (LOBBY, ACTIVE, PAUSED, ENDED) and propagates to server API and all clients
 */
export async function updateRoomStatus(
  roomCode: string,
  status: RoomState["status"]
): Promise<RoomState> {
  const upperCode = roomCode.toUpperCase();

  // Instant local memory update for zero-latency UI response
  const existing = inMemoryRooms.get(upperCode) || createInitialRoom(upperCode);
  existing.status = status;
  inMemoryRooms.set(upperCode, existing);

  // Broadcast immediate state locally right away (0ms UI latency)
  await saveRoomState(existing);

  // Direct Firebase RTDB status update if connected
  if (typeof window !== "undefined" && isFirebaseConfigured && database) {
    try {
      const statusRef = ref(database, `rooms/${upperCode}/status`);
      set(statusRef, status).catch(() => {});
    } catch {}
  }

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_STATUS", code: upperCode, data: { status } }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          // Guard: prevent cold serverless response from wiping local players/trades
          if (
            existing.players &&
            Object.keys(existing.players).length > 0 &&
            (!json.room.players || Object.keys(json.room.players).length === 0)
          ) {
            json.room.players = existing.players;
          }
          if (
            existing.recentTrades &&
            existing.recentTrades.length > 0 &&
            (!json.room.recentTrades || json.room.recentTrades.length === 0)
          ) {
            json.room.recentTrades = existing.recentTrades;
          }
          await saveRoomState(json.room);
          return json.room;
        }
      }
    } catch {}
  } else {
    try {
      const { getServerRoom, setServerRoom } = await import("../server/roomStore");
      const room = getServerRoom(upperCode);
      const updated = { ...room, status };
      setServerRoom(updated);
      await saveRoomState(updated);
      return updated;
    } catch {}
  }

  await saveRoomState(existing);
  return existing;
}

/**
 * Resets the room to initial state on server and all clients
 */
export async function resetRoomState(roomCode: string): Promise<RoomState> {
  const upperCode = roomCode.toUpperCase();
  inMemoryRooms.delete(upperCode);

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_PREFIX + upperCode);
    } catch {}
  }

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET", code: upperCode }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          await saveRoomState(json.room);
          return json.room;
        }
      }
    } catch {}
  } else {
    try {
      const { setServerRoom } = await import("../server/roomStore");
      const fresh = createInitialRoom(upperCode);
      setServerRoom(fresh);
      await saveRoomState(fresh);
      return fresh;
    } catch {}
  }

  const fresh = createInitialRoom(upperCode);
  await saveRoomState(fresh);
  return fresh;
}
