"use client";

import React, { useMemo } from "react";
import { TradeOrder } from "@/types/trading";
import { Flame, ShieldAlert, Sparkles } from "lucide-react";

interface SentimentMeterProps {
  recentTrades: TradeOrder[];
}

export const SentimentMeter: React.FC<SentimentMeterProps> = ({ recentTrades }) => {
  const { bullishPercent, bearishPercent, label, color } = useMemo(() => {
    if (!recentTrades || recentTrades.length === 0) {
      return { bullishPercent: 50, bearishPercent: 50, label: "Neutral Market", color: "text-slate-300" };
    }

    const last20 = recentTrades.slice(0, 20);
    const buys = last20.filter((t) => t.side === "BUY").length;
    const bullish = Math.round((buys / last20.length) * 100);
    const bearish = 100 - bullish;

    let text = "Balanced Sentiment";
    let statusColor = "text-yellow-400";

    if (bullish >= 75) {
      text = "Extreme FOMO & Greed";
      statusColor = "text-emerald-400";
    } else if (bullish >= 60) {
      text = "Bullish Momentum";
      statusColor = "text-emerald-300";
    } else if (bearish >= 75) {
      text = "Panic Liquidation & Fear";
      statusColor = "text-rose-400";
    } else if (bearish >= 60) {
      text = "Bearish Pressure";
      statusColor = "text-rose-300";
    }

    return { bullishPercent: bullish, bearishPercent: bearish, label: text, color: statusColor };
  }, [recentTrades]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Classroom Sentiment Meter</span>
        </div>
        <div className={`text-xs font-black ${color}`}>{label}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
        <div
          className="bg-emerald-500 h-full transition-all duration-500"
          style={{ width: `${bullishPercent}%` }}
        />
        <div
          className="bg-rose-500 h-full transition-all duration-500"
          style={{ width: `${bearishPercent}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono mt-1.5 text-slate-400">
        <span className="text-emerald-400 font-bold">{bullishPercent}% Bullish</span>
        <span className="text-rose-400 font-bold">{bearishPercent}% Bearish</span>
      </div>
    </div>
  );
};
