"use client";

import React, { useState } from "react";
import { AssetId, NewsEvent, NewsSentiment } from "@/types/trading";
import { PRESET_NEWS_SCENARIOS } from "@/lib/engine/newsScenarios";
import { Sparkles, Send, AlertTriangle, TrendingUp, TrendingDown, Radio } from "lucide-react";

interface NewsTriggerModalProps {
  currentRound: number;
  onTriggerNews: (news: NewsEvent) => Promise<void>;
}

export const NewsTriggerModal: React.FC<NewsTriggerModalProps> = ({
  currentRound,
  onTriggerNews,
}) => {
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customAsset, setCustomAsset] = useState<AssetId | "ALL" | "IT" | "FMCG">("MPHASIS");
  const [customImpact, setCustomImpact] = useState<number>(15);
  const [customSentiment, setCustomSentiment] = useState<NewsSentiment>("strongly_bullish");

  const handleTriggerPreset = (preset: NewsEvent) => {
    onTriggerNews(preset);
  };

  const handleTriggerCustom = () => {
    if (!customTitle.trim()) return;

    const news: NewsEvent = {
      id: `custom_${Date.now()}`,
      round: currentRound,
      title: customTitle,
      description: customDesc || "Unscheduled breaking market event reported by financial wires.",
      affectedAsset: customAsset,
      sentiment: customSentiment,
      priceImpact: customImpact / 100,
      soundCue: customImpact < 0 ? "crash_alert" : "bullish_alert",
      timestamp: Date.now(),
    };

    onTriggerNews(news);
    setCustomTitle("");
    setCustomDesc("");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
      <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-800">
        <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
        <h3 className="text-base font-black text-white tracking-wide uppercase">
          News & Sentiment Shock Palette
        </h3>
      </div>

      {/* Preset Curated Scenarios */}
      <div className="mb-6">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Curated Indian Stock Market Scenarios (Round {currentRound})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_NEWS_SCENARIOS.map((preset) => {
            const isBullish = preset.sentiment.includes("bullish");
            const isBearish = preset.sentiment.includes("bearish");

            return (
              <div
                key={preset.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      R{preset.round} • {preset.affectedAsset}
                    </span>
                    <span
                      className={`text-xs font-black font-mono flex items-center ${
                        isBullish
                          ? "text-emerald-400"
                          : isBearish
                          ? "text-rose-400"
                          : "text-amber-400"
                      }`}
                    >
                      {preset.priceImpact > 0 ? "+" : ""}
                      {(preset.priceImpact * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{preset.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {preset.description}
                  </p>
                </div>

                <button
                  onClick={() => handleTriggerPreset(preset)}
                  className={`mt-2.5 py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
                    isBearish
                      ? "bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60"
                      : "bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/60"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>TRIGGER SHOCK</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Headline Creator */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
          <Send className="w-3.5 h-3.5 text-cyan-400" />
          <span>Broadcast Custom Classroom Headline</span>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Headline (e.g. 'FII block purchase triggers 10% upper circuit on Coforge!')"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />

          <input
            type="text"
            placeholder="Brief story / market rationale..."
            value={customDesc}
            onChange={(e) => setCustomDesc(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                Affected Ticker
              </label>
              <select
                value={customAsset}
                onChange={(e) => setCustomAsset(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="MPHASIS">MPHASIS (Mphasis)</option>
                <option value="COFORGE">COFORGE (Coforge)</option>
                <option value="OFSS">OFSS (Oracle Financial)</option>
                <option value="LTTS">LTTS (L&T Tech)</option>
                <option value="TATAELXSI">TATAELXSI (Tata Elxsi)</option>
                <option value="COLPAL">COLPAL (Colgate)</option>
                <option value="PGHH">PGHH (P&G Hygiene)</option>
                <option value="RADICO">RADICO (Radico Khaitan)</option>
                <option value="UBL">UBL (United Breweries)</option>
                <option value="GILLETTE">GILLETTE (Gillette)</option>
                <option value="IT">IT (All IT Stocks)</option>
                <option value="FMCG">FMCG (All FMCG Stocks)</option>
                <option value="ALL">ALL (Market-Wide)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                Price Impact (%)
              </label>
              <input
                type="number"
                value={customImpact}
                onChange={(e) => setCustomImpact(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                Sentiment
              </label>
              <select
                value={customSentiment}
                onChange={(e) => setCustomSentiment(e.target.value as NewsSentiment)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="strongly_bullish">Strongly Bullish</option>
                <option value="bullish">Bullish</option>
                <option value="neutral">Neutral</option>
                <option value="bearish">Bearish</option>
                <option value="strongly_bearish">Strongly Bearish</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleTriggerCustom}
            disabled={!customTitle.trim()}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
          >
            Broadcast to All Screens & Audio Speaker
          </button>
        </div>
      </div>
    </div>
  );
};
