"use client";

import React, { useState } from "react";
import { AssetId, NewsEvent, NewsSentiment } from "@/types/trading";
import { PRESET_NEWS_SCENARIOS } from "@/lib/engine/newsScenarios";
import { Radio, Send, ArrowUpRight, ArrowDownRight, CheckSquare, Square, HelpCircle, BookOpen } from "lucide-react";

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
  const [customAsset, setCustomAsset] = useState<AssetId | "ALL" | "IT" | "AUTO" | "BANKING" | "FMCG">("RELIANCE");
  const [customImpact, setCustomImpact] = useState<number>(15);
  const [customSentiment, setCustomSentiment] = useState<NewsSentiment>("strongly_bullish");
  
  // Default to market-driven so prices don't artificially jump; students decide through order flow!
  const [marketDriven, setMarketDriven] = useState<boolean>(true);

  const handleTriggerPreset = (preset: NewsEvent) => {
    onTriggerNews({
      ...preset,
      marketDriven,
    });
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
      marketDriven,
      timestamp: Date.now(),
    };

    onTriggerNews(news);
    setCustomTitle("");
    setCustomDesc("");
  };

  return (
    <div className="card-surface p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-borderSubtle">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            News Catalyst & Wire Dispatcher
          </h3>
        </div>

        {/* Market-Driven Mode Toggle */}
        <button
          type="button"
          onClick={() => setMarketDriven(!marketDriven)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-ui border text-xs font-mono transition-all motion-btn-press ${
            marketDriven
              ? "bg-accent-subtle/40 border-accent text-accent-light font-bold"
              : "bg-surface-subtle border-borderSubtle text-neutralMuted hover:text-white"
          }`}
          title="Toggle whether prices move by student trading decisions or instant shock"
        >
          {marketDriven ? <CheckSquare className="w-3.5 h-3.5 text-accent" /> : <Square className="w-3.5 h-3.5" />}
          <span>{marketDriven ? "Market-Driven (Students Decide)" : "Forced Instant Price Jump"}</span>
        </button>
      </div>

      <div className="text-[11px] font-mono text-neutralMuted flex items-center gap-1.5 bg-surface-subtle/60 p-2.5 rounded-ui border border-borderSubtle">
        <HelpCircle className="w-3.5 h-3.5 text-accent shrink-0" />
        <span>
          {marketDriven
            ? "Market-Driven Active: News is broadcasted to the projector & student phones without price spoilers. Asset prices will move naturally based on student & bot trading orders."
            : "Forced Instant Mode: The stock price will immediately jump upon clicking broadcast."}
        </span>
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
                      {(preset.priceImpact * 100).toFixed(0)}% Reference
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white leading-snug">
                    {preset.title}
                  </div>
                  {preset.financialMetrics && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-accent font-bold">
                      <BookOpen className="w-3 h-3 text-accent" />
                      <span>Concept: {preset.financialMetrics.keyAccountingConcept}</span>
                    </div>
                  )}
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
                  <span>{marketDriven ? "Broadcast News Wire" : "Broadcast Shock"}</span>
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
              <option value="ALL">ALL — Broad Market Macro Index</option>
              <option value="AUTO">AUTO — Automobile Sector (Tata Motors, Maruti)</option>
              <option value="IT">IT — Information Technology (TCS, Infosys)</option>
              <option value="BANKING">BANKING — Banking & Finance (HDFC Bank, SBI)</option>
              <option value="FMCG">FMCG — Consumer Goods (ITC, Zomato)</option>
              <option value="RELIANCE">RELIANCE — Reliance Industries Limited (Energy & Jio 5G)</option>
              <option value="TATAMOTORS">TATAMOTORS — Tata Motors Limited (Automotive & EVs)</option>
              <option value="TCS">TCS — Tata Consultancy Services Limited (IT Powerhouse)</option>
              <option value="HDFCBANK">HDFCBANK — HDFC Bank Limited (Private Banking Giant)</option>
              <option value="INFY">INFY — Infosys Limited (Global Software Exporter)</option>
              <option value="ITC">ITC — ITC Limited (FMCG Fortress & Hotels)</option>
              <option value="ZOMATO">ZOMATO — Zomato Limited (Quick Commerce & Blinkit)</option>
              <option value="ADANIENT">ADANIENT — Adani Enterprises Limited (Infra & Energy)</option>
              <option value="SBIN">SBIN — State Bank of India (Public Sector Banking)</option>
              <option value="MARUTI">MARUTI — Maruti Suzuki India Limited (Passenger Auto King)</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTriggerCustom}
          disabled={!customTitle.trim()}
          className="w-full min-h-touch py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press disabled:opacity-30 disabled:pointer-events-none"
        >
          {marketDriven ? "Broadcast Custom News Wire" : "Inject Custom Market Shock"}
        </button>
      </div>
    </div>
  );
};
