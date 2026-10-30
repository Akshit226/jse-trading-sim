"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  AssetId,
  PlayerPortfolio,
  RoomState,
  StudentDesk,
  TradeOrder,
} from "@/types/trading";
import { STARTING_CASH, DESK_METADATA, DESK_STARTING_PORTFOLIOS, formatINR } from "@/lib/constants";
import {
  joinPlayer,
  submitOrder,
  subscribeToRoom,
} from "@/lib/sync/syncService";
import { PriceChart } from "@/components/trading/PriceChart";
import { TradePad } from "@/components/trading/TradePad";
import { PortfolioCard } from "@/components/trading/PortfolioCard";
import { SentimentMeter } from "@/components/trading/SentimentMeter";
import { BreakingNewsBanner } from "@/components/shared/BreakingNewsBanner";
import { LiveLeaderboard } from "@/components/shared/LiveLeaderboard";
import { sounds } from "@/lib/audio";
import { newsSpeaker } from "@/lib/voice/newsSpeaker";
import {
  TrendingUp,
  Volume2,
  VolumeX,
  Trophy,
  Activity,
  User,
} from "lucide-react";

function PlayRoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = ((params?.code as string) || "WALLST").toUpperCase();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"trade" | "portfolio" | "leaderboard">("trade");
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId>("MPHASIS");

  // Initialize or fetch student identity
  useEffect(() => {
    let pid = localStorage.getItem("trading_sim_player_id");
    if (!pid) {
      pid = `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      localStorage.setItem("trading_sim_player_id", pid);
    }
    setPlayerId(pid);

    const name = searchParams.get("name") || localStorage.getItem("trading_sim_player_name") || "Student Trader";
    const desk =
      (searchParams.get("desk") as StudentDesk) ||
      (localStorage.getItem("trading_sim_player_desk") as StudentDesk) ||
      "tech_analyst";

    localStorage.setItem("trading_sim_player_name", name);
    localStorage.setItem("trading_sim_player_desk", desk);

    const deskSetup = DESK_STARTING_PORTFOLIOS[desk] || {
      cash: STARTING_CASH,
      shares: {
        MPHASIS: 0,
        COFORGE: 0,
        OFSS: 0,
        LTTS: 0,
        TATAELXSI: 0,
        COLPAL: 0,
        PGHH: 0,
        RADICO: 0,
        UBL: 0,
        GILLETTE: 0,
      },
    };

    const initialPortfolio: PlayerPortfolio = {
      id: pid,
      name,
      desk,
      cash: deskSetup.cash,
      shares: { ...deskSetup.shares },
      totalNetWorth: STARTING_CASH,
      initialNetWorth: STARTING_CASH,
      returnPercent: 0,
      totalTrades: 0,
      realizedPnL: 0,
      rank: 1,
      lastActive: Date.now(),
    };

    joinPlayer(roomCode, initialPortfolio).then((updatedRoom) => {
      setRoom(updatedRoom);
    });
  }, [roomCode, searchParams]);

  // Real-time room subscription
  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => unsubscribe();
  }, [roomCode]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    newsSpeaker.setEnabled(next);
  };

  const currentPlayer = useMemo(() => {
    if (!room || !playerId) return null;
    if (room.players[playerId]) return room.players[playerId];

    // Fallback if player registration is in flight
    const name = localStorage.getItem("trading_sim_player_name") || "Student Trader";
    const desk = (localStorage.getItem("trading_sim_player_desk") as StudentDesk) || "tech_analyst";
    const deskSetup = DESK_STARTING_PORTFOLIOS[desk] || {
      cash: STARTING_CASH,
      shares: {
        MPHASIS: 0,
        COFORGE: 0,
        OFSS: 0,
        LTTS: 0,
        TATAELXSI: 0,
        COLPAL: 0,
        PGHH: 0,
        RADICO: 0,
        UBL: 0,
        GILLETTE: 0,
      },
    };

    return {
      id: playerId,
      name,
      desk,
      cash: deskSetup.cash,
      shares: { ...deskSetup.shares },
      totalNetWorth: STARTING_CASH,
      initialNetWorth: STARTING_CASH,
      returnPercent: 0,
      totalTrades: 0,
      realizedPnL: 0,
      rank: Object.keys(room.players).length + 1,
      lastActive: Date.now(),
    };
  }, [room, playerId]);

  const handleExecuteTrade = async (order: TradeOrder) => {
    return await submitOrder(roomCode, order);
  };

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-300">Connecting to Indian Trading Floor ({roomCode})...</p>
      </div>
    );
  }

  const selectedAsset = room.assets[selectedAssetId];
  const deskInfo = DESK_METADATA[currentPlayer.desk];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 bg-white rounded-lg border border-slate-700 shrink-0">
              <img
                src="/jain-logo.png"
                alt="Jain University"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-extrabold text-white leading-tight">
                  {currentPlayer.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  #{currentPlayer.rank}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {deskInfo?.name || currentPlayer.desk} • JSE PIN: {roomCode}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total Net Worth
              </div>
              <div className="text-sm sm:text-base font-black font-mono text-emerald-400">
                {formatINR(currentPlayer.totalNetWorth)}
              </div>
            </div>

            <button
              onClick={toggleSound}
              title="Toggle Audio & AI Voice"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Breaking News Banner with Audio Narration */}
        <BreakingNewsBanner news={room.currentNews} />

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab("trade")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === "trade"
                ? "bg-cyan-600 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Trading Pad</span>
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === "portfolio"
                ? "bg-cyan-600 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>My Portfolio</span>
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === "leaderboard"
                ? "bg-cyan-600 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Rankings ({Object.keys(room.players).length})</span>
          </button>
        </div>

        {/* Dynamic Views based on tab */}
        {activeTab === "trade" && (
          <div className="space-y-4">
            {/* Synchronized Price Chart */}
            {selectedAsset && (
              <PriceChart asset={selectedAsset} height={220} />
            )}

            {/* Sentiment Gauge */}
            <SentimentMeter recentTrades={room.recentTrades} />

            {/* 1-Click Buy / Sell Pad */}
            <TradePad
              player={currentPlayer}
              room={room}
              onTrade={handleExecuteTrade}
              selectedAssetId={selectedAssetId}
              onSelectAsset={setSelectedAssetId}
            />
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-4">
            <PortfolioCard player={currentPlayer} room={room} />
            <SentimentMeter recentTrades={room.recentTrades} />
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="space-y-4">
            <LiveLeaderboard
              players={room.players}
              currentPlayerId={currentPlayer.id}
              maxDisplay={35}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function PlayRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-300">Loading Trading Terminal...</p>
        </div>
      }
    >
      <PlayRoomContent />
    </Suspense>
  );
}
