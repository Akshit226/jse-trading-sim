"use client";

import React, { useEffect, useState } from "react";
import { NewsEvent, RoomState } from "@/types/trading";
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
  Download,
  Presentation,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Clock,
  Layers,
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
    const auth = sessionStorage.getItem("jse_teacher_authorized");
    if (auth === "true") setIsAuthorized(true);
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
    const playersList = Object.values(room.players || {}).sort(
      (a, b) => b.totalNetWorth - a.totalNetWorth
    );

    const headers = [
      "Rank",
      "Name",
      "Desk",
      "Final Net Worth (INR)",
      "Return (%)",
      "Liquid Cash",
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

  // LOCKED STATE: PIN Form
  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-app flex flex-col justify-center items-center px-4 py-8">
        <div className="max-w-md w-full card-surface p-6 sm:p-8 space-y-5 motion-modal-enter">
          <div className="text-center space-y-2">
            <div className="bg-white p-2 rounded-ui shadow-sm inline-flex items-center justify-center">
              <img src="/jain-logo.png" alt="Jain Logo" className="h-6 w-auto" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Faculty Facilitator Access</h1>
            <p className="text-xs text-neutralMuted">Enter the 4-digit PIN to unlock facilitator controls.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutralMuted uppercase tracking-wider mb-1 font-mono text-center">
                Security PIN
              </label>
              <input
                type="password"
                autoFocus
                required
                placeholder="••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError(false);
                }}
                className={`w-full min-h-touch bg-surface-subtle border ${
                  pinError ? "border-loss text-loss" : "border-borderSubtle text-white"
                } focus:border-borderFocus rounded-ui px-4 py-2 text-center text-xl font-mono tracking-widest font-bold focus:outline-none`}
              />
              {pinError && (
                <div className="text-xs text-loss font-bold text-center mt-1.5">
                  Invalid PIN. Default facilitator PIN is 2026.
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-touch py-3 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider rounded-ui shadow-ui motion-btn-press"
            >
              Unlock Console
            </button>
          </form>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs text-neutralMuted hover:text-white flex items-center justify-center gap-1 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Floor</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // UNLOCKED STATE: Full Command Center
  return (
    <div className="min-h-screen bg-app text-slate-100 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="border-b border-borderSubtle bg-surface sticky top-0 z-50 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-md shrink-0">
              <img src="/jain-logo.png" alt="Jain Logo" className="h-5 w-auto" />
            </div>
            <div>
              <div className="text-[10px] text-neutralMuted uppercase font-mono font-bold">
                Facilitator Terminal
              </div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Room: {roomCode}</span>
                <span className="text-[10px] font-mono text-gain font-bold px-1.5 py-0.2 rounded bg-gain-subtle border border-gain-border">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/projector/${roomCode}`}
              target="_blank"
              className="min-h-touch px-3 py-1.5 rounded-ui bg-surface-subtle hover:bg-surface border border-borderSubtle text-xs font-bold text-white motion-btn-press flex items-center gap-1.5"
            >
              <Presentation className="w-3.5 h-3.5 text-accent" />
              <span>Projector HUD</span>
            </Link>

            <button
              type="button"
              onClick={handleExportCSV}
              className="min-h-touch px-3 py-1.5 rounded-ui bg-surface-subtle hover:bg-surface border border-borderSubtle text-xs font-bold text-white motion-btn-press flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleLock}
              className="min-h-touch px-3 py-1.5 rounded-ui border border-borderSubtle text-xs font-mono text-neutralMuted hover:text-white"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {room && (
          <>
            {/* Round Controls */}
            <RoundControl
              room={room}
              onUpdateStatus={handleUpdateStatus}
              onAdvanceRound={handleAdvanceRound}
              onSpawnBots={handleSpawnBots}
              onResetRoom={handleResetRoom}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* News Catalyst Dispatcher (7 cols) */}
              <div className="lg:col-span-7">
                <NewsTriggerModal
                  currentRound={room.currentRound}
                  onTriggerNews={handleTriggerNews}
                />
              </div>

              {/* Leaderboard & Floor Sentiment (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <LiveLeaderboard
                  players={room.players}
                  maxDisplay={15}
                />
                <SentimentMeter recentTrades={room.recentTrades} />
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="w-full text-center text-[11px] text-neutralMuted font-mono py-3 border-t border-borderSubtle">
        Jain (Deemed-to-be University) • CMS Bengaluru • Facilitator Console
      </footer>
    </div>
  );
}
