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
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface ProjectorNewsHUDProps {
  currentNews: NewsEvent | null;
  newsHistory: NewsEvent[];
  currentRound: number;
  selectedAsset?: Asset;
}

const PRESET_VIDEO_IDS = new Set([
  "r1-tataelxsi-earnings",
  "r1-fmcg-festive-demand",
  "r2-inflation-fmcg",
  "r2-rbi-rate-hike",
  "r3-global-slowdown",
  "r3-coforge-ai-deal",
  "r4-excise-policy",
  "r4-fii-mega-inflow",
  "r5-ofss-mega-dividend",
  "r5-brokerage-upgrade",
]);

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

  // Video anchor state
  const [videoMuted, setVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

      // If pre-rendered anchor video exists, video plays its own anchor voice!
      // If it's a dynamic custom announcement created on the fly, TTS provides speech.
      if (!PRESET_VIDEO_IDS.has(currentNews.id)) {
        newsSpeaker.speak(currentNews);
      }
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
  const hasPreRenderedVideo = activeNews?.id ? PRESET_VIDEO_IDS.has(activeNews.id) : false;

  const handleReplayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="card-surface p-5 sm:p-6 space-y-4 border border-borderSubtle motion-catalyst-shock relative flex flex-col justify-between min-h-[440px]">
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
              <span>Floor Intelligence & Anchor News Desk</span>
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
            <span>Anchor Broadcast</span>
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
          {/* Main Grid: TV News Anchor Video Broadcast (Left) + Catalyst Details (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
            {/* Left: TV News Anchor Broadcast Video Monitor (5 cols) */}
            <div className="lg:col-span-5 flex flex-col rounded-ui overflow-hidden bg-black border border-borderSubtle relative shadow-2xl min-h-[260px] justify-between">
              <div className="relative w-full h-full min-h-[240px] flex items-center justify-center overflow-hidden bg-black">
                {/* News Anchor Video or Studio Avatar */}
                {hasPreRenderedVideo ? (
                  <video
                    ref={videoRef}
                    key={activeNews.id}
                    src={`/videos/news/${activeNews.id}.mp4`}
                    poster="/news-anchor.jpg"
                    autoPlay
                    playsInline
                    muted={videoMuted}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/news-anchor.jpg"
                    alt="JSE News Anchor"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Live Anchor ON-AIR Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-red-500/50 text-[10px] font-mono font-bold text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>ON AIR</span>
                </div>

                {/* Control Overlay (Mute & Replay) */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  {hasPreRenderedVideo && (
                    <button
                      type="button"
                      onClick={handleReplayVideo}
                      className="p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs border border-white/20 transition-all motion-btn-press"
                      title="Replay Anchor Broadcast"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setVideoMuted(!videoMuted)}
                    className="p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs border border-white/20 transition-all motion-btn-press"
                    title={videoMuted ? "Unmute Anchor" : "Mute Anchor"}
                  >
                    {videoMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-neutralMuted" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-accent" />
                    )}
                  </button>
                </div>

                {/* TV News Lower-Thirds Headline Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent p-3 pt-6 font-mono">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                    <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                    <span>JSE Newsroom Anchor Desk</span>
                  </div>
                  <p className="text-white text-xs font-bold truncate leading-tight mt-0.5">
                    {activeNews.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Catalyst Details, Full Story & Leak (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                {/* Catalyst Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-mono font-extrabold uppercase px-2.5 py-0.5 rounded border flex items-center gap-1.5 ${
                      isBullish
                        ? "bg-gain-subtle text-gain border-gain-border"
                        : isBearish
                        ? "bg-loss-subtle text-loss border-loss-border"
                        : "bg-surface-subtle text-warningMuted border-borderSubtle"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>{isBullish ? "Bullish Shock" : isBearish ? "Bearish Shock" : "Alert"}</span>
                  </span>

                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-surface-subtle border border-borderSubtle text-white font-semibold">
                    <span className="text-neutralMuted mr-1">Target:</span>
                    <span className="text-accent font-bold">
                      {activeNews.affectedAsset === "ALL"
                        ? "Market-Wide (All 10)"
                        : activeNews.affectedAsset}
                    </span>
                  </span>

                  <span
                    className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded border flex items-center gap-1 ml-auto tabular-nums ${
                      isPriceUp
                        ? "bg-gain-subtle text-gain border-gain-border"
                        : "bg-loss-subtle text-loss border-loss-border"
                    }`}
                  >
                    {isPriceUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isPriceUp ? "+" : ""}{(activeNews.priceImpact * 100).toFixed(0)}% Shift</span>
                  </span>
                </div>

                {/* High-Impact Headline */}
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {activeNews.title}
                </h1>

                {/* Narrative Details */}
                <div className="p-3.5 rounded-ui bg-surface-subtle/80 border border-borderSubtle text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
                  {activeNews.description}
                </div>

                {/* Confidential Desk Whisper */}
                {activeNews.deskWhisper && (
                  <div className="p-3 rounded-ui bg-accent-subtle/40 border-l-4 border-accent text-xs font-mono text-accent-light space-y-0.5">
                    <div className="flex items-center gap-1 font-bold uppercase tracking-wider text-accent text-[10px]">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Confidential Intelligence ({activeNews.deskWhisper.desk.toUpperCase()})</span>
                    </div>
                    <p className="text-neutral-200 text-[11px] leading-relaxed">
                      {activeNews.deskWhisper.rumorText}
                    </p>
                  </div>
                )}
              </div>

              {/* Timestamp and Broadcaster Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutralMuted pt-2 border-t border-borderSubtle">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>Round {activeNews.round || currentRound} • NSE Live Broadcast</span>
                </div>
                {currentNews && currentNews.id === activeNews.id && (
                  <span className="text-gain font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Market Moving Now
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standby State: When no news has been broadcasted yet */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 my-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-borderSubtle relative mb-1">
            <img src="/news-anchor.jpg" alt="Anchor Standby" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-accent/20" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight uppercase font-mono">
            JSE Newsroom Anchor Desk Online
          </h3>
          <p className="text-xs text-neutralMuted max-w-md font-mono leading-relaxed">
            Anchor is standing by at the broadcast desk. When the instructor releases breaking headlines, earnings beats, or macroeconomic shocks, the anchor will deliver the video broadcast live to the trading floor.
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
              <span>Broadcast Archive ({newsHistory.length} Recorded)</span>
            </span>
            <span>Click any broadcast to replay video</span>
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
                  className={`px-3 py-1.5 rounded-ui border text-left shrink-0 max-w-[260px] font-mono text-xs transition-all motion-btn-press flex items-center gap-2 ${
                    isSelected
                      ? "bg-surface border-accent shadow-sm ring-1 ring-accent"
                      : "bg-surface-subtle border-borderSubtle hover:border-borderStrong text-neutralMuted hover:text-white"
                  }`}
                >
                  <div className="w-7 h-7 rounded overflow-hidden shrink-0 bg-black">
                    <img src="/news-anchor.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                      <span className={itemPos ? "text-gain" : "text-loss"}>
                        {itemPos ? "+" : ""}
                        {(item.priceImpact * 100).toFixed(0)}%
                      </span>
                      <span className="text-neutralMuted">R{item.round || 1}</span>
                    </div>
                    <div className="text-white text-[11px] font-medium truncate">{item.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
