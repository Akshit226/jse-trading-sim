"use client";

import React from "react";
import { PlayerPortfolio } from "@/types/trading";
import { Trophy, Medal, Award, TrendingUp, TrendingDown } from "lucide-react";
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
  const sortedPlayers = Object.values(players)
    .sort((a, b) => b.totalNetWorth - a.totalNetWorth)
    .slice(0, maxDisplay);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/50">
          <Trophy className="w-3.5 h-3.5" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-md">
          <Medal className="w-3.5 h-3.5" />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs shadow-md">
          <Award className="w-3.5 h-3.5" />
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-black text-white tracking-wide uppercase">
            Live Trading Floor Rankings
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {Object.keys(players).length} Traders Active
        </span>
      </div>

      <div className="space-y-1.5">
        {sortedPlayers.map((player, idx) => {
          const rank = idx + 1;
          const isCurrent = player.id === currentPlayerId;
          const isPositive = player.returnPercent >= 0;
          const desk = DESK_METADATA[player.desk];

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                isCurrent
                  ? "bg-cyan-950/60 border border-cyan-500/60 shadow-md shadow-cyan-950/50"
                  : rank === 1
                  ? "bg-amber-950/30 border border-amber-500/30"
                  : "bg-slate-950/60 border border-slate-800/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {getRankBadge(rank)}
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white leading-tight">
                      {player.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {desk?.name || player.desk} • {player.totalTrades} trades
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black font-mono text-white">
                  {formatINR(player.totalNetWorth)}
                </div>
                <div
                  className={`text-[11px] font-mono font-bold flex items-center justify-end ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {player.returnPercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
