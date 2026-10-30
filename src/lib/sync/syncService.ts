import { database, isFirebaseConfigured } from "../firebase";
import { ref, onValue, set, get } from "firebase/database";
import {
  AssetId,
  NewsEvent,
  PlayerPortfolio,
  RoomState,
  TradeOrder,
} from "@/types/trading";
import {
  DEFAULT_ROUND_DURATION,
  INITIAL_ASSETS,
  TOTAL_ROUNDS,
} from "../constants";

const STORAGE_PREFIX = "trading_sim_room_";
const inMemoryRooms = new Map<string, RoomState>();
type RoomListener = (room: RoomState) => void;
const inPageListeners = new Map<string, Set<RoomListener>>();

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
        return snapshot.val() as RoomState;
      }
    } catch (err) {
      console.error("Firebase getRoomState error:", err);
    }
  }

  // Fetch from server API if in browser
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/room?code=${upperCode}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          inMemoryRooms.set(upperCode, json.room);
          return json.room as RoomState;
        }
      }
    } catch {}

    const raw = localStorage.getItem(STORAGE_PREFIX + upperCode);
    if (raw) {
      try {
        return JSON.parse(raw) as RoomState;
      } catch {}
    }
  } else {
    // Pure Node.js environment
    try {
      const { getServerRoom } = await import("../server/roomStore");
      return getServerRoom(upperCode);
    } catch {}
  }

  return inMemoryRooms.get(upperCode) || null;
}

/**
 * Persists room state
 */
export async function saveRoomState(room: RoomState): Promise<void> {
  const upperCode = room.code.toUpperCase();
  inMemoryRooms.set(upperCode, room);

  // Notify local in-page subscribers immediately
  const listeners = inPageListeners.get(upperCode);
  if (listeners) {
    listeners.forEach((fn) => {
      try {
        fn(room);
      } catch (err) {
        console.error("Local listener error:", err);
      }
    });
  }

  // 1. Firebase sync if available
  if (isFirebaseConfigured && database) {
    try {
      const roomRef = ref(database, `rooms/${upperCode}`);
      await set(roomRef, room);
    } catch (err) {
      console.error("Firebase saveRoomState error:", err);
    }
  }

  // 2. BroadcastChannel & LocalStorage sync
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_PREFIX + upperCode, JSON.stringify(room));
      const channel = new BroadcastChannel("trading_sim_" + upperCode);
      channel.postMessage({ type: "ROOM_UPDATED", room });
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

  // Register in-page listener
  if (!inPageListeners.has(upperCode)) {
    inPageListeners.set(upperCode, new Set());
  }
  inPageListeners.get(upperCode)!.add(onUpdate);

  if (isFirebaseConfigured && database) {
    const roomRef = ref(database, `rooms/${upperCode}`);
    const unsubscribeFirebase = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.val() as RoomState);
      }
    });
    return () => {
      inPageListeners.get(upperCode)?.delete(onUpdate);
      unsubscribeFirebase();
    };
  }

  if (typeof window !== "undefined") {
    // 1. Initial load from API
    getRoomState(upperCode).then((existing) => {
      if (existing) onUpdate(existing);
    });

    // 2. Multi-device polling interval (enables phones to sync with laptop projector over Wi-Fi!)
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/room?code=${upperCode}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.room) {
            onUpdate(json.room);
          }
        }
      } catch {}
    }, 1200);

    // 3. BroadcastChannel for same-browser instant sync
    const channel = new BroadcastChannel("trading_sim_" + upperCode);
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "ROOM_UPDATED" && e.data?.room) {
        onUpdate(e.data.room);
      }
    };
    channel.addEventListener("message", handleMessage);

    return () => {
      inPageListeners.get(upperCode)?.delete(onUpdate);
      clearInterval(pollInterval);
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }

  // Fallback for SSR
  getRoomState(upperCode).then((existing) => {
    if (existing) onUpdate(existing);
  });

  return () => {
    inPageListeners.get(upperCode)?.delete(onUpdate);
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

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "JOIN", code: upperCode, data: player }),
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
      const { serverJoinPlayer } = await import("../server/roomStore");
      return serverJoinPlayer(upperCode, player);
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
        }
        return json;
      }
    } catch {}
  } else {
    try {
      const { serverSubmitOrder } = await import("../server/roomStore");
      return serverSubmitOrder(upperCode, order);
    } catch {}
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

  const local = inMemoryRooms.get(upperCode) || createInitialRoom(upperCode);
  local.status = status;
  await saveRoomState(local);
  return local;
}

/**
 * Resets the room to initial state on server and all clients
 */
export async function resetRoomState(roomCode: string): Promise<RoomState> {
  const upperCode = roomCode.toUpperCase();

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
