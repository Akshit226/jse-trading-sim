import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createInitialRoom,
  joinPlayer,
  submitOrder,
  triggerNewsEvent,
  spawnBots,
  advanceRound,
  updateRoomStatus,
  resetRoomState,
} from "../lib/sync/syncService";
import { PRESET_NEWS_SCENARIOS } from "../lib/engine/newsScenarios";
import { PlayerPortfolio, TradeOrder } from "../types/trading";
import { DESK_STARTING_PORTFOLIOS, STARTING_CASH } from "../lib/constants";

describe("Room Synchronization and Multi-User Flow (Indian Stocks)", () => {
  const roomCode = "INDRM1";

  it("should create initial room state with 10 Indian stocks and empty players", () => {
    const room = createInitialRoom(roomCode);
    assert.equal(room.code, "INDRM1");
    assert.equal(room.status, "LOBBY");
    assert.equal(Object.keys(room.assets).length, 10);
    assert.ok(room.assets.MPHASIS);
    assert.ok(room.assets.COFORGE);
    assert.ok(room.assets.COLPAL);
    assert.ok(room.assets.TATAELXSI);
    assert.equal(Object.keys(room.players).length, 0);
  });

  it("should register a student player into the room with asymmetric desk holdings", async () => {
    const techSetup = DESK_STARTING_PORTFOLIOS.tech_analyst;
    const student: PlayerPortfolio = {
      id: "std-1",
      name: "Arjun Nambiar",
      desk: "tech_analyst",
      cash: techSetup.cash,
      shares: { ...techSetup.shares },
      totalNetWorth: STARTING_CASH,
      initialNetWorth: STARTING_CASH,
      returnPercent: 0,
      totalTrades: 0,
      realizedPnL: 0,
      rank: 1,
      lastActive: Date.now(),
    };

    const room = await joinPlayer(roomCode, student);
    assert.ok(room.players["std-1"]);
    assert.equal(room.players["std-1"].name, "Arjun Nambiar");
    assert.equal(room.players["std-1"].shares.MPHASIS, 25);
  });

  it("should spawn 30 AI classmates with Indian names and desk portfolios", async () => {
    const room = await spawnBots(roomCode, 30);
    assert.ok(Object.keys(room.players).length >= 31);
    const firstBot = Object.values(room.players).find((p) => p.id.startsWith("bot_"));
    assert.ok(firstBot);
    assert.ok(firstBot.totalNetWorth > 0);
  });

  it("should update room status to ACTIVE and allow order submission", async () => {
    const updatedRoom = await updateRoomStatus(roomCode, "ACTIVE");
    assert.equal(updatedRoom.status, "ACTIVE");

    const order: TradeOrder = {
      id: "ord-test-1",
      playerId: "std-1",
      playerName: "Arjun Nambiar",
      desk: "tech_analyst",
      assetId: "MPHASIS",
      side: "BUY",
      quantity: 10,
      price: 2850,
      timestamp: Date.now(),
      total: 28500,
    };

    const result = await submitOrder(roomCode, order);
    assert.equal(result.success, true);
    assert.ok(result.room);

    const updatedStudent = result.room!.players["std-1"];
    assert.equal(updatedStudent.shares.MPHASIS, 35);
    assert.equal(updatedStudent.totalTrades, 1);
  });

  it("should trigger breaking news and impact asset prices across the room", async () => {
    const news = PRESET_NEWS_SCENARIOS[0]; // Tata Elxsi +18%
    const updatedRoom = await triggerNewsEvent(roomCode, news);

    assert.equal(updatedRoom.currentNews?.id, news.id);
    assert.ok(updatedRoom.assets.TATAELXSI.currentPrice > 7100);
  });

  it("should advance rounds properly locking previous close as new open price", async () => {
    await resetRoomState(roomCode);
    const advanced = await advanceRound(roomCode);
    assert.equal(advanced.currentRound, 2);
    assert.equal(advanced.status, "ACTIVE");

    // "THE OPENING PRICE WILL BE DECIDED BY THE PREVIOUS CLOSING PRICE"
    const mphasisAsset = advanced.assets.MPHASIS;
    assert.equal(mphasisAsset.roundOpenPrice, mphasisAsset.currentPrice);
    assert.equal(mphasisAsset.previousClosePrice, mphasisAsset.currentPrice);
    assert.equal(mphasisAsset.changePercent, 0);
  });
});
