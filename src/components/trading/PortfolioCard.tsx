"use client";

import React from "react";
import { AssetId, PlayerPortfolio, RoomState } from "@/types/trading";
import { formatINR, getCompanyFullName, getCompanyIndustry } from "@/lib/constants";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Wallet,
  PieChart,
  BarChart2,
} from "lucide-react";

interface PortfolioCardProps {
  player: PlayerPortfolio;
  room: RoomState;
  onSelectAsset?: (assetId: AssetId) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  player,
  room,
  onSelectAsset,
}) => {
  const isPositive = player.returnPercent >= 0;

  const holdings = (Object.keys(player.shares || {}) as AssetId[])
    .map((aid) => {
      const qty = player.shares[aid] || 0;
      const asset = room.assets?.[aid];
      const price = asset?.currentPrice || 0;
      const dayChangePercent = asset?.changePercent || 0;
      const value = qty * price;
      return { aid, qty, price, dayChangePercent, value, asset };
    })
    .filter((h) => h.qty > 0)
    .sort((a, b) => b.value - a.value);

  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalShares = holdings.reduce((sum, h) => sum + h.qty, 0);

  return (
    <div className="card-surface p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-borderSubtle">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Portfolio & Holdings
          </span>
        </div>
        {player.rank && (
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
            Rank #{player.rank}
          </span>
        )}
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

      {/* Active Stock Positions Table (Rows and Header Columns format) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Active Stock Positions
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-subtle border border-borderSubtle text-accent">
            {holdings.length} {holdings.length === 1 ? "Holding" : "Holdings"}
          </span>
        </div>

        {holdings.length === 0 ? (
          <div className="p-6 rounded-ui bg-surface-subtle border border-borderSubtle text-center space-y-2">
            <PieChart className="w-8 h-8 text-neutralMuted mx-auto opacity-40" />
            <div className="text-xs font-bold text-white font-sans">
              No Active Stock Positions
            </div>
            <p className="text-[11px] text-neutralMuted font-mono max-w-[280px] mx-auto">
              Your portfolio is currently 100% liquid cash. Select an equity from the Watchlist or TradePad to open a position.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-ui border border-borderSubtle bg-surface-subtle">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead>
                <tr className="border-b border-borderSubtle bg-surface/90 text-[10px] text-neutralMuted uppercase tracking-wider select-none">
                  <th className="py-2 px-2.5 font-semibold text-left">Asset</th>
                  <th className="py-2 px-2 font-semibold text-right">Qty</th>
                  <th className="py-2 px-2 font-semibold text-right">CMP (₹)</th>
                  <th className="py-2 px-2 font-semibold text-right">Day %</th>
                  <th className="py-2 px-2 font-semibold text-right">Value (₹)</th>
                  <th className="py-2 px-2 font-semibold text-right">Weight</th>
                  <th className="py-2 px-2 font-semibold text-center">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle/60">
                {holdings.map((h) => {
                  const companyName = h.asset?.name || getCompanyFullName(h.aid);
                  const industry = getCompanyIndustry(h.aid);
                  const isPos = h.dayChangePercent >= 0;
                  const weight =
                    totalHoldingsValue > 0 ? (h.value / totalHoldingsValue) * 100 : 0;

                  return (
                    <tr
                      key={h.aid}
                      className="hover:bg-surface/60 transition-colors group"
                    >
                      {/* Asset & Sector */}
                      <td className="py-2 px-2.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white text-xs font-mono">
                            {h.aid}
                          </span>
                        </div>
                        <div
                          className="text-[10px] text-neutralMuted truncate max-w-[110px] font-sans"
                          title={`${companyName} (${industry})`}
                        >
                          {companyName}
                        </div>
                      </td>

                      {/* Shares Quantity */}
                      <td className="py-2 px-2 text-right">
                        <span className="font-bold text-white tabular-nums">
                          {h.qty.toLocaleString()}
                        </span>
                      </td>

                      {/* Current Market Price (CMP) */}
                      <td className="py-2 px-2 text-right">
                        <span className="font-bold text-white tabular-nums">
                          {formatINR(h.price)}
                        </span>
                      </td>

                      {/* Day Change % */}
                      <td className="py-2 px-2 text-right">
                        <div
                          className={`inline-flex items-center gap-0.5 font-bold text-[10px] tabular-nums ${
                            isPos ? "text-gain" : "text-loss"
                          }`}
                        >
                          {isPos ? (
                            <TrendingUp className="w-2.5 h-2.5" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5" />
                          )}
                          <span>
                            {isPos ? "+" : ""}
                            {h.dayChangePercent.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Market Value */}
                      <td className="py-2 px-2 text-right">
                        <span className="font-bold text-white tabular-nums">
                          {formatINR(h.value)}
                        </span>
                      </td>

                      {/* Portfolio Weight */}
                      <td className="py-2 px-2 text-right">
                        <span className="font-bold text-accent tabular-nums text-[10px]">
                          {weight.toFixed(1)}%
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectAsset?.(h.aid)}
                          className="px-2 py-0.5 rounded bg-surface border border-borderSubtle hover:border-accent hover:text-accent text-[10px] font-mono text-neutralMuted transition-colors inline-flex items-center gap-1 group-hover:border-accent/60"
                          title={`Trade ${h.aid}`}
                        >
                          <span>Trade</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {holdings.length > 1 && (
                <tfoot>
                  <tr className="border-t-2 border-borderSubtle bg-surface/90 text-[10px] font-bold text-white">
                    <td className="py-2 px-2.5 uppercase tracking-wider text-neutralMuted">
                      Total
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-neutralMuted">
                      {totalShares.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right text-neutralMuted">—</td>
                    <td className="py-2 px-2 text-right text-neutralMuted">—</td>
                    <td className="py-2 px-2 text-right tabular-nums text-white">
                      {formatINR(totalHoldingsValue)}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-accent">
                      100%
                    </td>
                    <td className="py-2 px-2 text-center text-neutralMuted">—</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
