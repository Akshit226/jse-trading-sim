"use client";

import React from "react";
import { AssetId, PlayerPortfolio, RoomState } from "@/types/trading";
import { DESK_METADATA, formatINR } from "@/lib/constants";
import { Trophy, TrendingUp, TrendingDown, Wallet, PieChart, Activity } from "lucide-react";

interface PortfolioCardProps {
  player: PlayerPortfolio;
  room: RoomState;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ player, room }) => {
  const isPositive = player.returnPercent >= 0;
  const deskInfo = DESK_METADATA[player.desk];

  const holdings = (Object.keys(player.shares) as AssetId[])
    .map((aid) => {
      const qty = player.shares[aid] || 0;
      const asset = room.assets[aid];
      const price = asset?.currentPrice || 0;
      const value = qty * price;
      return { aid, qty, price, value, asset };
    })
    .filter((h) => h.qty > 0);

  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
      {/* Header with Desk Badge and Rank */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-3 py-1 rounded-full font-extrabold border ${
              deskInfo?.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            {deskInfo?.name || player.desk}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-300 font-extrabold text-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>RANK #{player.rank || 1}</span>
        </div>
      </div>

      {/* Main Net Worth and P&L Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Total Net Worth
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono mt-0.5">
            {formatINR(player.totalNetWorth)}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Total Return
          </div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight font-mono mt-0.5 flex items-center justify-end ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-5 h-5 mr-1" />
            ) : (
              <TrendingDown className="w-5 h-5 mr-1" />
            )}
            {isPositive ? "+" : ""}
            {player.returnPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Cash vs Holdings Breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
        <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
            <Wallet className="w-3 h-3 text-emerald-400" />
            <span>Liquid Cash</span>
          </div>
          <div className="text-sm font-black text-emerald-400 mt-0.5">
            {formatINR(player.cash)}
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
            <PieChart className="w-3 h-3 text-cyan-400" />
            <span>Equity Value</span>
          </div>
          <div className="text-sm font-black text-cyan-300 mt-0.5">
            {formatINR(totalHoldingsValue)}
          </div>
        </div>
      </div>

      {/* Holdings Breakdown Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Stock Positions ({holdings.length})</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {player.totalTrades} Executed Trades
          </span>
        </div>

        {holdings.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center text-xs text-slate-500 italic">
            No active stock holdings. Use the Trading Pad to execute orders.
          </div>
        ) : (
          <div className="space-y-1.5">
            {holdings.map((h) => {
              const isPos = (h.asset?.changePercent || 0) >= 0;
              return (
                <div
                  key={h.aid}
                  className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs transition-all hover:border-slate-700"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-white">{h.aid}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-800 text-slate-400">
                        {h.asset?.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {h.qty} shares @ {formatINR(h.price)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-white">{formatINR(h.value)}</div>
                    <div
                      className={`text-[10px] font-mono font-bold ${
                        isPos ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {h.asset?.changePercent.toFixed(1)}% today
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
