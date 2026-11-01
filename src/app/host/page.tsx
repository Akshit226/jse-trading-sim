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
  Lock,
  KeyRound,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { formatINR, DEFAULT_TEACHER_PIN } from "@/lib/constants";
import Link from "next/link";

export default function HostDashboardPage() {
  const [roomCode, setRoomCode] = useState("WALLST");
  const [room, setRoom] = useState<RoomState | null>(null);

  // Security gate state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    // Check if session was already authenticated
    const auth = sessionStorage.getItem("jse_teacher_authorized");
    if (auth === "true") {
      setIsAuthorized(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === DEFAULT_TEACHER_PIN) {
      setIsAuthorized(true);
      setPinError(false);
      sessionStorage.setItem("jse_teacher_authorized", "true");
    } else {
      setPinError(true);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem("jse_teacher_authorized");
    setIsAuthorized(false);
    setPinInput("");
  };

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

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl border border-slate-700 mb-3">
              <img
                src="/jain-logo.png"
                alt="Jain University Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-950/60 border border-purple-500/30 rounded-full text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Restricted Faculty Cockpit</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Teacher Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter the teacher security PIN to manage trading rounds, news shocks, and room states.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Faculty Security PIN</span>
                <span className="text-[10px] text-slate-500 lowercase">(default: 2026)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(false);
                  }}
                  className={`w-full bg-slate-950 border ${
                    pinError ? "border-rose-500 text-rose-300" : "border-slate-700 text-white"
                  } rounded-xl px-4 py-3 text-center text-lg font-mono tracking-[0.4em] font-black focus:outline-none focus:border-cyan-400`}
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {pinError && (
                <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-bold mt-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Access Denied: Incorrect Teacher PIN.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-950/50 flex items-center justify-center space-x-2 transition-all uppercase tracking-wider"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Market Controls</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Student Trading Portal</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
      <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 glass-card rounded-2xl p-4 shadow-xl">
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
                JSE <span className="text-cyan-400">Faculty Command Terminal</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                PIN: {room.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Jain University Stock Exchange • Orchestrate rounds, macro catalysts, and student portfolios in ₹ INR.
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

          <button
            onClick={handleLock}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800/80 hover:bg-rose-950/60 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
            title="Lock Console"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Lock Console</span>
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

        {/* Telemetry Stats Cards (Inspired by View 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-mono">Live Nodes</span>
              <span className="text-2xl font-black text-white">{studentCount} <span className="text-xs font-normal text-slate-400">Traders</span></span>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-400 font-medium flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active
              </span>
              <span className="text-[11px] text-cyan-400 font-mono mt-0.5 block">
                Room: {room.code}
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-mono">Total Executions</span>
              <span className="text-2xl font-black text-cyan-400">{room.recentTrades.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-mono">Market Session</span>
              <span className="text-xl font-black text-emerald-400">
                {room.status === "ACTIVE" ? "TRADING LIVE" : room.status === "PAUSED" ? "HALTED" : "LOBBY"}
              </span>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              <div>Round {room.currentRound} / {room.totalRounds}</div>
              <div className="text-[11px] text-amber-400">₹10 Lakh Base</div>
            </div>
          </div>
        </div>

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
