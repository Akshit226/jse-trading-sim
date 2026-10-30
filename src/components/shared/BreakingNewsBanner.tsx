"use client";

import React, { useEffect, useRef, useState } from "react";
import { NewsEvent } from "@/types/trading";
import { sounds } from "@/lib/audio";
import { newsSpeaker } from "@/lib/voice/newsSpeaker";
import { Bell, AlertTriangle, TrendingUp, Volume2, Mic } from "lucide-react";

interface BreakingNewsBannerProps {
  news: NewsEvent | null;
  onDismiss?: () => void;
}

export const BreakingNewsBanner: React.FC<BreakingNewsBannerProps> = ({ news, onDismiss }) => {
  const lastNewsIdRef = useRef<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = newsSpeaker.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (news && news.id !== lastNewsIdRef.current) {
      lastNewsIdRef.current = news.id;

      // Play alert sound cue
      if (news.soundCue === "crash_alert") {
        sounds.playCrashAlarm();
      } else if (news.soundCue === "bullish_alert") {
        sounds.playTradeSuccess();
      } else {
        sounds.playBreakingNews();
      }

      // Voice narration
      newsSpeaker.speak(news);
    }
  }, [news]);

  if (!news) return null;

  const isBullish = news.sentiment.includes("bullish");
  const isBearish = news.sentiment.includes("bearish");

  const handleReplayVoice = () => {
    newsSpeaker.speak(news);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
        isBearish
          ? "bg-rose-950/90 border-rose-500/80 text-rose-100 glow-red"
          : isBullish
          ? "bg-emerald-950/90 border-emerald-500/80 text-emerald-100 glow-green"
          : "bg-amber-950/90 border-amber-500/80 text-amber-100 glow-gold"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2 rounded-lg ${
              isBearish
                ? "bg-rose-600 text-white"
                : isBullish
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white"
            } animate-bounce-slight`}
          >
            {isBearish ? (
              <AlertTriangle className="w-5 h-5" />
            ) : isBullish ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/40">
                BREAKING MARKET ALERT
              </span>
              <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                TICKER: {news.affectedAsset}
              </span>

              {/* AI Voice Announcer status indicator */}
              {isSpeaking && (
                <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-[10px] font-bold animate-pulse">
                  <Mic className="w-3 h-3 text-cyan-400" />
                  <span>AI Anchor Speaking</span>
                  <span className="inline-flex space-x-0.5 ml-1">
                    <span className="w-1 h-2 bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-3 bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-2 bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black tracking-tight mt-1 text-white">
              {news.title}
            </h3>
            <p className="text-xs sm:text-sm mt-1 opacity-90 leading-relaxed max-w-3xl">
              {news.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-2">
          <button
            onClick={handleReplayVoice}
            title="Read announcement aloud"
            className="flex items-center space-x-1 text-xs bg-black/40 hover:bg-black/60 text-cyan-300 px-2.5 py-1.5 rounded-md border border-cyan-500/30 transition-all"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs bg-black/30 hover:bg-black/50 text-white px-2.5 py-1.5 rounded-md transition-all"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
