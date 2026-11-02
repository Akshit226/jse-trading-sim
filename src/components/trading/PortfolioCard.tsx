"use client";

import React from "react";
import { AssetId, PlayerPortfolio, RoomState } from "@/types/trading";
import { DESK_METADATA, formatINR, getCompanyFullName, getCompanyIndustry } from "@/lib/constants";
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react";

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
      const asset = room.assets?.[aid];
      const price = asset?.currentPrice || 0;
      const value = qty * price;
      return { aid, qty, price, value, asset };
    })
    .filter((h) => h.qty > 0);

  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return (
    <div className="card-surface p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-borderSubtle">
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Portfolio & Positions
        </span>
        <span className="text-xs font-mono font-bold text-amber-400">
          Rank #{player.rank || 1}
        </span>
      </div>

      {/* Main Net Worth and Return */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-surface-subtle rounded-ui border border-borderSubtle font-mono">
        <div>
          <span className="text-[10px] text-neutralMuted uppercase block">Total Net Worth</span>
          <span className="text-lg font-bold text-white tabular-nums">
            {formatINR(player.totalNetWorth)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-neutralMuted uppercase block">Total Return</span>
          <div
            className={`text-lg font-bold flex items-center justify-end tabular-nums ${
              isPositive ? "text-gain" : "text-loss"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {player.returnPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Cash vs Holdings Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-surface-subtle border border-borderSubtle p-2.5 rounded-ui">
          <div className="text-[10px] text-neutralMuted uppercase">Liquid Cash</div>
          <div className="text-sm font-bold text-gain tabular-nums mt-0.5">
            {formatINR(player.cash)}
          </div>
        </div>

        <div className="bg-surface-subtle border border-borderSubtle p-2.5 rounded-ui">
          <div className="text-[10px] text-neutralMuted uppercase">Equity Value</div>
          <div className="text-sm font-bold text-white tabular-nums mt-0.5">
            {formatINR(totalHoldingsValue)}
          </div>
        </div>
      </div>

      {/* Position List */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutralMuted">
          Active Stock Positions ({holdings.length})
        </div>

        {holdings.length === 0 ? (
          <div className="text-xs text-neutralMuted italic py-2 text-center font-mono">
            All cash • No stock positions
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {holdings.map((h) => {
              const companyName = h.asset?.name || getCompanyFullName(h.aid);
              const industry = getCompanyIndustry(h.aid);
              return (
                <div
                  key={h.aid}
                  className="p-2.5 rounded bg-surface-subtle border border-borderSubtle flex items-center justify-between text-xs hover:border-borderStrong transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs truncate max-w-[130px] font-sans">
                        {companyName}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1 py-0.2 rounded bg-surface border border-borderSubtle text-neutralMuted shrink-0">
                        {h.aid}
                      </span>
                    </div>
                    <div className="text-[10px] text-accent font-mono flex items-center gap-1 mt-0.5">
                      <span>{industry}</span>
                      <span className="text-neutralMuted">•</span>
                      <span className="text-neutralMuted">{h.qty} shs</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-white font-mono font-bold tabular-nums">
                      {formatINR(h.value)}
                    </span>
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
