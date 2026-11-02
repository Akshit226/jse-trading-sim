"use client";

import React, { useMemo } from "react";
import { Asset } from "@/types/trading";
import { formatINR } from "@/lib/constants";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceChartProps {
  asset: Asset;
  height?: number;
  hideHeader?: boolean;
  hideWrapper?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  asset,
  height = 240,
  hideHeader = false,
  hideWrapper = false,
}) => {
  const isPositive = asset.changePercent >= 0;
  const strokeColor = isPositive ? "#22C55E" : "#EF4444";
  const gradientId = `chart-fill-${asset.id}`;

  const { points, areaPoints, minPrice, maxPrice } = useMemo(() => {
    const history = asset.historicalPrices;
    if (!history || history.length === 0) {
      return {
        points: "",
        areaPoints: "",
        minPrice: asset.currentPrice,
        maxPrice: asset.currentPrice,
      };
    }

    const prices = history.map((h) => h.price);
    const min = Math.min(...prices) * 0.998;
    const max = Math.max(...prices) * 1.002;
    const range = max - min || 1;

    const width = 500;
    const chartHeight = Math.max(30, height - (hideHeader ? 20 : 40));

    const coords = history.map((h, i) => {
      const x = (i / Math.max(1, history.length - 1)) * width;
      const y = chartHeight - ((h.price - min) / range) * chartHeight + (hideHeader ? 10 : 20);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const firstX = 0;
    const lastX = width;
    const bottomY = height;

    const area = `${firstX},${bottomY} ${coords.join(" ")} ${lastX},${bottomY}`;

    return {
      points: coords.join(" "),
      areaPoints: area,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [asset.historicalPrices, asset.currentPrice, height, hideHeader]);

  const content = (
    <>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                {asset.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-surface-subtle text-neutralMuted border border-borderSubtle">
                {asset.category}
              </span>
            </div>
            <p className="text-xs text-neutralMuted mt-0.5">{asset.name}</p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {formatINR(asset.currentPrice)}
            </div>
            <div
              className={`flex items-center justify-end text-xs font-bold font-mono mt-0.5 tabular-nums ${
                isPositive ? "text-gain" : "text-loss"
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
      )}

      {/* SVG Responsive Line Chart */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 500 ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          {areaPoints && (
            <polygon points={areaPoints} fill={`url(#${gradientId})`} />
          )}

          {/* Main Price Line */}
          {points && (
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          )}
        </svg>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-neutralMuted mt-1 tabular-nums">
        <span>Session Low: {formatINR(minPrice)}</span>
        <span>Session High: {formatINR(maxPrice)}</span>
      </div>
    </>
  );

  if (hideWrapper) return content;

  return <div className="card-surface p-4">{content}</div>;
};
