"use client";

import React, { useEffect, useRef, useState } from "react";
import { NewsEvent } from "@/types/trading";
import { getCompanyFullName, getCompanyIndustry } from "@/lib/constants";
import { sounds } from "@/lib/audio";
import { X, ChevronRight, Zap, HelpCircle, BarChart3, BookOpen, Newspaper } from "lucide-react";

interface BreakingNewsBannerProps {
  news: NewsEvent | null;
  onDismiss?: () => void;
}

export const BreakingNewsBanner: React.FC<BreakingNewsBannerProps> = ({ news, onDismiss }) => {
  const lastNewsIdRef = useRef<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (news && news.id !== lastNewsIdRef.current) {
      lastNewsIdRef.current = news.id;
      setDismissed(false);

      if (news.soundCue === "crash_alert") {
        sounds.playCrashAlarm();
      } else if (news.soundCue === "bullish_alert") {
        sounds.playTradeSuccess();
      } else {
        sounds.playBreakingNews();
      }
    }
  }, [news]);

  if (!news || dismissed) return null;

  return (
    <>
      {/* Non-Blocking Floating Catalyst Toast / Pill */}
      <div className="card-surface p-3 border-l-4 border-accent transition-colors motion-catalyst-shock relative flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0 bg-accent animate-pulse" />
          <span className="font-mono font-bold text-accent uppercase text-[10px] shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Breaking News Wire:
          </span>
          <span className="text-white truncate font-medium">{news.title}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-[11px] font-bold text-accent hover:underline flex items-center gap-0.5"
          >
            <span>Read & Trade</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 text-neutralMuted hover:text-white rounded"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Non-Blocking Sheet / Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-surface max-w-2xl w-full p-5 sm:p-6 space-y-4 motion-modal-enter relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-borderSubtle">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase bg-surface-subtle text-accent border-borderSubtle flex items-center gap-1.5 w-fit">
                  <Newspaper className="w-3 h-3 text-accent" />
                  <span>Financial Dispatch • Desk Analysis Required</span>
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-2 leading-tight">
                  {news.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded text-neutralMuted hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Narrative Article Text */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-surface-subtle/50 p-3.5 rounded-ui border border-borderSubtle">
              {news.newspaperBody && news.newspaperBody.length > 0 ? (
                news.newspaperBody.map((paragraph, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="leading-relaxed">{news.description}</p>
              )}
            </div>

            {/* Key Accounting & Financial Indicators Breakdown */}
            {news.financialMetrics && (
              <div className="p-3.5 rounded-ui bg-surface border border-accent/30 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-borderSubtle">
                  <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Financial Statement Indicators</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutralMuted uppercase">
                    P&L & Balance Sheet
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {news.financialMetrics.revenue && (
                    <div className="p-2.5 bg-surface-subtle rounded-ui border border-borderSubtle space-y-0.5">
                      <div className="text-[10px] font-mono uppercase text-neutralMuted font-bold">
                        Topline Revenue
                      </div>
                      <div className="text-xs font-bold text-white font-mono">
                        {news.financialMetrics.revenue}
                      </div>
                    </div>
                  )}

                  {news.financialMetrics.operatingProfit && (
                    <div className="p-2.5 bg-surface-subtle rounded-ui border border-borderSubtle space-y-0.5">
                      <div className="text-[10px] font-mono uppercase text-neutralMuted font-bold">
                        Operating EBITDA & Margins
                      </div>
                      <div className="text-xs font-bold text-white font-mono">
                        {news.financialMetrics.operatingProfit}
                      </div>
                    </div>
                  )}

                  {news.financialMetrics.netProfit && (
                    <div className="p-2.5 bg-surface-subtle rounded-ui border border-borderSubtle space-y-0.5">
                      <div className="text-[10px] font-mono uppercase text-neutralMuted font-bold">
                        Bottomline Net Profit (PAT)
                      </div>
                      <div className="text-xs font-bold text-white font-mono">
                        {news.financialMetrics.netProfit}
                      </div>
                    </div>
                  )}

                  {news.financialMetrics.cashFlowOrDebt && (
                    <div className="p-2.5 bg-surface-subtle rounded-ui border border-borderSubtle space-y-0.5">
                      <div className="text-[10px] font-mono uppercase text-neutralMuted font-bold">
                        Cash Flow / Balance Sheet
                      </div>
                      <div className="text-xs font-bold text-white font-mono">
                        {news.financialMetrics.cashFlowOrDebt}
                      </div>
                    </div>
                  )}
                </div>

                {/* Educational Concept Highlight */}
                <div className="p-3 rounded-ui bg-accent/10 border border-accent/20 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-accent font-mono text-[11px] uppercase tracking-wide">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Accounting Term: {news.financialMetrics.keyAccountingConcept}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed font-sans">
                    {news.financialMetrics.accountingExplanation}
                  </p>
                </div>
              </div>
            )}

            {/* Target Sector / Equities */}
            <div className="p-3 rounded-ui bg-surface-subtle border border-borderSubtle space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutralMuted shrink-0">Target Equities:</span>
                <span className="font-bold text-white text-right truncate">
                  {news.affectedSector ||
                    (news.affectedAsset === "ALL"
                      ? "Broad Market Index (All 10 Bluechips)"
                      : `${getCompanyFullName(news.affectedAsset)} (${news.affectedAsset}) • ${getCompanyIndustry(news.affectedAsset)}`)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-borderSubtle pt-1.5">
                <span className="text-neutralMuted flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-accent" />
                  <span>Floor Trading Task:</span>
                </span>
                <span className="font-bold text-accent">
                  Analyze financial health & submit order
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full min-h-touch py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press cursor-pointer"
            >
              Analyze & Execute Trade
            </button>
          </div>
        </div>
      )}
    </>
  );
};
