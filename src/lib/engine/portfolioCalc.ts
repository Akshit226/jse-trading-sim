import { Asset, AssetId, PlayerPortfolio, TradeOrder } from "@/types/trading";
import { formatINR } from "../constants";

export function validateTrade(
  portfolio: PlayerPortfolio,
  asset: Asset,
  side: "BUY" | "SELL",
  quantity: number
): { valid: boolean; error?: string; total: number } {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { valid: false, error: "Quantity must be a positive whole number", total: 0 };
  }

  const total = Number((quantity * asset.currentPrice).toFixed(2));

  if (side === "BUY") {
    if (portfolio.cash < total) {
      return {
        valid: false,
        error: `Insufficient cash. Need ${formatINR(total)}, but have ${formatINR(portfolio.cash)}`,
        total,
      };
    }
  } else {
    const currentHolding = portfolio.shares[asset.id] || 0;
    if (currentHolding < quantity) {
      return {
        valid: false,
        error: `Insufficient shares. Attempted to sell ${quantity}, but hold ${currentHolding}`,
        total,
      };
    }
  }

  return { valid: true, total };
}

export function executeTradeOnPortfolio(
  portfolio: PlayerPortfolio,
  order: TradeOrder
): PlayerPortfolio {
  const updatedShares = { ...portfolio.shares };
  const currentShares = updatedShares[order.assetId] || 0;

  let newCash = portfolio.cash;
  let realizedPnL = portfolio.realizedPnL;

  if (order.side === "BUY") {
    newCash = Number((newCash - order.total).toFixed(2));
    updatedShares[order.assetId] = currentShares + order.quantity;
  } else {
    newCash = Number((newCash + order.total).toFixed(2));
    updatedShares[order.assetId] = Math.max(0, currentShares - order.quantity);
  }

  return {
    ...portfolio,
    cash: newCash,
    shares: updatedShares,
    totalTrades: portfolio.totalTrades + 1,
    realizedPnL,
    lastActive: Date.now(),
  };
}

export function recalculatePortfolio(
  portfolio: PlayerPortfolio,
  assets: Record<AssetId, Asset>
): PlayerPortfolio {
  let holdingsValue = 0;

  for (const assetId of Object.keys(portfolio.shares) as AssetId[]) {
    const qty = portfolio.shares[assetId] || 0;
    const price = assets[assetId]?.currentPrice || 0;
    holdingsValue += qty * price;
  }

  const totalNetWorth = Number((portfolio.cash + holdingsValue).toFixed(2));
  const returnPercent = Number(
    (((totalNetWorth - portfolio.initialNetWorth) / portfolio.initialNetWorth) * 100).toFixed(2)
  );

  return {
    ...portfolio,
    totalNetWorth,
    returnPercent,
  };
}

export function rankPlayers(
  players: Record<string, PlayerPortfolio>
): PlayerPortfolio[] {
  const sorted = Object.values(players).sort(
    (a, b) => b.totalNetWorth - a.totalNetWorth
  );

  return sorted.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
}
