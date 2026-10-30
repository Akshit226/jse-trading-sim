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

export function getServerRoom(code: string): RoomState {
  const upper = code.toUpperCase();
  if (!rooms.has(upper)) {
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
  }
  return rooms.get(upper)!;
}

export function setServerRoom(room: RoomState): void {
  rooms.set(room.code.toUpperCase(), room);
}

export function serverJoinPlayer(code: string, player: PlayerPortfolio): RoomState {
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

  const updated: RoomState = {
    ...room,
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
  const player = room.players[order.playerId];
  if (!player) return { success: false, error: "Player not registered in this room" };

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

  const updatedRoom: RoomState = {
    ...room,
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
