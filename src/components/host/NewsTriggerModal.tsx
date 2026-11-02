"use client";

import React, { useState } from "react";
import { AssetId, NewsEvent, NewsSentiment } from "@/types/trading";
import { PRESET_NEWS_SCENARIOS } from "@/lib/engine/newsScenarios";
import { Radio, Send, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
    <div className="card-surface p-5 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle">
        <Radio className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          News Catalyst & Shock Dispatcher
        </h3>
      </div>

      {/* Preset Curated Scenarios */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-neutralMuted uppercase tracking-wider font-mono">
          Curated Catalysts (Round {currentRound})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_NEWS_SCENARIOS.map((preset) => {
            const isBullish = preset.sentiment.includes("bullish");
            const isBearish = preset.sentiment.includes("bearish");

            return (
              <div
                key={preset.id}
                className="bg-surface-subtle border border-borderSubtle rounded-ui p-3.5 flex flex-col justify-between hover:border-borderStrong transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 font-mono text-[10px]">
                    <span className="font-bold text-neutralMuted uppercase px-1.5 py-0.2 rounded bg-surface border border-borderSubtle">
                      R{preset.round} • {preset.affectedAsset}
                    </span>
                    <span
                      className={`font-bold flex items-center tabular-nums ${
                        isBullish ? "text-gain" : isBearish ? "text-loss" : "text-neutralMuted"
                      }`}
                    >
                      {isBullish ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : isBearish ? (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      ) : null}
                      {preset.priceImpact >= 0 ? "+" : ""}
                      {(preset.priceImpact * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white leading-snug">
                    {preset.title}
                  </div>
                  <p className="text-[11px] text-neutralMuted mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerPreset(preset)}
                  className="mt-3 w-full min-h-touch py-1.5 px-3 bg-surface hover:bg-surface-elevated border border-borderSubtle hover:border-borderStrong rounded-ui text-xs font-bold text-white motion-btn-press flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3 text-accent" />
                  <span>Broadcast Shock</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Scenario Builder */}
      <div className="pt-3 border-t border-borderSubtle space-y-3">
        <div className="text-xs font-bold text-neutralMuted uppercase tracking-wider font-mono">
          Custom Live Catalyst
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] text-neutralMuted mb-1 font-mono">Headline</label>
            <input
              type="text"
              placeholder="e.g. Unscheduled SEBI algorithmic inquiry"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-surface-subtle border border-borderSubtle focus:border-borderFocus rounded-ui px-3 py-2 text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutralMuted mb-1 font-mono">Target Asset</label>
            <select
              value={customAsset}
              onChange={(e) => setCustomAsset(e.target.value as any)}
              className="w-full bg-surface-subtle border border-borderSubtle focus:border-borderFocus rounded-ui px-3 py-2 text-white text-xs font-mono focus:outline-none"
            >
              <option value="ALL">ALL — Broad Market Index</option>
              <option value="IT">IT — Sector Basket</option>
              <option value="FMCG">FMCG — Staples Basket</option>
              <option value="COFORGE">COFORGE</option>
              <option value="MPHASIS">MPHASIS</option>
              <option value="OFSS">OFSS</option>
              <option value="COLPAL">COLPAL</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTriggerCustom}
          disabled={!customTitle.trim()}
          className="w-full min-h-touch py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press disabled:opacity-30 disabled:pointer-events-none"
        >
          Inject Custom Market Shock
        </button>
      </div>
    </div>
  );
};
