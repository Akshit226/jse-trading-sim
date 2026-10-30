"use client";

import React, { useEffect, useState } from "react";
import { RoomState } from "@/types/trading";
import { sounds } from "@/lib/audio";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Users,
  BellRing,
  Bot,
  Zap,
} from "lucide-react";
import {
  isBotSimulationRunning,
  startBotSimulation,
  stopBotSimulation,
} from "@/lib/sync/botSimulator";

interface RoundControlProps {
  room: RoomState;
  onUpdateStatus: (status: RoomState["status"]) => Promise<void>;
  onAdvanceRound: () => Promise<void>;
  onSpawnBots: () => Promise<void>;
  onResetRoom: () => Promise<void>;
}

export const RoundControl: React.FC<RoundControlProps> = ({
  room,
  onUpdateStatus,
  onAdvanceRound,
  onSpawnBots,
  onResetRoom,
}) => {
  const [botsActive, setBotsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(room.roundTimeRemaining);

  useEffect(() => {
    setBotsActive(isBotSimulationRunning());
  }, []);

  // Timer countdown
  useEffect(() => {
    if (room.status !== "ACTIVE") return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          sounds.playBell();
          onUpdateStatus("PAUSED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room.status, onUpdateStatus]);

  const toggleBots = () => {
    if (botsActive) {
      stopBotSimulation();
      setBotsActive(false);
    } else {
      startBotSimulation(room.code);
      setBotsActive(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRound = () => {
    sounds.playBell();
    onUpdateStatus("ACTIVE");
  };

  const handlePauseRound = () => {
    onUpdateStatus("PAUSED");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Round & Timer display */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Session Status:
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                room.status === "ACTIVE"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse"
                  : room.status === "PAUSED"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {room.status}
            </span>
          </div>

          <div className="flex items-baseline space-x-3 mt-1">
            <h2 className="text-2xl font-black text-white">
              Round {room.currentRound} of {room.totalRounds}
            </h2>
            <div className="text-xl font-mono font-bold text-cyan-400">
              ⏱ {formatTimer(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {room.status !== "ACTIVE" ? (
            <button
              onClick={handleStartRound}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Play className="w-4 h-4" />
              <span>{room.status === "LOBBY" ? "Start Market" : "Resume Round"}</span>
            </button>
          ) : (
            <button
              onClick={handlePauseRound}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-lg transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Market</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playBell();
              onAdvanceRound();
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 transition-all"
          >
            <SkipForward className="w-4 h-4" />
            <span>Next Round</span>
          </button>

          <button
            onClick={() => sounds.playBell()}
            title="Ring NYSE Bell"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700"
          >
            <BellRing className="w-4 h-4" />
          </button>

          {/* Bot simulator toggle */}
          <button
            onClick={toggleBots}
            className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-lg font-bold text-xs border transition-all ${
              botsActive
                ? "bg-purple-600 text-white border-purple-500 animate-pulse"
                : "bg-slate-800 text-purple-300 border-purple-900/50 hover:bg-slate-700"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{botsActive ? "AI Traders: ACTIVE" : "AI Traders: OFF"}</span>
          </button>

          {/* Spawn 30 AI Classmates */}
          <button
            onClick={onSpawnBots}
            className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-semibold"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spawn 30 Classmates</span>
          </button>

          <button
            onClick={onResetRoom}
            title="Reset Game"
            className="p-2.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
