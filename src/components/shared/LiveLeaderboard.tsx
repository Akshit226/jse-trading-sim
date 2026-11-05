"use client";

import React from "react";
import { PlayerPortfolio } from "@/types/trading";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DESK_METADATA, formatINR } from "@/lib/constants";

interface LiveLeaderboardProps {
  players: Record<string, PlayerPortfolio>;
  currentPlayerId?: string;
  maxDisplay?: number;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  players,
  currentPlayerId,
  maxDisplay = 10,
}) => {
  const sortedPlayers = Object.values(players || {})
    .sort((a, b) => (b.totalNetWorth ?? 0) - (a.totalNetWorth ?? 0))
    .slice(0, maxDisplay);

  return (
    <div className="card-surface p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-borderSubtle">
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Leaderboard
        </span>
        <span className="text-[11px] text-neutralMuted font-mono">
          {Object.keys(players || {}).length} Traders
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-1.5">
        {sortedPlayers.length === 0 ? (
          <div className="text-xs text-neutralMuted text-center py-4 font-mono">
            No active traders
          </div>
        ) : (
          sortedPlayers.map((player, idx) => {
            const rank = idx + 1;
            const isCurrent = player.id === currentPlayerId;
            const returnPct = typeof player.returnPercent === "number" ? player.returnPercent : 0;
            const isGain = returnPct >= 0;
            const netWorth = typeof player.totalNetWorth === "number" ? player.totalNetWorth : 1000000;
            const desk = player.desk ? DESK_METADATA[player.desk] : undefined;
            const displayName = player.name || "Student Trader";

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2.5 rounded-ui border transition-colors ${
                  isCurrent
                    ? "bg-accent-subtle border-accent"
                    : "bg-surface-subtle border-borderSubtle"
                }`}
              >
                {/* Left: Rank + Name + Desk */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                      rank === 1
                        ? "bg-amber-400 text-slate-950"
                        : rank === 2
                        ? "bg-slate-300 text-slate-950"
                        : rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-surface text-neutralMuted"
                    }`}
                  >
                    {rank}
                  </span>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{displayName}</span>
                      {isCurrent && (
                        <span className="text-[9px] font-mono font-bold text-accent px-1 rounded bg-accent-subtle border border-accent">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutralMuted truncate">
                      {desk?.name || player.desk || "Student"}
                    </div>
                  </div>
                </div>

                {/* Right: Net Worth + P&L% + Arrow */}
                <div className="text-right shrink-0 pl-2">
                  <div className="text-xs font-bold font-mono text-white tabular-nums">
                    {formatINR(netWorth)}
                  </div>
                  <div
                    className={`text-[11px] font-mono font-bold flex items-center justify-end gap-0.5 tabular-nums ${
                      isGain ? "text-gain" : "text-loss"
                    }`}
                  >
                    {isGain ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {isGain ? "+" : ""}
                      {returnPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
