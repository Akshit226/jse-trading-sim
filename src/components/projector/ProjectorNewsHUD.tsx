"use client";

import React, { useState, useEffect, useRef } from "react";
import { NewsEvent, Asset } from "@/types/trading";
import { getCompanyFullName, getCompanyIndustry, getCompanySubSector, formatINR } from "@/lib/constants";
import { PriceChart } from "@/components/trading/PriceChart";
import { sounds } from "@/lib/audio";
import { newsSpeaker } from "@/lib/voice/newsSpeaker";
import {
  Radio,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  History,
  LineChart,
  Newspaper,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface ProjectorNewsHUDProps {
  currentNews: NewsEvent | null;
  newsHistory: NewsEvent[];
  currentRound: number;
  selectedAsset?: Asset;
}

export const ProjectorNewsHUD: React.FC<ProjectorNewsHUDProps> = ({
  currentNews,
  newsHistory = [],
  currentRound,
  selectedAsset,
}) => {
  // If user explicitly chooses to inspect the technical price chart
  const [viewMode, setViewMode] = useState<"news" | "chart">("news");

  // Selected news item to inspect from history (defaults to latest)
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const lastNewsIdRef = useRef<string | null>(null);

  // When a new news event arrives, prioritize it immediately and play sound/TTS cues
  useEffect(() => {
    if (currentNews && currentNews.id !== lastNewsIdRef.current) {
      lastNewsIdRef.current = currentNews.id;
      setSelectedNewsId(currentNews.id);
      setViewMode("news");

      if (currentNews.soundCue === "crash_alert") {
        sounds.playCrashAlarm();
      } else if (currentNews.soundCue === "bullish_alert") {
        sounds.playTradeSuccess();
      } else {
        sounds.playBreakingNews();
      }

      newsSpeaker.speak(currentNews);
    }
  }, [currentNews]);

  // Determine active news event to show (currentNews -> selected historical -> latest in history)
  const activeNews: NewsEvent | null = (() => {
    if (selectedNewsId) {
      const found = [currentNews, ...newsHistory].find((n) => n?.id === selectedNewsId);
      if (found) return found;
    }
    if (currentNews) return currentNews;
    if (newsHistory && newsHistory.length > 0) return newsHistory[newsHistory.length - 1];
    return null;
  })();

  const isBullish = activeNews?.sentiment?.includes("bullish");
  const isBearish = activeNews?.sentiment?.includes("bearish");
  const isPriceUp = (activeNews?.priceImpact || 0) >= 0;

  return (
    <div className="card-surface p-5 sm:p-6 space-y-4 border border-borderSubtle motion-catalyst-shock relative flex flex-col justify-between min-h-[420px]">
      {/* Top HUD Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-borderSubtle">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Floor Intelligence & News Catalyst</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-subtle border border-borderSubtle text-accent font-bold">
              ROUND {currentRound}
            </span>
          </div>
        </div>

        {/* HUD View Switcher (News Wire vs Technical Chart) */}
        <div className="flex items-center gap-1 p-1 bg-surface-subtle border border-borderSubtle rounded-ui font-mono text-xs">
          <button
            type="button"
            onClick={() => setViewMode("news")}
            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 motion-btn-press ${
              viewMode === "news"
                ? "bg-rose-500 text-white shadow-ui"
                : "text-neutralMuted hover:text-white"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Breaking News HUD</span>
          </button>

          {selectedAsset && (
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 motion-btn-press ${
                viewMode === "chart"
                  ? "bg-accent text-white shadow-ui"
                  : "text-neutralMuted hover:text-white"
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Chart ({selectedAsset.id})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "chart" && selectedAsset ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white tracking-tight">{selectedAsset.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-subtle border border-borderSubtle font-mono text-neutralMuted font-bold">
                  {selectedAsset.id}
                </span>
              </div>
              <p className="text-xs text-neutralMuted font-mono mt-0.5">
                {getCompanyIndustry(selectedAsset.id)} • {getCompanySubSector(selectedAsset.id)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {formatINR(selectedAsset.currentPrice)}
              </div>
              <div
                className={`text-xs font-mono font-bold tabular-nums ${
                  selectedAsset.changePercent >= 0 ? "text-gain" : "text-loss"
                }`}
              >
                {selectedAsset.changePercent >= 0 ? "+" : ""}
                {selectedAsset.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
          <PriceChart asset={selectedAsset} height={300} hideHeader={true} hideWrapper={true} />
        </div>
      ) : activeNews ? (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          {/* Catalyst Metadata Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-md border flex items-center gap-1.5 ${
                  isBullish
                    ? "bg-gain-subtle text-gain border-gain-border shadow-sm"
                    : isBearish
                    ? "bg-loss-subtle text-loss border-loss-border shadow-sm"
                    : "bg-surface-subtle text-warningMuted border-borderSubtle"
                }`}
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isBullish
                    ? "Bullish Catalyst Strike"
                    : isBearish
                    ? "Bearish Market Shock"
                    : "Market Volatility Alert"}
                </span>
              </span>

              {/* Target Equity / Sector Pill */}
              <span className="text-xs font-mono px-3 py-1 rounded-md bg-surface-subtle border border-borderSubtle text-white font-semibold">
                <span className="text-neutralMuted mr-1.5">Target:</span>
                <span className="text-accent font-bold">
                  {activeNews.affectedAsset === "ALL"
                    ? "Broad Market (All 10 Stocks)"
                    : activeNews.affectedAsset === "IT"
                    ? "IT & Tech Basket"
                    : activeNews.affectedAsset === "FMCG"
                    ? "FMCG Consumer Basket"
                    : `${getCompanyFullName(activeNews.affectedAsset)} (${activeNews.affectedAsset})`}
                </span>
              </span>

              {/* Price Impact Magnitude Badge */}
              <span
                className={`text-xs font-mono font-extrabold px-3 py-1 rounded-md border flex items-center gap-1 ml-auto tabular-nums ${
                  isPriceUp
                    ? "bg-gain-subtle text-gain border-gain-border"
                    : "bg-loss-subtle text-loss border-loss-border"
                }`}
              >
                {isPriceUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  Impact: {isPriceUp ? "+" : ""}
                  {(activeNews.priceImpact * 100).toFixed(0)}% Shift
                </span>
              </span>
            </div>

            {/* High-Impact Headline for Projector Visibility */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {activeNews.title}
            </h1>

            {/* In-depth Analysis / Story */}
            <div className="p-4 rounded-ui bg-surface-subtle/80 border border-borderSubtle text-sm sm:text-base text-neutral-200 leading-relaxed font-sans">
              {activeNews.description}
            </div>

            {/* Confidential Desk Whisper / Rumor Leak */}
            {activeNews.deskWhisper && (
              <div className="p-3.5 rounded-ui bg-accent-subtle/40 border-l-4 border-accent text-xs font-mono text-accent-light space-y-1">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-accent text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Confidential Intelligence Leak ({activeNews.deskWhisper.desk.toUpperCase()})</span>
                </div>
                <p className="text-neutral-200">{activeNews.deskWhisper.rumorText}</p>
              </div>
            )}
          </div>

          {/* Timestamp and Broadcaster Footer */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutralMuted pt-2 border-t border-borderSubtle">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>
                Broadcasted for Round {activeNews.round || currentRound} • NSE Real-Time Dispatch
              </span>
            </div>
            {currentNews && currentNews.id === activeNews.id && (
              <span className="text-gain font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Active Market Impact
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Standby State: When no news has been broadcasted yet */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 my-4">
          <div className="w-14 h-14 rounded-full bg-surface-subtle border border-borderSubtle flex items-center justify-center mb-1">
            <Radio className="w-7 h-7 text-accent animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono">
            Trading Floor Intelligence Wire Active
          </h3>
          <p className="text-xs text-neutralMuted max-w-md font-mono leading-relaxed">
            Market channels open across all 4 student trading desks. Breaking news shocks, earnings beats, and economic policy announcements from the instructor will broadcast live on this screen.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-mono text-accent">
            <Clock className="w-3.5 h-3.5" />
            <span>Round {currentRound} • Live Order Flow Streaming</span>
          </div>
        </div>
      )}

      {/* News History Carousel / Archive Strip (Bottom of HUD) */}
      {newsHistory && newsHistory.length > 0 && (
        <div className="pt-3 border-t border-borderSubtle space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-neutralMuted">
            <span className="flex items-center gap-1">
              <History className="w-3 h-3 text-accent" />
              <span>Catalyst History ({newsHistory.length} Recorded)</span>
            </span>
            <span>Click any headline to review</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {newsHistory.map((item, idx) => {
              const itemPos = (item.priceImpact || 0) >= 0;
              const isSelected = activeNews?.id === item.id;

              return (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedNewsId(item.id);
                    setViewMode("news");
                  }}
                  className={`px-3 py-1.5 rounded-ui border text-left shrink-0 max-w-[260px] font-mono text-xs transition-all motion-btn-press ${
                    isSelected
                      ? "bg-surface border-accent shadow-sm"
                      : "bg-surface-subtle border-borderSubtle hover:border-borderStrong text-neutralMuted hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                    <span className={itemPos ? "text-gain" : "text-loss"}>
                      {itemPos ? "+" : ""}
                      {(item.priceImpact * 100).toFixed(0)}%
                    </span>
                    <span className="text-neutralMuted">R{item.round || 1}</span>
                  </div>
                  <div className="text-white text-[11px] font-medium truncate mt-0.5">{item.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
