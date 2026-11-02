"use client";

import React, { useMemo } from "react";
import { TradeOrder } from "@/types/trading";
import { Activity } from "lucide-react";

interface SentimentMeterProps {
  recentTrades: TradeOrder[];
}

export const SentimentMeter: React.FC<SentimentMeterProps> = ({ recentTrades }) => {
  const { bullishPercent, bearishPercent, label, color } = useMemo(() => {
    if (!recentTrades || recentTrades.length === 0) {
      return { bullishPercent: 50, bearishPercent: 50, label: "Balanced", color: "text-neutralMuted" };
    }

    const last20 = recentTrades.slice(0, 20);
    const buys = last20.filter((t) => t.side === "BUY").length;
    const bullish = Math.round((buys / last20.length) * 100);
    const bearish = 100 - bullish;

    let text = "Balanced Sentiment";
    let statusColor = "text-neutralMuted";

    if (bullish >= 75) {
      text = "Strong Buy Pressure";
      statusColor = "text-gain";
    } else if (bullish >= 60) {
      text = "Bullish Skew";
      statusColor = "text-gain";
    } else if (bearish >= 75) {
      text = "Heavy Sell Pressure";
      statusColor = "text-loss";
    } else if (bearish >= 60) {
      text = "Bearish Skew";
      statusColor = "text-loss";
    }

    return { bullishPercent: bullish, bearishPercent: bearish, label: text, color: statusColor };
  }, [recentTrades]);

  return (
    <div className="card-surface p-3.5 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider font-mono">
          <Activity className="w-3.5 h-3.5 text-accent" />
          <span>Floor Sentiment</span>
        </div>
        <div className={`font-mono font-bold text-xs ${color}`}>{label}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden flex border border-borderSubtle">
        <div
          className="bg-gain h-full transition-all duration-300"
          style={{ width: `${bullishPercent}%` }}
        />
        <div
          className="bg-loss h-full transition-all duration-300"
          style={{ width: `${bearishPercent}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono tabular-nums text-neutralMuted">
        <span className="text-gain">{bullishPercent}% Buys</span>
        <span className="text-loss">{bearishPercent}% Sells</span>
      </div>
    </div>
  );
};
