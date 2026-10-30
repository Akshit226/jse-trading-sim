import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { INITIAL_ASSETS, STARTING_CASH, DESK_STARTING_PORTFOLIOS } from "../lib/constants";
import { applyNewsToAsset, applyTradeToAsset } from "../lib/engine/pricingEngine";
import {
  executeTradeOnPortfolio,
  recalculatePortfolio,
  rankPlayers,
  validateTrade,
} from "../lib/engine/portfolioCalc";
import { PRESET_NEWS_SCENARIOS } from "../lib/engine/newsScenarios";
import { PlayerPortfolio, TradeOrder } from "../types/trading";

describe("Trading Simulation Core Engine (Indian Stocks & ₹ INR)", () => {
  const initialDesk = DESK_STARTING_PORTFOLIOS.tech_analyst;
  const mockPlayer: PlayerPortfolio = {
    id: "p1",
    name: "Aarav Sharma",
    desk: "tech_analyst",
    cash: initialDesk.cash,
    shares: { ...initialDesk.shares },
    totalNetWorth: STARTING_CASH,
    initialNetWorth: STARTING_CASH,
    returnPercent: 0,
    totalTrades: 0,
    realizedPnL: 0,
    rank: 1,
    lastActive: Date.now(),
  };

  it("should validate buy order with sufficient funds", () => {
    const asset = INITIAL_ASSETS.MPHASIS;
    const result = validateTrade(mockPlayer, asset, "BUY", 10);
    assert.equal(result.valid, true);
    assert.equal(result.total, 28500); // 10 * ₹2,850
  });

  it("should reject buy order when cash is insufficient", () => {
    const asset = INITIAL_ASSETS.PGHH;
    // 1000 shares * ₹15,800 = ₹1,58,00,000 (exceeds cash)
    const result = validateTrade(mockPlayer, asset, "BUY", 1000);
    assert.equal(result.valid, false);
    assert.match(result.error || "", /Insufficient cash/i);
  });

  it("should reject sell order when holding is insufficient", () => {
    const asset = INITIAL_ASSETS.COLPAL;
    // Tech desk starts with 0 shares of COLPAL
    const result = validateTrade(mockPlayer, asset, "SELL", 10);
    assert.equal(result.valid, false);
    assert.match(result.error || "", /Insufficient shares/i);
  });

  it("should execute buy order and correctly deduct cash and add shares", () => {
    const asset = INITIAL_ASSETS.MPHASIS;
    const initialShares = mockPlayer.shares.MPHASIS;
    const initialCash = mockPlayer.cash;

    const order: TradeOrder = {
      id: "ord-1",
      playerId: mockPlayer.id,
      playerName: mockPlayer.name,
      desk: mockPlayer.desk,
      assetId: "MPHASIS",
      side: "BUY",
      quantity: 10,
      price: asset.currentPrice,
      timestamp: Date.now(),
      total: 28500,
    };

    const updatedPlayer = executeTradeOnPortfolio(mockPlayer, order);
    assert.equal(updatedPlayer.cash, initialCash - 28500);
    assert.equal(updatedPlayer.shares.MPHASIS, initialShares + 10);
    assert.equal(updatedPlayer.totalTrades, 1);
  });

  it("should move asset price dynamically upward on buy volume", () => {
    const asset = { ...INITIAL_ASSETS.COFORGE };
    const order: TradeOrder = {
      id: "ord-2",
      playerId: "p1",
      playerName: "Aarav",
      desk: "tech_analyst",
      assetId: "COFORGE",
      side: "BUY",
      quantity: 50,
      price: 7600,
      timestamp: Date.now(),
      total: 380000,
    };

    const updatedAsset = applyTradeToAsset(asset, order);
    assert.ok(updatedAsset.currentPrice > 7600, "Price should increase after BUY");
    assert.equal(updatedAsset.volume, 50);
  });

  it("should apply breaking news impact correctly to Indian stocks", () => {
    const asset = { ...INITIAL_ASSETS.TATAELXSI };
    const news = PRESET_NEWS_SCENARIOS[0]; // +18% on TATAELXSI
    const updatedAsset = applyNewsToAsset(asset, news);

    assert.ok(updatedAsset.currentPrice > 7100);
    assert.equal(updatedAsset.currentPrice, Number((7100 * 1.18).toFixed(2)));
  });

  it("should recalculate portfolio and accurately rank players in ₹ INR", () => {
    const p1: PlayerPortfolio = {
      ...mockPlayer,
      id: "p1",
      name: "Player 1",
      cash: 500000,
      shares: { ...initialDesk.shares },
    };

    const p2: PlayerPortfolio = {
      ...mockPlayer,
      id: "p2",
      name: "Player 2",
      cash: 1200000,
      shares: {
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
    };

    const assets = { ...INITIAL_ASSETS };
    const recalcP1 = recalculatePortfolio(p1, assets);
    const recalcP2 = recalculatePortfolio(p2, assets);

    const ranked = rankPlayers({ p1: recalcP1, p2: recalcP2 });
    assert.equal(ranked.length, 2);
    assert.equal(ranked[0].rank, 1);
    assert.equal(ranked[1].rank, 2);
    assert.ok(ranked[0].totalNetWorth >= ranked[1].totalNetWorth);
  });
});
