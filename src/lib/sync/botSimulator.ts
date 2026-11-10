import { AssetId, RoomState, StudentDesk, TradeOrder } from "@/types/trading";
import { getRoomState, submitOrder } from "./syncService";

let simulatorInterval: NodeJS.Timeout | null = null;

export function isBotSimulationRunning(): boolean {
  return simulatorInterval !== null;
}

export function startBotSimulation(roomCode: string, tickMs: number = 2200): void {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
  }

  simulatorInterval = setInterval(async () => {
    try {
      const room = await getRoomState(roomCode);
      if (!room || room.status !== "ACTIVE") return;

      const botPlayers = Object.values(room.players).filter((p) => p.id.startsWith("bot_"));
      if (botPlayers.length === 0) return;

      // Pick a random bot
      const bot = botPlayers[Math.floor(Math.random() * botPlayers.length)];

      const assetKeys = Object.keys(room.assets) as AssetId[];
      if (assetKeys.length === 0) return;

      // Pick an asset to trade
      let targetAsset: AssetId = assetKeys[Math.floor(Math.random() * assetKeys.length)];
      let side: "BUY" | "SELL" = Math.random() > 0.45 ? "BUY" : "SELL";

      // If there's active news, bots bias towards that news sentiment!
      if (room.currentNews) {
        const news = room.currentNews;
        if (news.affectedAsset === "ALL") {
          targetAsset = assetKeys[Math.floor(Math.random() * assetKeys.length)];
        } else if (news.affectedCompanies && news.affectedCompanies.length > 0) {
          targetAsset = news.affectedCompanies[Math.floor(Math.random() * news.affectedCompanies.length)];
        } else if (room.assets[news.affectedAsset as AssetId]) {
          targetAsset = news.affectedAsset as AssetId;
        } else {
          const matchingKeys = assetKeys.filter((k) => room.assets[k]?.category === news.affectedAsset);
          if (matchingKeys.length > 0) {
            targetAsset = matchingKeys[Math.floor(Math.random() * matchingKeys.length)];
          }
        }

        if (news.sentiment.includes("bullish")) {
          // 80% chance to buy on bullish news
          side = Math.random() < 0.8 ? "BUY" : "SELL";
        } else if (news.sentiment.includes("bearish")) {
          // 80% chance to sell on bearish news
          side = Math.random() < 0.8 ? "SELL" : "BUY";
        }
      }

      const asset = room.assets[targetAsset];
      if (!asset) return;

      // Sensible lot sizes based on stock price
      const baseLots = asset.currentPrice > 10000 ? [1, 2, 5, 8] : [5, 10, 20, 35];
      let quantity = baseLots[Math.floor(Math.random() * baseLots.length)];

      if (side === "BUY") {
        const maxAffordable = Math.floor(bot.cash / asset.currentPrice);
        if (maxAffordable < 1) return;
        quantity = Math.min(quantity, maxAffordable);
      } else {
        const holding = bot.shares[targetAsset] || 0;
        if (holding < 1) {
          // If bot has no shares to sell, switch to BUY if cash available
          if (bot.cash > asset.currentPrice) {
            side = "BUY";
            quantity = Math.min(quantity, Math.floor(bot.cash / asset.currentPrice));
          } else {
            return;
          }
        } else {
          quantity = Math.min(quantity, holding);
        }
      }

      if (quantity <= 0) return;

      const order: TradeOrder = {
        id: `bot_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        playerId: bot.id,
        playerName: bot.name,
        desk: bot.desk,
        assetId: targetAsset,
        side,
        quantity,
        price: asset.currentPrice,
        timestamp: Date.now(),
        total: Number((quantity * asset.currentPrice).toFixed(2)),
      };

      await submitOrder(roomCode, order);
    } catch (err) {
      console.error("Bot simulation tick error:", err);
    }
  }, tickMs);
}

export function stopBotSimulation(): void {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
}
