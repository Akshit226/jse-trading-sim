import fs from "fs";
import path from "path";
import os from "os";
import {
  Asset,
  AssetId,
  NewsEvent,
  PlayerPortfolio,
  RoomState,
  StudentDesk,
  TradeOrder,
} from "../../types/trading";
import {
  DEFAULT_ROUND_DURATION,
  DESK_STARTING_PORTFOLIOS,
  INITIAL_ASSETS,
  STARTING_CASH,
  TOTAL_ROUNDS,
} from "../constants";
import { applyNewsToAsset, applyTradeToAsset } from "../engine/pricingEngine";
import {
  executeTradeOnPortfolio,
  rankPlayers,
  recalculatePortfolio,
  validateTrade,
} from "../engine/portfolioCalc";

// Global server in-memory store (persists across API route calls in Node/dev/start)
declare global {
  // eslint-disable-next-line no-var
  var globalRoomStore: Map<string, RoomState> | undefined;
}

const rooms = globalThis.globalRoomStore || new Map<string, RoomState>();
if (!globalThis.globalRoomStore) {
  globalThis.globalRoomStore = rooms;
}

function getRoomFilePath(upper: string): string {
  const tmpDir = os.tmpdir();
  return path.join(tmpDir, `jse_room_${upper}.json`);
}

function readRoomFromDisk(upper: string): RoomState | null {
  try {
    const file = getRoomFilePath(upper);
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      if (content) {
        return JSON.parse(content) as RoomState;
      }
    }
  } catch {}
  return null;
}

const FIREBASE_DB_URL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  "https://jse-trading-sim-default-rtdb.firebaseio.com";

export async function fetchRemoteRoom(upper: string): Promise<RoomState | null> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/rooms/${upper}.json`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.code && !data.error) {
        return data as RoomState;
      }
    }
  } catch {}
  return null;
}

export function pushRemoteRoom(room: RoomState): void {
  try {
    fetch(`${FIREBASE_DB_URL}/rooms/${room.code.toUpperCase()}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(room),
    }).catch(() => {});
  } catch {}
}

function persistRoomToDisk(room: RoomState): void {
  try {
    const file = getRoomFilePath(room.code.toUpperCase());
    fs.writeFileSync(file, JSON.stringify(room), "utf8");
  } catch {}
}

export function getServerRoom(code: string): RoomState {
  const upper = code.toUpperCase();
  if (rooms.has(upper)) {
    return rooms.get(upper)!;
  }

  // Attempt to load from disk in serverless containers
  const diskRoom = readRoomFromDisk(upper);
  if (diskRoom) {
    rooms.set(upper, diskRoom);
    return diskRoom;
  }

  const newRoom: RoomState = {
    code: upper,
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
  rooms.set(upper, newRoom);
  persistRoomToDisk(newRoom);
  return newRoom;
}

export function setServerRoom(room: RoomState): void {
  const upper = room.code.toUpperCase();
  rooms.set(upper, room);
  persistRoomToDisk(room);
  pushRemoteRoom(room);
}

export function serverJoinPlayer(
  code: string,
  player: PlayerPortfolio,
  clientStatus?: RoomState["status"]
): RoomState {
  const room = getServerRoom(code);

  // If new player has no shares yet, grant the initial asymmetric desk portfolio
  let playerToSave = player;
  const deskSetup = DESK_STARTING_PORTFOLIOS[player.desk];
  const hasZeroShares =
    !player.shares ||
    Object.values(player.shares).every((qty) => qty === 0);

  if (hasZeroShares && deskSetup) {
    playerToSave = {
      ...player,
      cash: deskSetup.cash,
      shares: { ...deskSetup.shares },
      totalNetWorth: STARTING_CASH,
      initialNetWorth: STARTING_CASH,
      returnPercent: 0,
    };
  }

  const updatedPlayers = {
    ...room.players,
    [playerToSave.id]: recalculatePortfolio(playerToSave, room.assets),
  };

  const ranked = rankPlayers(updatedPlayers);
  const map: Record<string, PlayerPortfolio> = {};
  ranked.forEach((p) => {
    map[p.id] = p;
  });

  // Preserve status: Never downgrade an ACTIVE or PAUSED room back to LOBBY
  let resolvedStatus = room.status;
  if (clientStatus === "ACTIVE" && resolvedStatus === "LOBBY") {
    resolvedStatus = "ACTIVE";
  }

  const updated: RoomState = {
    ...room,
    status: resolvedStatus,
    players: map,
  };
  setServerRoom(updated);
  return updated;
}

export function serverSubmitOrder(
  code: string,
  order: TradeOrder
): { success: boolean; error?: string; room?: RoomState } {
  const room = getServerRoom(code);
  let player = room.players[order.playerId];

  // Auto-register student if missing in this container instance
  if (!player) {
    const desk = order.desk || "tech_analyst";
    const deskSetup = DESK_STARTING_PORTFOLIOS[desk];
    player = {
      id: order.playerId,
      name: order.playerName || "Student Trader",
      desk,
      cash: deskSetup ? deskSetup.cash : STARTING_CASH,
      shares: deskSetup ? { ...deskSetup.shares } : {
        MPHASIS: 0,
        COFORGE: 0,
        OFSS: 0,
        LTTS: 0,
        TATAELXSI: 0,
        COLPAL: 0,
        PGHH: 0,
        RADICO: 0,
        UBL: 0,
        GILLETTE: 0,
      },
      totalNetWorth: STARTING_CASH,
      initialNetWorth: STARTING_CASH,
      returnPercent: 0,
      totalTrades: 0,
      realizedPnL: 0,
      rank: 1,
      lastActive: Date.now(),
    };
    room.players[order.playerId] = player;
  }

  const asset = room.assets[order.assetId];
  if (!asset) return { success: false, error: "Asset not found" };

  const validation = validateTrade(player, asset, order.side, order.quantity);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const updatedAsset = applyTradeToAsset(asset, order);
  const updatedPlayer = executeTradeOnPortfolio(player, order);

  const updatedAssets = {
    ...room.assets,
    [asset.id]: updatedAsset,
  };

  const recalculatedPlayers: Record<string, PlayerPortfolio> = {};
  for (const pid of Object.keys(room.players)) {
    const p = pid === player.id ? updatedPlayer : room.players[pid];
    recalculatedPlayers[pid] = recalculatePortfolio(p, updatedAssets);
  }

  const ranked = rankPlayers(recalculatedPlayers);
  const rankedMap: Record<string, PlayerPortfolio> = {};
  ranked.forEach((p) => {
    rankedMap[p.id] = p;
  });

  const updatedTrades = [order, ...room.recentTrades].slice(0, 30);

  // If order is placed in round 1+, market is actively trading
  const status = room.status === "PAUSED" ? "PAUSED" : "ACTIVE";

  const updatedRoom: RoomState = {
    ...room,
    status,
    assets: updatedAssets,
    players: rankedMap,
    recentTrades: updatedTrades,
  };

  setServerRoom(updatedRoom);
  return { success: true, room: updatedRoom };
}

export function serverTriggerNews(code: string, news: NewsEvent): RoomState {
  const room = getServerRoom(code);
  const timestampedNews = { ...news, timestamp: Date.now() };

  const updatedAssets = { ...room.assets };
  for (const assetId of Object.keys(updatedAssets) as AssetId[]) {
    updatedAssets[assetId] = applyNewsToAsset(updatedAssets[assetId], timestampedNews);
  }

  const recalculatedPlayers: Record<string, PlayerPortfolio> = {};
  for (const pid of Object.keys(room.players)) {
    recalculatedPlayers[pid] = recalculatePortfolio(room.players[pid], updatedAssets);
  }

  const ranked = rankPlayers(recalculatedPlayers);
  const rankedMap: Record<string, PlayerPortfolio> = {};
  ranked.forEach((p) => {
    rankedMap[p.id] = p;
  });

  const updatedRoom: RoomState = {
    ...room,
    currentNews: timestampedNews,
    newsHistory: [timestampedNews, ...room.newsHistory].slice(0, 20),
    assets: updatedAssets,
    players: rankedMap,
  };

  setServerRoom(updatedRoom);
  return updatedRoom;
}

/**
 * Advances the round with the strict rule:
 * "THE OPENING PRICE WILL BE DECIDED BY THE PREVIOUS CLOSING PRICE"
 */
export function serverAdvanceRound(code: string): RoomState {
  const room = getServerRoom(code);
  const nextRound = room.currentRound + 1;
  const isEnded = nextRound > room.totalRounds;

  // Carry over previous closing price as the new round's opening price
  const updatedAssets = { ...room.assets };
  for (const aid of Object.keys(updatedAssets) as AssetId[]) {
    const asset = updatedAssets[aid];
    const prevClose = asset.currentPrice;
    updatedAssets[aid] = {
      ...asset,
      previousClosePrice: prevClose,
      roundOpenPrice: prevClose,
      basePrice: prevClose, // Reset round reference price
      changePercent: 0,
      historicalPrices: [
        ...asset.historicalPrices,
        { time: Date.now(), price: prevClose },
      ].slice(-60),
    };
  }

  const recalculatedPlayers: Record<string, PlayerPortfolio> = {};
  for (const pid of Object.keys(room.players)) {
    recalculatedPlayers[pid] = recalculatePortfolio(room.players[pid], updatedAssets);
  }

  const ranked = rankPlayers(recalculatedPlayers);
  const rankedMap: Record<string, PlayerPortfolio> = {};
  ranked.forEach((p) => {
    rankedMap[p.id] = p;
  });

  const updatedRoom: RoomState = {
    ...room,
    currentRound: isEnded ? room.totalRounds : nextRound,
    status: isEnded ? "ENDED" : "ACTIVE",
    roundTimeRemaining: room.roundDurationSec,
    currentNews: null,
    assets: updatedAssets,
    players: rankedMap,
  };

  setServerRoom(updatedRoom);
  return updatedRoom;
}

export function serverSpawnBots(code: string, count: number = 30): RoomState {
  const room = getServerRoom(code);

  const indianNames = [
    "Aarav Sharma", "Diya Patel", "Vihaan Rao", "Ananya Iyer", "Kabir Mehta",
    "Ishaan Gupta", "Riya Sen", "Advait Joshi", "Saanvi Nair", "Aryan Verma",
    "Meera Reddy", "Reyansh Das", "Prisha Kapoor", "Aditya Agarwal", "Tanvi Bhat",
    "Dev Singhania", "Anika Choudhury", "Yash Malhotra", "Sara Menon", "Rohan Bansal",
    "Tara Saxena", "Shaurya Deshmukh", "Navya Pillai", "Arjun Nambiar", "Avani Shah",
    "Dhruv Trivedi", "Kaira Mukherjee", "Vivaan Chopra", "Siya Tiwari", "Veer Kulkarni"
  ];

  const desks: StudentDesk[] = [
    "tech_analyst",
    "fmcg_consumer",
    "institutional_fii",
    "retail_momentum",
  ];

  const currentPlayers = { ...room.players };

  for (let i = 0; i < count; i++) {
    const id = `bot_${i + 1}`;
    if (!currentPlayers[id]) {
      const desk = desks[i % desks.length];
      const deskShort =
        desk === "tech_analyst"
          ? "IT"
          : desk === "fmcg_consumer"
          ? "FMCG"
          : desk === "institutional_fii"
          ? "FII"
          : "MOMENTUM";
      const name = `${indianNames[i % indianNames.length]} (${deskShort})`;
      const deskSetup = DESK_STARTING_PORTFOLIOS[desk];

      currentPlayers[id] = {
        id,
        name,
        desk,
        cash: deskSetup.cash,
        shares: { ...deskSetup.shares },
        totalNetWorth: STARTING_CASH,
        initialNetWorth: STARTING_CASH,
        returnPercent: 0,
        totalTrades: 0,
        realizedPnL: 0,
        rank: i + 1,
        lastActive: Date.now(),
      };
    }
  }

  // Recalculate and rank
  const recalculated: Record<string, PlayerPortfolio> = {};
  for (const pid of Object.keys(currentPlayers)) {
    recalculated[pid] = recalculatePortfolio(currentPlayers[pid], room.assets);
  }

  const ranked = rankPlayers(recalculated);
  const rankedMap: Record<string, PlayerPortfolio> = {};
  ranked.forEach((p) => {
    rankedMap[p.id] = p;
  });

  const updatedRoom: RoomState = {
    ...room,
    players: rankedMap,
  };

  setServerRoom(updatedRoom);
  return updatedRoom;
}
