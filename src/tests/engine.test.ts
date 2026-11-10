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
    const asset = INITIAL_ASSETS.TCS;
    const result = validateTrade(mockPlayer, asset, "BUY", 10);
    assert.equal(result.valid, true);
    assert.equal(result.total, 41500); // 10 * ₹4,150
  });

  it("should reject buy order when cash is insufficient", () => {
    const asset = INITIAL_ASSETS.MARUTI;
    // 1000 shares * ₹12,400 = ₹1,24,00,000 (exceeds cash)
    const result = validateTrade(mockPlayer, asset, "BUY", 1000);
    assert.equal(result.valid, false);
    assert.match(result.error || "", /Insufficient cash/i);
  });

  it("should reject sell order when holding is insufficient", () => {
    const asset = INITIAL_ASSETS.HDFCBANK;
    // Tech desk starts with 0 shares of HDFCBANK
    const result = validateTrade(mockPlayer, asset, "SELL", 10);
    assert.equal(result.valid, false);
    assert.match(result.error || "", /Insufficient shares/i);
  });

  it("should execute buy order and correctly deduct cash and add shares", () => {
    const asset = INITIAL_ASSETS.TCS;
    const initialShares = mockPlayer.shares.TCS;
    const initialCash = mockPlayer.cash;

    const order: TradeOrder = {
      id: "ord-1",
      playerId: mockPlayer.id,
      playerName: mockPlayer.name,
      desk: mockPlayer.desk,
      assetId: "TCS",
      side: "BUY",
      quantity: 10,
      price: asset.currentPrice,
      timestamp: Date.now(),
      total: 41500,
    };

    const updatedPlayer = executeTradeOnPortfolio(mockPlayer, order);
    assert.equal(updatedPlayer.cash, initialCash - 41500);
    assert.equal(updatedPlayer.shares.TCS, initialShares + 10);
    assert.equal(updatedPlayer.totalTrades, 1);
  });

  it("should move asset price dynamically upward on buy volume", () => {
    const asset = { ...INITIAL_ASSETS.RELIANCE };
    const order: TradeOrder = {
      id: "ord-2",
      playerId: "p1",
      playerName: "Aarav",
      desk: "tech_analyst",
      assetId: "RELIANCE",
      side: "BUY",
      quantity: 50,
      price: 2950,
      timestamp: Date.now(),
      total: 147500,
    };

    const updatedAsset = applyTradeToAsset(asset, order);
    assert.ok(updatedAsset.currentPrice > 2950, "Price should increase after BUY");
    assert.equal(updatedAsset.volume, 50);
  });

  it("should apply breaking news impact correctly to Indian stocks", () => {
    const asset = { ...INITIAL_ASSETS.TATAMOTORS };
    const news = PRESET_NEWS_SCENARIOS[0]; // +22% on TATAMOTORS
    const updatedAsset = applyNewsToAsset(asset, news);

    assert.ok(updatedAsset.currentPrice > 980);
    assert.equal(updatedAsset.currentPrice, Number((980 * 1.22).toFixed(2)));
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
        RELIANCE: 0,
        TATAMOTORS: 0,
        TCS: 0,
        HDFCBANK: 0,
        INFY: 0,
        ITC: 0,
        ZOMATO: 0,
        ADANIENT: 0,
        SBIN: 0,
        MARUTI: 0,
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
