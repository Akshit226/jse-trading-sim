"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { NewsEvent, Asset, AssetId } from "@/types/trading";
import { getCompanyFullName, getCompanyIndustry, getCompanySubSector, formatINR } from "@/lib/constants";
import { PRESET_NEWS_SCENARIOS } from "@/lib/engine/newsScenarios";
import { PriceChart } from "@/components/trading/PriceChart";
import { sounds } from "@/lib/audio";
import {
  Radio,
  Zap,
  Clock,
  History,
  LineChart,
  Newspaper,
  ShieldAlert,
  Sparkles,
  Layers,
  HelpCircle,
  BarChart3,
  BookOpen,
} from "lucide-react";

interface ProjectorNewsHUDProps {
  currentNews: NewsEvent | null;
  newsHistory?: NewsEvent[];
  currentRound: number;
  selectedAsset?: Asset;
}

export const ProjectorNewsHUD: React.FC<ProjectorNewsHUDProps> = ({
  currentNews,
  newsHistory = [],
  currentRound,
  selectedAsset,
}) => {
  // View mode switcher: pure text news wire vs technical chart
  const [viewMode, setViewMode] = useState<"news" | "chart">("news");

  // Selected news item to inspect from wire archive (defaults to active news)
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const lastNewsIdRef = useRef<string | null>(null);

  // When a new live broadcast shock arrives, trigger sound and speech cues
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
    }
  }, [currentNews]);

  // Round-specific scheduled scenarios from presets
  const roundScenarios = useMemo(() => {
    const matching = PRESET_NEWS_SCENARIOS.filter((s) => s.round === currentRound);
    return matching.length > 0 ? matching : [PRESET_NEWS_SCENARIOS[0]];
  }, [currentRound]);

  // Default news for this round if no live shock broadcasted yet
  const defaultRoundNews = roundScenarios[0];

  // Resolve active news to display:
  // 1. If user clicked a specific story from round stories / history archive, show it.
  // 2. Otherwise if a live news shock was broadcasted, show currentNews.
  // 3. Otherwise show the round's scheduled news catalyst (NEVER empty!).
  const activeNews: NewsEvent = useMemo(() => {
    if (selectedNewsId) {
      const allAvailable = [
        currentNews,
        ...newsHistory,
        ...roundScenarios,
        ...PRESET_NEWS_SCENARIOS,
      ].filter(Boolean) as NewsEvent[];
      const found = allAvailable.find((n) => n.id === selectedNewsId);
      if (found) return found;
    }
    if (currentNews) return currentNews;
    return defaultRoundNews;
  }, [selectedNewsId, currentNews, defaultRoundNews, newsHistory, roundScenarios]);

  const isLiveShock = currentNews && currentNews.id === activeNews.id;

  return (
    <div className="card-surface p-5 sm:p-6 space-y-5 border border-borderSubtle relative flex flex-col justify-between min-h-[480px]">
      {/* Top HUD Control & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-borderSubtle">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Floor Intelligence & News Wire</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-subtle border border-borderSubtle text-accent font-bold">
              ROUND {currentRound}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Catalyst / Round Scheduled Badge */}
          {isLiveShock ? (
            <span className="text-[11px] font-mono font-extrabold uppercase px-2.5 py-1 rounded bg-gain-subtle text-gain border border-gain-border flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live News Broadcasted</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-surface-subtle text-neutralMuted border border-borderSubtle flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Round {currentRound} Intelligence</span>
            </span>
          )}

          {/* View Switcher: News Wire vs Technical Chart */}
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
              <span>News Wire</span>
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
          <PriceChart asset={selectedAsset} height={320} hideHeader={true} hideWrapper={true} />
        </div>
      ) : (
        /* Pure Text News Display (NO SPOILERS: Students must read and decide!) */
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Catalyst Sector & Decision Tag (Unbiased — No price shift spoilers!) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-extrabold uppercase px-3 py-1 rounded border flex items-center gap-1.5 bg-surface-subtle text-accent border-borderSubtle">
                <Zap className="w-3.5 h-3.5 shrink-0 text-accent" />
                <span>Market Catalyst</span>
              </span>

              <span className="text-xs font-mono px-3 py-1 rounded bg-surface-subtle border border-borderSubtle text-slate-200 font-bold uppercase">
                {activeNews.affectedSector ||
                  (activeNews.affectedAsset === "ALL"
                    ? "Broad Market (All 10 Bluechips)"
                    : `${getCompanyFullName(activeNews.affectedAsset)} • ${getCompanyIndustry(activeNews.affectedAsset)}`)}
              </span>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutralMuted px-2.5 py-0.5 rounded bg-surface border border-borderSubtle flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-accent" />
                  <span>Floor Task: Analyze & Decide</span>
                </span>
              </div>
            </div>

            {/* Direct Company Focus Badges (Neutral — no percentage shifts or arrow spoilers!) */}
            <div className="p-3 rounded-ui bg-surface/90 border border-borderSubtle flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="text-[11px] font-bold text-neutralMuted uppercase tracking-wider">
                Focus Equities:
              </span>
              {(activeNews.affectedCompanies && activeNews.affectedCompanies.length > 0
                ? activeNews.affectedCompanies
                : activeNews.affectedAsset === "ALL"
                ? (["RELIANCE", "TATAMOTORS", "TCS", "HDFCBANK", "INFY", "ITC", "ZOMATO", "ADANIENT", "SBIN", "MARUTI"] as AssetId[])
                : ([activeNews.affectedAsset as AssetId])
              ).map((sym) => (
                <span
                  key={sym}
                  className="px-2.5 py-1 rounded text-xs font-bold border border-borderSubtle bg-surface-subtle text-white flex items-center gap-1.5"
                >
                  <span className="text-accent font-mono font-bold">{sym}</span>
                  <span className="text-neutralMuted font-normal">—</span>
                  <span className="text-slate-200">{getCompanyFullName(sym)}</span>
                </span>
              ))}
            </div>

            {/* Ultra High-Visibility Headline (Newspaper Style) */}
            <div className="p-4 sm:p-5 rounded-ui bg-surface-subtle/50 border border-borderSubtle space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-accent uppercase tracking-widest">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Financial Times & Dalal Street Wire • Bureau Dispatch</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {activeNews.title}
              </h1>
            </div>

            {/* Full Story Narrative Text (Multi-paragraph Newspaper Article) */}
            <div className="p-4 sm:p-5 rounded-ui bg-surface-subtle/80 border border-borderSubtle text-sm sm:text-base text-slate-100 leading-relaxed font-sans space-y-3">
              {activeNews.newspaperBody && activeNews.newspaperBody.length > 0 ? (
                activeNews.newspaperBody.map((paragraph, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="leading-relaxed">{activeNews.description}</p>
              )}
            </div>

            {/* Key Accounting & Financial Indicators Breakdown */}
            {activeNews.financialMetrics && (
              <div className="p-4 sm:p-5 rounded-ui bg-surface border border-accent/30 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-borderSubtle">
                  <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" />
                    <span>Financial Statement & Accounting Breakdown</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutralMuted uppercase">
                    Balance Sheet & P&L Analysis
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {activeNews.financialMetrics.revenue && (
                    <div className="p-3 bg-surface-subtle rounded-ui border border-borderSubtle space-y-1">
                      <div className="text-[10px] font-mono uppercase text-neutralMuted font-bold">
                        Topline Turnover (Revenue)
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white font-mono">
                        {activeNews.financialMetrics.revenue}
                      </div>
                    </div>
                  )}

                  {activeNews.financialMetrics.operatingProfit && (
                    <div className="p-3 bg-surface-subtle rounded-ui border border-borderSubtle space-y-1">
                      <div className="text-[10px] font-mono uppercase text-neutralMuted font-bold">
                        Operating Profit (EBITDA)
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white font-mono">
                        {activeNews.financialMetrics.operatingProfit}
                      </div>
                    </div>
                  )}

                  {activeNews.financialMetrics.netProfit && (
                    <div className="p-3 bg-surface-subtle rounded-ui border border-borderSubtle space-y-1">
                      <div className="text-[10px] font-mono uppercase text-neutralMuted font-bold">
                        Bottomline (Net Profit / PAT)
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white font-mono">
                        {activeNews.financialMetrics.netProfit}
                      </div>
                    </div>
                  )}

                  {activeNews.financialMetrics.cashFlowOrDebt && (
                    <div className="p-3 bg-surface-subtle rounded-ui border border-borderSubtle space-y-1">
                      <div className="text-[10px] font-mono uppercase text-neutralMuted font-bold">
                        Cash Flow & Capital Structure
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white font-mono">
                        {activeNews.financialMetrics.cashFlowOrDebt}
                      </div>
                    </div>
                  )}
                </div>

                {/* Educational Classroom Concept Highlight */}
                <div className="p-3.5 rounded-ui bg-accent/10 border border-accent/25 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-accent font-mono text-[11px] uppercase tracking-wide">
                    <BookOpen className="w-3.5 h-3.5 text-accent" />
                    <span>Accounting Term in Focus: {activeNews.financialMetrics.keyAccountingConcept}</span>
                  </div>
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans">
                    {activeNews.financialMetrics.accountingExplanation}
                  </p>
                </div>
              </div>
            )}

            {/* Confidential Desk Intelligence Leak */}
            {activeNews.deskWhisper && (
              <div className="p-3.5 rounded-ui bg-accent-subtle/30 border-l-4 border-accent text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-accent text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Confidential Intelligence Leak ({activeNews.deskWhisper.desk.toUpperCase()})</span>
                </div>
                <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed font-sans">
                  {activeNews.deskWhisper.rumorText}
                </p>
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-xs font-mono text-neutralMuted pt-3 border-t border-borderSubtle">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Round {activeNews.round || currentRound} • NSE Financial Wire</span>
            </div>
            <span className="text-neutralMuted text-xs font-mono">
              Traders must analyze fundamentals and decide order flow
            </span>
          </div>
        </div>
      )}

      {/* Round Scenarios & History Wire Strip (NO percentage spoilers!) */}
      <div className="pt-3 border-t border-borderSubtle space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-neutralMuted">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Round {currentRound} Stories & Broadcast Wire</span>
          </span>
          <span>Click any headline to view details</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {/* Round Scenarios Buttons */}
          {roundScenarios.map((item, idx) => {
            const isSelected = activeNews?.id === item.id;

            return (
              <button
                key={`round-${item.id}-${idx}`}
                type="button"
                onClick={() => {
                  setSelectedNewsId(item.id);
                  setViewMode("news");
                }}
                className={`px-3 py-2 rounded-ui border text-left shrink-0 max-w-[280px] font-mono text-xs transition-all motion-btn-press ${
                  isSelected
                    ? "bg-accent-subtle/30 border-accent shadow-sm ring-1 ring-accent"
                    : "bg-surface-subtle border-borderSubtle hover:border-borderStrong text-neutralMuted hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                  <span className="text-accent uppercase">R{item.round || currentRound} Story {idx + 1}</span>
                  <span className="text-neutralMuted uppercase">
                    {item.affectedCompanies?.[0] || item.affectedAsset}
                  </span>
                </div>
                <div className="text-white text-xs font-semibold truncate mt-1">
                  {item.title}
                </div>
              </button>
            );
          })}

          {/* Historical Broadcasts if any */}
          {newsHistory &&
            newsHistory.map((item, idx) => {
              if (roundScenarios.some((s) => s.id === item.id)) return null;
              const isSelected = activeNews?.id === item.id;

              return (
                <button
                  key={`hist-${item.id}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedNewsId(item.id);
                    setViewMode("news");
                  }}
                  className={`px-3 py-2 rounded-ui border text-left shrink-0 max-w-[280px] font-mono text-xs transition-all motion-btn-press ${
                    isSelected
                      ? "bg-accent-subtle/30 border-accent shadow-sm ring-1 ring-accent"
                      : "bg-surface-subtle border-borderSubtle hover:border-borderStrong text-neutralMuted hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                    <span className="text-neutralMuted uppercase">R{item.round || 1} Dispatch</span>
                    <span className="text-neutralMuted uppercase">
                      {item.affectedCompanies?.[0] || item.affectedAsset}
                    </span>
                  </div>
                  <div className="text-white text-xs font-semibold truncate mt-1">
                    {item.title}
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};
