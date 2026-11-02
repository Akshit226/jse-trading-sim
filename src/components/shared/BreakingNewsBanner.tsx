"use client";

import React, { useEffect, useRef, useState } from "react";
import { NewsEvent } from "@/types/trading";
import { getCompanyFullName, getCompanyIndustry } from "@/lib/constants";
import { sounds } from "@/lib/audio";
import { newsSpeaker } from "@/lib/voice/newsSpeaker";
import { X, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface BreakingNewsBannerProps {
  news: NewsEvent | null;
  onDismiss?: () => void;
}

export const BreakingNewsBanner: React.FC<BreakingNewsBannerProps> = ({ news, onDismiss }) => {
  const lastNewsIdRef = useRef<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsub = newsSpeaker.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsub();
  }, []);

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

      newsSpeaker.speak(news);
    }
  }, [news]);

  if (!news || dismissed) return null;

  const isBullish = news.sentiment.includes("bullish");
  const isBearish = news.sentiment.includes("bearish");
  const isPriceUp = news.priceImpact >= 0;

  return (
    <>
      {/* Non-Blocking Floating Catalyst Toast / Pill */}
      <div className="card-surface p-3 border-l-4 transition-colors motion-view-enter relative flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isBullish ? "bg-gain" : isBearish ? "bg-loss" : "bg-warningMuted"
            }`}
          />
          <span className="font-mono font-bold text-white uppercase text-[10px] shrink-0">
            News Catalyst:
          </span>
          <span className="text-white truncate font-medium">{news.title}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-[11px] font-bold text-accent hover:underline flex items-center gap-0.5"
          >
            <span>Details</span>
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
          <div className="card-surface max-w-lg w-full p-6 space-y-4 motion-modal-enter relative">
            <div className="flex items-start justify-between pb-3 border-b border-borderSubtle">
              <div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    isBullish
                      ? "bg-gain-subtle text-gain border-gain-border"
                      : isBearish
                      ? "bg-loss-subtle text-loss border-loss-border"
                      : "bg-surface-subtle text-neutralMuted border-borderSubtle"
                  }`}
                >
                  {isBullish ? "Bullish Catalyst" : isBearish ? "Bearish Shock" : "Market Alert"}
                </span>
                <h3 className="text-base font-bold text-white mt-2 leading-tight">
                  {news.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded text-neutralMuted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutralMuted leading-relaxed">
              {news.description}
            </p>

            {/* Impact Details */}
            <div className="p-3 rounded-ui bg-surface-subtle border border-borderSubtle space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutralMuted shrink-0">Target Sector / Equities:</span>
                <span className="font-bold text-white text-right truncate">
                  {news.affectedAsset === "ALL"
                    ? "Broad Market Index (All Equities)"
                    : news.affectedAsset === "IT"
                    ? "Information Technology Basket"
                    : news.affectedAsset === "FMCG"
                    ? "Fast-Moving Consumer Goods Basket"
                    : `${getCompanyFullName(news.affectedAsset)} (${news.affectedAsset}) • ${getCompanyIndustry(news.affectedAsset)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutralMuted">Expected Volatility Shift:</span>
                <span
                  className={`font-bold flex items-center gap-0.5 tabular-nums ${
                    isPriceUp ? "text-gain" : "text-loss"
                  }`}
                >
                  {isPriceUp ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {isPriceUp ? "+" : ""}
                  {(news.priceImpact * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full min-h-touch py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press"
            >
              Close Dispatch & Resume Trading
            </button>
          </div>
        </div>
      )}
    </>
  );
};
