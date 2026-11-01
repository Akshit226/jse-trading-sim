"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { AssetId, NewsEvent, RoomState } from "@/types/trading";
import {
  createInitialRoom,
  getRoomState,
  saveRoomState,
  subscribeToRoom,
} from "@/lib/sync/syncService";
import { PriceChart } from "@/components/trading/PriceChart";
import { LiveLeaderboard } from "@/components/shared/LiveLeaderboard";
import { SentimentMeter } from "@/components/trading/SentimentMeter";
import { BreakingNewsBanner } from "@/components/shared/BreakingNewsBanner";
import { formatINR } from "@/lib/constants";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Volume2,
  VolumeX,
  Radio,
  Layers,
} from "lucide-react";
import { sounds } from "@/lib/audio";
import { newsSpeaker } from "@/lib/voice/newsSpeaker";

export default function ProjectorDisplayPage() {
  const params = useParams();
  const roomCode = ((params?.code as string) || "WALLST").toUpperCase();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId>("MPHASIS");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [originUrl, setOriginUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
    }

    getRoomState(roomCode).then((existing) => {
      if (existing) {
        setRoom(existing);
      } else {
        const init = createInitialRoom(roomCode);
        saveRoomState(init);
        setRoom(init);
      }
    });

    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Celebrate on game end
  useEffect(() => {
    if (room?.status === "ENDED") {
      sounds.playBell();
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  }, [room?.status]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    newsSpeaker.setEnabled(next);
  };

  const joinUrl = `${originUrl}/play/${roomCode}`;

  const top3 = useMemo(() => {
    if (!room) return [];
    return Object.values(room.players)
      .sort((a, b) => b.totalNetWorth - a.totalNetWorth)
      .slice(0, 3);
  }, [room?.players]);

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold">Connecting Projector to Trading Floor ({roomCode})...</h2>
      </div>
    );
  }

  const selectedAsset = room.assets[selectedAssetId];

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 p-4 sm:p-6 flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Top Banner: Market Status, QR Code, Simulation Info */}
      <header className="glass-card rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-700 shrink-0">
            <img
              src="/jain-logo.png"
              alt="Jain University Logo"
              className="h-9 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                JSE <span className="text-cyan-400">• Jain University Stock Exchange</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-extrabold bg-slate-800 text-amber-300 border border-amber-500/30">
                PIN: {room.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Round {room.currentRound} of {room.totalRounds} •{" "}
              <span
                className={`font-black uppercase tracking-wider ${
                  room.status === "ACTIVE"
                    ? "text-emerald-400 animate-pulse"
                    : room.status === "PAUSED"
                    ? "text-amber-400"
                    : "text-slate-400"
                }`}
              >
                ● {room.status === "ACTIVE" ? "MARKET OPEN (TRADING LIVE)" : room.status === "PAUSED" ? "MARKET PAUSED" : "PRE-OPEN LOBBY"}
              </span>{" "}
              • Previous Close Opening Rule Active
            </p>
          </div>
        </div>

        {/* QR Code and Join URL */}
        <div className="flex items-center space-x-3.5 bg-slate-950/90 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-lg neon-glow-cyan">
          <div className="bg-white p-1 rounded-lg shrink-0">
            <QRCodeSVG value={joinUrl} size={50} />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Scan Phone to Trade
            </div>
            <div className="text-xs font-black text-white font-mono">{room.code}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{originUrl}</div>
          </div>

          <button
            onClick={toggleSound}
            title="Toggle Audio & AI Voice Anchor"
            className="p-2 ml-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </header>

      {/* Market Ticker Strip across the 10 Indian equities (Inspired by View 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-2 font-mono text-xs mb-4">
        {(Object.keys(room.assets) as AssetId[]).map((aid) => {
          const a = room.assets[aid];
          const isPos = a.changePercent >= 0;
          const isSelected = selectedAssetId === aid;

          return (
            <button
              key={aid}
              onClick={() => setSelectedAssetId(aid)}
              className={`p-2.5 rounded-xl text-left border-l-4 transition-all glass-card ${
                isPos ? "border-l-emerald-400" : "border-l-rose-500"
              } ${isSelected ? "ring-2 ring-cyan-400 bg-slate-800/80" : "hover:bg-slate-800/40"}`}
            >
              <div className="text-slate-400 text-[10px] font-bold">{aid}</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate">{formatINR(a.currentPrice)}</div>
              <div
                className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                  isPos ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPos ? "+" : ""}
                {a.changePercent.toFixed(1)}%
              </div>
            </button>
          );
        })}
      </div>

      {/* Grand Finale Podium when Game Ends */}
      {room.status === "ENDED" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center my-4 animate-in fade-in duration-700">
          <Sparkles className="w-12 h-12 text-amber-400 mb-3 animate-spin" />
          <h2 className="text-4xl font-black text-white tracking-tight uppercase">
            Market Closed: Final Podium
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            Congratulations to the top traders of the classroom!
          </p>

          <div className="flex items-end justify-center space-x-6 w-full max-w-2xl mb-8">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="flex flex-col items-center w-1/3">
                <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-950 flex items-center justify-center font-black mb-2 shadow-lg">
                  <Medal className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-sm text-white line-clamp-1">{top3[1].name}</span>
                <span className="font-mono text-xs text-emerald-400 font-bold mb-2">
                  {formatINR(top3[1].totalNetWorth)} (+{top3[1].returnPercent}%)
                </span>
                <div className="w-full bg-slate-800 border border-slate-700 rounded-t-xl h-36 flex items-center justify-center font-black text-2xl text-slate-400">
                  #2
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="flex flex-col items-center w-1/3">
                <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black mb-2 shadow-2xl shadow-amber-400/50 glow-gold">
                  <Trophy className="w-8 h-8" />
                </div>
                <span className="font-black text-base text-white line-clamp-1">{top3[0].name}</span>
                <span className="font-mono text-sm text-emerald-400 font-bold mb-2">
                  {formatINR(top3[0].totalNetWorth)} (+{top3[0].returnPercent}%)
                </span>
                <div className="w-full bg-amber-500/20 border-2 border-amber-400 rounded-t-xl h-48 flex items-center justify-center font-black text-3xl text-amber-400 shadow-xl">
                  #1
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="flex flex-col items-center w-1/3">
                <div className="w-12 h-12 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-black mb-2 shadow-lg">
                  <Award className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-sm text-white line-clamp-1">{top3[2].name}</span>
                <span className="font-mono text-xs text-emerald-400 font-bold mb-2">
                  {formatINR(top3[2].totalNetWorth)} (+{top3[2].returnPercent}%)
                </span>
                <div className="w-full bg-slate-800 border border-slate-700 rounded-t-xl h-28 flex items-center justify-center font-black text-xl text-slate-400">
                  #3
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active Trading Floor Grid */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          {/* Left Column: Big Chart & Breaking News */}
          <div className="lg:col-span-2 space-y-4">
            {/* Breaking News Banner with Audio Narration */}
            <BreakingNewsBanner news={room.currentNews} />

            {/* Big Presentation Chart */}
            {selectedAsset && (
              <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-2xl">
                <PriceChart asset={selectedAsset} height={360} />
              </div>
            )}

            {/* Live Trade Ticker Stream */}
            <div className="glass-card rounded-2xl p-4 shadow-xl">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-mono">Real-Time Execution Stream (Live Orders)</span>
              </div>

              <div className="flex space-x-3 overflow-x-auto pb-1 text-xs font-mono">
                {room.recentTrades.length === 0 ? (
                  <span className="text-slate-500 italic py-1">Waiting for student orders...</span>
                ) : (
                  room.recentTrades.slice(0, 10).map((trade) => {
                    const isBuy = trade.side === "BUY";
                    return (
                      <div
                        key={trade.id}
                        className={`shrink-0 px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${
                          isBuy
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-950/50"
                            : "bg-rose-950/40 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950/50"
                        }`}
                      >
                        <span className="font-bold text-white">{trade.playerName}</span>
                        <span className="font-black text-[10px] px-1 py-0.2 rounded bg-black/40">{trade.side}</span>
                        <span>
                          {trade.quantity} {trade.assetId}
                        </span>
                        <span className="opacity-80">@ {formatINR(trade.price)}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Leaderboard & Sentiment */}
          <div className="space-y-4">
            <SentimentMeter recentTrades={room.recentTrades} />
            <LiveLeaderboard players={room.players} maxDisplay={12} />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="text-center text-xs text-slate-500 font-mono py-2">
        JSE — Jain University Stock Exchange Simulation Engine (₹ INR)
      </footer>
    </div>
  );
}
