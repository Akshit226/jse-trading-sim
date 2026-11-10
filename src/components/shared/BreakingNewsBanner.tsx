"use client";

import React, { useEffect, useRef, useState } from "react";
import { NewsEvent } from "@/types/trading";
import { getCompanyFullName, getCompanyIndustry } from "@/lib/constants";
import { sounds } from "@/lib/audio";
import { newsSpeaker } from "@/lib/voice/newsSpeaker";
import { X, ChevronRight, Zap, HelpCircle } from "lucide-react";

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
          <div className="card-surface max-w-lg w-full p-6 space-y-4 motion-modal-enter relative">
            <div className="flex items-start justify-between pb-3 border-b border-borderSubtle">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase bg-surface-subtle text-accent border-borderSubtle">
                  Market Catalyst • Desk Analysis Required
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

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {news.description}
            </p>

            {/* Impact Details (NO SPOILERS: Students must decide!) */}
            <div className="p-3 rounded-ui bg-surface-subtle border border-borderSubtle space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutralMuted shrink-0">Target Sector / Equities:</span>
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
                  Evaluate valuation & submit order
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full min-h-touch py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press"
            >
              Analyze & Execute Trade
            </button>
          </div>
        </div>
      )}
    </>
  );
};
