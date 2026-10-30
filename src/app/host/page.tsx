"use client";

import React, { useEffect, useState } from "react";
import { NewsEvent, PlayerPortfolio, RoomState } from "@/types/trading";
import {
  advanceRound,
  createInitialRoom,
  getRoomState,
  resetRoomState,
  saveRoomState,
  spawnBots,
  subscribeToRoom,
  triggerNewsEvent,
  updateRoomStatus,
} from "@/lib/sync/syncService";
import { RoundControl } from "@/components/host/RoundControl";
import { NewsTriggerModal } from "@/components/host/NewsTriggerModal";
import { LiveLeaderboard } from "@/components/shared/LiveLeaderboard";
import { SentimentMeter } from "@/components/trading/SentimentMeter";
import {
  ShieldCheck,
  ExternalLink,
  Download,
  Users,
  Presentation,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "@/lib/constants";

export default function HostDashboardPage() {
  const [roomCode, setRoomCode] = useState("WALLST");
  const [room, setRoom] = useState<RoomState | null>(null);

  useEffect(() => {
    // Initial fetch / creation
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

  const handleUpdateStatus = async (status: RoomState["status"]) => {
    if (!room) return;
    const updated = await updateRoomStatus(room.code, status);
    setRoom(updated);
  };

  const handleAdvanceRound = async () => {
    if (!room) return;
    const updated = await advanceRound(room.code);
    setRoom(updated);
  };

  const handleSpawnBots = async () => {
    if (!room) return;
    const updated = await spawnBots(room.code, 30);
    setRoom(updated);
  };

  const handleResetRoom = async () => {
    if (!window.confirm("Are you sure you want to reset all trades and portfolios for this session?")) {
      return;
    }
    const fresh = await resetRoomState(roomCode);
    setRoom(fresh);
  };

  const handleTriggerNews = async (news: NewsEvent) => {
    if (!room) return;
    const updated = await triggerNewsEvent(room.code, news);
    setRoom(updated);
  };

  const handleExportCSV = () => {
    if (!room) return;
    const playersList = Object.values(room.players).sort(
      (a, b) => b.totalNetWorth - a.totalNetWorth
    );

    const headers = [
      "Rank",
      "Name",
      "Desk",
      "Final Net Worth (INR ₹)",
      "Return (%)",
      "Liquid Cash (₹)",
      "Total Trades",
    ];
    const rows = playersList.map((p, idx) => [
      idx + 1,
      `"${p.name.replace(/"/g, '""')}"`,
      p.desk,
      p.totalNetWorth.toFixed(2),
      p.returnPercent.toFixed(2),
      p.cash.toFixed(2),
      p.totalTrades,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `trading_results_room_${room.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-300 font-bold">Initializing Host Dashboard...</div>
      </div>
    );
  }

  const studentCount = Object.keys(room.players).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Host Header */}
      <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-700 shrink-0">
            <img
              src="/jain-logo.png"
              alt="Jain University Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white">
                JSE <span className="text-cyan-400">Teacher Command Center</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                ROOM: {room.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Jain University Stock Exchange • Orchestrate rounds, news shocks, and student portfolios in ₹ INR.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <a
            href={`/projector/${room.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
          >
            <Presentation className="w-4 h-4" />
            <span>Open Projector View</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Round Controls */}
        <RoundControl
          room={room}
          onUpdateStatus={handleUpdateStatus}
          onAdvanceRound={handleAdvanceRound}
          onSpawnBots={handleSpawnBots}
          onResetRoom={handleResetRoom}
        />

        {/* Sentiment Meter */}
        <SentimentMeter recentTrades={room.recentTrades} />

        {/* News Trigger Panel & Live Standings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NewsTriggerModal
              currentRound={room.currentRound}
              onTriggerNews={handleTriggerNews}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-300">Connected Students</span>
              </div>
              <span className="text-lg font-black font-mono text-white">{studentCount}</span>
            </div>

            <LiveLeaderboard
              players={room.players}
              maxDisplay={15}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
