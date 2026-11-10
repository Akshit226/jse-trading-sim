import { Asset, AssetId, NewsEvent, TradeOrder } from "@/types/trading";

// Liquidity depth: how much capital needed to move price by 100%
// Calibrated for ₹10,00,000 student accounts across Mega-Cap Bluechips
export const ASSET_DEPTH: Record<AssetId, number> = {
  RELIANCE: 8000000,   // India's largest heavyweight, deep institutional liquidity
  TATAMOTORS: 4500000, // High retail momentum, responsive price action
  TCS: 7500000,        // IT titan, deep liquidity
  HDFCBANK: 7000000,   // Top private banking constituent
  INFY: 6500000,       // Active FII & domestic mutual fund trading
  ITC: 5500000,        // High-volume defensive compounder
  ZOMATO: 3200000,     // High retail beta, explosive price velocity
  ADANIENT: 4000000,   // High-beta volatility & breakout momentum
  SBIN: 5000000,       // Sovereign PSU banking liquidity
  MARUTI: 6000000,     // Auto market leader
};

export const MIN_PRICE = 10.0;

/**
 * Calculates updated asset price after an executed trade order
 */
export function applyTradeToAsset(asset: Asset, order: TradeOrder): Asset {
  const depth = ASSET_DEPTH[asset.id] || 3000000;
  const orderValue = order.quantity * asset.currentPrice;
  const rawImpact = orderValue / depth;

  // Cap maximum single trade impact at 8% to prevent single-player cornering
  const cappedImpact = Math.min(rawImpact, 0.08);
  const priceMultiplier = order.side === "BUY" ? 1 + cappedImpact : 1 - cappedImpact;

  const newPrice = Math.max(MIN_PRICE, Number((asset.currentPrice * priceMultiplier).toFixed(2)));
  const newVolume = asset.volume + order.quantity;
  const baseline = asset.roundOpenPrice || asset.basePrice;
  const changePercent = Number((((newPrice - baseline) / baseline) * 100).toFixed(2));

  const updatedHistory = [
    ...asset.historicalPrices,
    { time: Date.now(), price: newPrice },
  ].slice(-60); // keep last 60 ticks for smooth chart

  return {
    ...asset,
    currentPrice: newPrice,
    changePercent,
    dayHigh: Math.max(asset.dayHigh, newPrice),
    dayLow: Math.min(asset.dayLow, newPrice),
    volume: newVolume,
    historicalPrices: updatedHistory,
  };
}

/**
 * Applies a macro or corporate breaking news event to the asset
 */
export function applyNewsToAsset(asset: Asset, news: NewsEvent): Asset {
  let impact = 0;

  if (news.affectedAsset === "ALL") {
    impact = news.priceImpact;
  } else if (news.affectedCompanies && news.affectedCompanies.includes(asset.id)) {
    impact = news.priceImpact;
  } else if (news.affectedAsset === asset.category) {
    impact = news.priceImpact;
  } else if (news.affectedAsset === asset.id) {
    impact = news.priceImpact;
  } else {
    // Other assets unaffected directly
    return asset;
  }

  const newPrice = Math.max(MIN_PRICE, Number((asset.currentPrice * (1 + impact)).toFixed(2)));
  const baseline = asset.roundOpenPrice || asset.basePrice;
  const changePercent = Number((((newPrice - baseline) / baseline) * 100).toFixed(2));

  const updatedHistory = [
    ...asset.historicalPrices,
    { time: Date.now(), price: newPrice },
  ].slice(-60);

  return {
    ...asset,
    currentPrice: newPrice,
    changePercent,
    dayHigh: Math.max(asset.dayHigh, newPrice),
    dayLow: Math.min(asset.dayLow, newPrice),
    historicalPrices: updatedHistory,
  };
}

/**
 * Generates an organic micro-tick jitter for live charts when idle
 */
export function generateOrganicTick(asset: Asset): Asset {
  // -0.2% to +0.2% random market jitter
  const delta = (Math.random() - 0.49) * 0.004;
  const newPrice = Math.max(MIN_PRICE, Number((asset.currentPrice * (1 + delta)).toFixed(2)));
  const baseline = asset.roundOpenPrice || asset.basePrice;
  const changePercent = Number((((newPrice - baseline) / baseline) * 100).toFixed(2));

  const updatedHistory = [
    ...asset.historicalPrices,
    { time: Date.now(), price: newPrice },
  ].slice(-60);

  return {
    ...asset,
    currentPrice: newPrice,
    changePercent,
    dayHigh: Math.max(asset.dayHigh, newPrice),
    dayLow: Math.min(asset.dayLow, newPrice),
    historicalPrices: updatedHistory,
  };
}
