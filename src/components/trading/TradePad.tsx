"use client";

import React, { useState } from "react";
import { Asset, AssetId, PlayerPortfolio, RoomState, TradeOrder } from "@/types/trading";
import { sounds } from "@/lib/audio";
import { formatINR, DESK_METADATA } from "@/lib/constants";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ShieldAlert,
  Sparkles,
  Info,
  Clock,
  Layers,
} from "lucide-react";

interface TradePadProps {
  player: PlayerPortfolio;
  room: RoomState;
  onTrade: (order: TradeOrder) => Promise<{ success: boolean; error?: string }>;
  selectedAssetId?: AssetId;
  onSelectAsset?: (assetId: AssetId) => void;
}

export const TradePad: React.FC<TradePadProps> = ({
  player,
  room,
  onTrade,
  selectedAssetId: externalAssetId,
  onSelectAsset,
}) => {
  const [internalAssetId, setInternalAssetId] = useState<AssetId>("MPHASIS");
  const selectedAssetId = externalAssetId || internalAssetId;

  const [activeSector, setActiveSector] = useState<"IT" | "FMCG">("IT");

  const asset = room.assets?.[selectedAssetId];

  // Auto-align active sector tab to the selected stock
  React.useEffect(() => {
    if (asset?.category) {
      setActiveSector(asset.category as "IT" | "FMCG");
    }
  }, [asset?.category]);

  const handleSelect = (aid: AssetId) => {
    setInternalAssetId(aid);
    if (onSelectAsset) onSelectAsset(aid);
    setErrorMessage(null);
  };

  const [quantity, setQuantity] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const holding = player.shares[selectedAssetId] || 0;
  const estimatedTotal = Number((quantity * (asset?.currentPrice || 0)).toFixed(2));
  const maxBuyAffordable = asset && asset.currentPrice > 0 ? Math.floor(player.cash / asset.currentPrice) : 0;

  const deskInfo = DESK_METADATA[player.desk];

  // Active desk intelligence / whisper check
  const activeWhisper =
    room.currentNews?.deskWhisper?.desk === player.desk ? room.currentNews.deskWhisper : null;

  const isMarketActive = room.status === "ACTIVE";

  const handleExecute = async (side: "BUY" | "SELL") => {
    if (!asset || quantity <= 0) return;
    setErrorMessage(null);
    setLoading(true);

    const order: TradeOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      playerId: player.id,
      playerName: player.name,
      desk: player.desk,
      assetId: selectedAssetId,
      side,
      quantity,
      price: asset.currentPrice,
      timestamp: Date.now(),
      total: estimatedTotal,
    };

    const res = await onTrade(order);
    setLoading(false);

    if (res.success) {
      sounds.playTradeSuccess();
    } else {
      setErrorMessage(res.error || "Trade execution failed");
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-2xl">
      {/* Confidential Intel Banner for Desk */}
      {activeWhisper && (
        <div className="mb-4 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-transparent border border-amber-500/40 rounded-xl p-3.5 text-amber-200 text-xs flex items-start space-x-2.5 shadow-lg shadow-amber-950/40 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">
              CONFIDENTIAL INTEL ({deskInfo.name})
            </div>
            <p className="mt-0.5 leading-relaxed">{activeWhisper.rumorText}</p>
          </div>
        </div>
      )}

      {/* Market Status Notification if not ACTIVE */}
      {!isMarketActive && (
        <div
          className={`mb-4 rounded-xl p-3 text-xs flex items-center space-x-2.5 border ${
            room.status === "LOBBY"
              ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-200"
              : room.status === "PAUSED"
              ? "bg-amber-950/60 border-amber-500/40 text-amber-200"
              : "bg-slate-800/80 border-slate-700 text-slate-300"
          }`}
        >
          <Clock className="w-4 h-4 shrink-0 text-cyan-400" />
          <div>
            <span className="font-extrabold uppercase">
              {room.status === "LOBBY"
                ? "Pre-Open Lobby"
                : room.status === "PAUSED"
                ? "Market Halted"
                : "Market Closed"}
              :{" "}
            </span>
            <span>
              {room.status === "LOBBY"
                ? "Waiting for the Teacher to start Round 1. Orders will activate once market opens."
                : room.status === "PAUSED"
                ? "Trading is temporarily paused by the host."
                : "The simulation has completed. Review final standings."}
            </span>
          </div>
        </div>
      )}

      {/* Asset Selector (Categorized into IT and FMCG) */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Indian Stock</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold">
            {Object.keys(room.assets || {}).length} Equities Available
          </span>
        </div>

        {/* Sector Filter Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveSector("IT")}
            className={`py-1 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSector === "IT"
                ? "bg-slate-800 text-cyan-300 shadow border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>💻 IT Sector (5)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSector("FMCG")}
            className={`py-1 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSector === "FMCG"
                ? "bg-slate-800 text-emerald-300 shadow border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🛒 FMCG Staples (5)</span>
          </button>
        </div>

        {/* Active Sector Stocks in spacious 2-column layout */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(room.assets || {}) as AssetId[])
            .filter((aid) => room.assets[aid]?.category === activeSector)
            .map((aid) => {
              const a = room.assets[aid];
              const isSelected = selectedAssetId === aid;
              const isPos = a.changePercent >= 0;

              return (
                <button
                  key={aid}
                  type="button"
                  onClick={() => handleSelect(aid)}
                  className={`p-2.5 rounded-xl text-left transition-all border ${
                    isSelected
                      ? "bg-slate-800/95 border-cyan-400 shadow-md shadow-cyan-950/60 ring-2 ring-cyan-400/40"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{aid}</span>
                    <span
                      className={`text-[10px] font-bold font-mono ${
                        isPos ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {a.changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs font-black font-mono text-cyan-300 mt-1">
                    {formatINR(a.currentPrice)}
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Selected Stock Banner & Overview */}
      {asset && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold text-white">{asset.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {asset.category}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Position: <span className="font-bold text-white">{holding} shares</span> (
              {formatINR(holding * asset.currentPrice)})
            </div>
          </div>

          <div className="text-right">
            <div className="text-slate-400 text-[11px]">Free Buying Power:</div>
            <div className="text-sm font-black text-emerald-400 font-mono">
              {formatINR(player.cash)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Max Buy: {maxBuyAffordable} shares
            </div>
          </div>
        </div>
      )}

      {/* Quantity Input & Preset Selectors */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>Order Quantity (Shares)</span>
          <span className="text-cyan-300 font-mono font-bold">
            Est. Total: {formatINR(estimatedTotal)}
          </span>
        </div>

        <div className="relative mb-2.5">
          <input
            type="number"
            min="1"
            value={quantity || ""}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-cyan-400 font-mono"
            placeholder="Shares"
          />
        </div>

        {/* Quick presets suitable for Indian stock price ranges */}
        <div className="grid grid-cols-7 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setQuantity(2)}
            className="py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all font-mono"
          >
            2
          </button>
          <button
            onClick={() => setQuantity(5)}
            className="py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all font-mono"
          >
            5
          </button>
          <button
            onClick={() => setQuantity(10)}
            className="py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all font-mono"
          >
            10
          </button>
          <button
            onClick={() => setQuantity(25)}
            className="py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all font-mono"
          >
            25
          </button>
          <button
            onClick={() => setQuantity(Math.max(1, maxBuyAffordable))}
            disabled={maxBuyAffordable <= 0}
            className="py-1.5 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/30 rounded-lg disabled:opacity-30 transition-all font-bold"
          >
            Max
          </button>
          <button
            onClick={() => setQuantity(Math.max(1, Math.floor(holding / 2)))}
            disabled={holding <= 0}
            className="py-1.5 bg-rose-950/70 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30 rounded-lg disabled:opacity-30 transition-all font-bold"
          >
            50%
          </button>
          <button
            onClick={() => setQuantity(Math.max(1, holding))}
            disabled={holding <= 0}
            className="py-1.5 bg-rose-950/70 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30 rounded-lg disabled:opacity-30 transition-all font-bold"
          >
            All
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-4 bg-rose-500/10 border border-rose-500/40 rounded-xl p-3 text-rose-400 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Buy & Sell Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleExecute("BUY")}
          disabled={loading || maxBuyAffordable <= 0 || !isMarketActive}
          className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-950/50 transition-all"
        >
          <ArrowUpRight className="w-5 h-5" />
          <span>BUY {selectedAssetId}</span>
        </button>

        <button
          onClick={() => handleExecute("SELL")}
          disabled={loading || holding <= 0 || !isMarketActive}
          className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-white font-black text-sm sm:text-base shadow-lg shadow-rose-950/50 transition-all"
        >
          <ArrowDownRight className="w-5 h-5" />
          <span>SELL {selectedAssetId}</span>
        </button>
      </div>
    </div>
  );
};
