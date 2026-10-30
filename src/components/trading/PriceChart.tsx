"use client";

import React, { useMemo } from "react";
import { Asset } from "@/types/trading";
import { formatINR } from "@/lib/constants";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

interface PriceChartProps {
  asset: Asset;
  height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ asset, height = 240 }) => {
  const isPositive = asset.changePercent >= 0;
  const strokeColor = isPositive ? "#10b981" : "#ef4444";
  const gradientId = `gradient-${asset.id}`;

  const { points, minPrice, maxPrice } = useMemo(() => {
    const history = asset.historicalPrices;
    if (!history || history.length === 0) {
      return { points: "", minPrice: asset.currentPrice, maxPrice: asset.currentPrice };
    }

    const prices = history.map((h) => h.price);
    const min = Math.min(...prices) * 0.996;
    const max = Math.max(...prices) * 1.004;
    const range = max - min || 1;

    const width = 500;
    const chartHeight = height - 45;

    const coords = history.map((h, i) => {
      const x = (i / Math.max(1, history.length - 1)) * width;
      const y = chartHeight - ((h.price - min) / range) * chartHeight + 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return {
      points: coords.join(" "),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [asset.historicalPrices, asset.currentPrice, height]);

  const prevClose = asset.previousClosePrice || asset.basePrice;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-sm">
      {/* Asset Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
              {asset.id}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-slate-800 text-cyan-300 border border-slate-700">
              {asset.category}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{asset.name}</p>
        </div>

        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            {formatINR(asset.currentPrice)}
          </div>
          <div
            className={`flex items-center justify-end text-xs font-black font-mono mt-0.5 ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
            )}
            {isPositive ? "+" : ""}
            {asset.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* SVG Responsive Chart */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 500 ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={height * 0.25} x2="500" y2={height * 0.25} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="0" y1={height * 0.5} x2="500" y2={height * 0.5} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="0" y1={height * 0.75} x2="500" y2={height * 0.75} stroke="#1e293b" strokeDasharray="3 3" />

          {/* Area fill */}
          {points && (
            <polygon
              points={`0,${height} ${points} 500,${height}`}
              fill={`url(#${gradientId})`}
            />
          )}

          {/* Sparkline path */}
          {points && (
            <polyline
              points={points}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Min / Max overlay markers */}
        <div className="absolute top-1 left-2 text-[10px] text-slate-500 font-mono">
          HIGH: {formatINR(maxPrice)}
        </div>
        <div className="absolute bottom-1 left-2 text-[10px] text-slate-500 font-mono">
          LOW: {formatINR(minPrice)}
        </div>
      </div>

      {/* Previous Close & Volume info */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>PREV CLOSE: {formatINR(prevClose)}</span>
        </span>
        <span>VOL: {asset.volume.toLocaleString()} shares</span>
        <span>DAY: {formatINR(asset.dayLow)} - {formatINR(asset.dayHigh)}</span>
      </div>
    </div>
  );
};
