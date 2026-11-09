"use client";

import React, { useState } from "react";
import { Asset, AssetId, PlayerPortfolio, RoomState, TradeOrder } from "@/types/trading";
import { sounds } from "@/lib/audio";
import { formatINR, DESK_METADATA, getCompanyIndustry, getCompanySubSector } from "@/lib/constants";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface TradePadProps {
  player: PlayerPortfolio;
  room: RoomState;
  onTrade: (order: TradeOrder) => Promise<{ success: boolean; error?: string }>;
  selectedAssetId?: AssetId;
  onSelectAsset?: (assetId: AssetId) => void;
  compact?: boolean;
}

export const TradePad: React.FC<TradePadProps> = ({
  player,
  room,
  onTrade,
  selectedAssetId: externalAssetId,
  onSelectAsset,
  compact = false,
}) => {
  const [internalAssetId, setInternalAssetId] = useState<AssetId>("MPHASIS");
  const selectedAssetId = externalAssetId || internalAssetId;

  const asset = room.assets?.[selectedAssetId];

  // Buy / Sell segmented control
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExecutedPulse, setIsExecutedPulse] = useState(false);

  const holding = (asset && player.shares[selectedAssetId]) || 0;
  const currentPrice = asset?.currentPrice || 0;
  const [prevPrice, setPrevPrice] = useState(currentPrice);
  const [priceAnim, setPriceAnim] = useState<"gain" | "loss" | null>(null);

  React.useEffect(() => {
    if (currentPrice > 0 && prevPrice > 0 && currentPrice !== prevPrice) {
      setPriceAnim(currentPrice > prevPrice ? "gain" : "loss");
      setPrevPrice(currentPrice);
      const timer = setTimeout(() => setPriceAnim(null), 400);
      return () => clearTimeout(timer);
    } else if (currentPrice !== prevPrice) {
      setPrevPrice(currentPrice);
    }
  }, [currentPrice, prevPrice]);
  const estimatedTotal = Number((quantity * currentPrice).toFixed(2));
  const maxBuyAffordable = currentPrice > 0 ? Math.floor(player.cash / currentPrice) : 0;
  const isMarketActive = room.status === "ACTIVE";

  // Inline Validation Check
  let validationError: string | null = null;
  if (!isMarketActive) {
    validationError = room.status === "LOBBY" ? "Market opens when round starts" : "Trading paused by instructor";
  } else if (quantity <= 0) {
    validationError = "Enter a valid share quantity";
  } else if (side === "BUY" && estimatedTotal > player.cash) {
    validationError = `Insufficient cash (Requires ${formatINR(estimatedTotal)})`;
  } else if (side === "SELL" && quantity > holding) {
    validationError = `Insufficient holdings (You own ${holding} shares)`;
  }

  const handleExecute = async () => {
    if (!asset || validationError || loading) return;
    setErrorMessage(null);
    setLoading(true);

    const order: TradeOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      playerId: player.id,
      playerName: player.name,
      desk: player.desk || "retail_momentum",
      assetId: selectedAssetId,
      side,
      quantity,
      price: currentPrice,
      timestamp: Date.now(),
      total: estimatedTotal,
    };

    // Instant audio cue for 0ms physical feedback
    sounds.playTradeSuccess();

    const res = await onTrade(order);
    setLoading(false);

    if (res.success) {
      setIsExecutedPulse(true);
      setTimeout(() => setIsExecutedPulse(false), 500);
    } else {
      setErrorMessage(res.error || "Trade execution failed");
    }
  };

  if (!asset) return null;

  return (
    <div className="card-surface p-4 sm:p-5 space-y-4">
      {/* Header: Asset Name & Quick Context */}
      <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-white tracking-tight">{asset.name}</span>
            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-surface-subtle border border-borderSubtle text-neutralMuted shrink-0">
              {asset.id}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-subtle text-accent border border-accent/20 shrink-0">
              {getCompanyIndustry(asset.id)}
            </span>
          </div>
          <div className="text-[11px] text-neutralMuted font-mono mt-0.5">
            {getCompanySubSector(asset.id)}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span
            className={`text-sm font-bold font-mono text-white tabular-nums inline-block transition-transform ${
              priceAnim === "gain"
                ? "motion-tick-gain"
                : priceAnim === "loss"
                ? "motion-tick-loss"
                : ""
            }`}
          >
            {formatINR(currentPrice)}
          </span>
          <span
            className={`text-xs font-mono font-bold ml-1.5 tabular-nums ${
              asset.changePercent >= 0 ? "text-gain" : "text-loss"
            }`}
          >
            {asset.changePercent >= 0 ? "+" : ""}
            {asset.changePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Segmented Control: Buy vs Sell */}
      <div className="grid grid-cols-2 p-1 bg-surface-subtle rounded-ui border border-borderSubtle text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setSide("BUY");
            setErrorMessage(null);
          }}
          className={`min-h-touch py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            side === "BUY"
              ? "bg-gain text-white shadow-sm font-bold"
              : "text-neutralMuted hover:text-white"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Buy {asset.id}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSide("SELL");
            setErrorMessage(null);
          }}
          className={`min-h-touch py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            side === "SELL"
              ? "bg-loss text-white shadow-sm font-bold"
              : "text-neutralMuted hover:text-white"
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Sell {asset.id}</span>
        </button>
      </div>

      {/* Order Entry Fields (Qty & Price) */}
      <div className="space-y-3">
        {/* Quantity Row */}
        <div>
          <div className="flex items-center justify-between text-xs text-neutralMuted uppercase tracking-wider mb-1 font-mono">
            <span>Order Quantity</span>
            <span>
              {side === "BUY"
                ? `Max Affordable: ${maxBuyAffordable}`
                : `You Hold: ${holding} Shares`}
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              min="1"
              value={quantity || ""}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full min-h-touch bg-surface-subtle border border-borderSubtle focus:border-borderFocus rounded-ui px-3.5 py-2 text-base font-bold text-white font-mono tabular-nums focus:outline-none"
              placeholder="Shares"
            />
          </div>

          {/* Quick Quantity Preset Chips */}
          <div className="flex gap-1.5 mt-2 text-xs font-mono">
            {[5, 10, 25, 50].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`flex-1 py-1.5 rounded-md border text-xs font-bold motion-btn-press ${
                  quantity === q
                    ? "bg-surface border-borderStrong text-white"
                    : "bg-surface-subtle border-borderSubtle text-neutralMuted hover:text-white"
                }`}
              >
                {q}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                if (side === "BUY") {
                  setQuantity(Math.max(1, maxBuyAffordable));
                } else {
                  setQuantity(Math.max(1, holding));
                }
              }}
              disabled={side === "BUY" ? maxBuyAffordable <= 0 : holding <= 0}
              className="flex-1 py-1.5 rounded-md border border-borderSubtle bg-surface-subtle hover:bg-surface text-neutralMuted hover:text-white text-xs font-bold motion-btn-press disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Max
            </button>
          </div>
        </div>

        {/* Execution Price & Estimated Total Summary */}
        <div className="p-3 bg-surface-subtle rounded-ui border border-borderSubtle space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-neutralMuted">
            <span>Execution Price</span>
            <span className="text-white font-bold tabular-nums">{formatINR(currentPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-neutralMuted">
            <span>Estimated Total</span>
            <span className="text-white font-bold tabular-nums text-sm">
              {formatINR(estimatedTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutralMuted pt-1 border-t border-borderSubtle">
            <span>Available Cash</span>
            <span className="text-gain font-semibold tabular-nums">{formatINR(player.cash)}</span>
          </div>
        </div>
      </div>

      {/* Inline Validation Notice */}
      {validationError && (
        <div className="p-2.5 rounded-ui bg-surface-subtle border border-borderSubtle text-xs text-neutralMuted flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-warningMuted shrink-0" />
            <span className="truncate">{validationError}</span>
          </div>
          {room.status === "LOBBY" && (
            <button
              type="button"
              onClick={async () => {
                const { updateRoomStatus } = await import("@/lib/sync/syncService");
                await updateRoomStatus(room.code, "ACTIVE");
              }}
              className="px-2.5 py-1 rounded bg-accent-subtle hover:bg-accent text-accent hover:text-white border border-accent/20 font-mono text-[10px] font-bold shrink-0 transition-colors"
            >
              Start Round 1
            </button>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-ui bg-loss-subtle border border-loss-border text-xs text-loss flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Single Confirm Action Button */}
      <button
        type="button"
        onClick={handleExecute}
        disabled={loading || Boolean(validationError)}
        className={`w-full min-h-touch py-3 rounded-ui text-white font-bold text-sm shadow-ui motion-btn-press disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 ${
          isExecutedPulse ? "motion-exec-pulse ring-2 ring-gain" : ""
        } ${
          side === "BUY"
            ? "bg-gain hover:bg-emerald-600"
            : "bg-loss hover:bg-rose-600"
        }`}
      >
        {loading ? (
          <span>Executing Order...</span>
        ) : (
          <span>
            Confirm {side} {quantity} {asset.id} ({formatINR(estimatedTotal)})
          </span>
        )}
      </button>

    </div>
  );
};
