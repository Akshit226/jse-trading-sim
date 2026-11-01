"use client";

import React, { useEffect, useState } from "react";
import { RoomState } from "@/types/trading";
import { sounds } from "@/lib/audio";
import {
  Play,
  Square,
  SkipForward,
  RotateCcw,
  Users,
  BellRing,
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

  useEffect(() => {
    setBotsActive(isBotSimulationRunning());
  }, []);

  const toggleBots = () => {
    if (botsActive) {
      stopBotSimulation();
      setBotsActive(false);
    } else {
      startBotSimulation(room.code);
      setBotsActive(true);
    }
  };

  const handleStartRound = () => {
    sounds.playBell();
    onUpdateStatus("ACTIVE");
  };

  const handleStopRound = () => {
    sounds.playBell();
    onUpdateStatus("PAUSED");
  };

  const isMarketOpen = room.status === "ACTIVE";

  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Round & Status Display with Visual Dots */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Simulation Control:
            </span>
            <span
              className={`text-xs px-3 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center space-x-1.5 ${
                isMarketOpen
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse"
                  : room.status === "PAUSED"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isMarketOpen
                    ? "bg-emerald-400"
                    : room.status === "PAUSED"
                    ? "bg-amber-400"
                    : "bg-slate-500"
                }`}
              />
              <span>
                {isMarketOpen
                  ? "Market Open • Trading Live"
                  : room.status === "PAUSED"
                  ? "Market Stopped • Round Paused"
                  : "Pre-Open Lobby"}
              </span>
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Round {room.currentRound} of {room.totalRounds}
              {/* Visual Round Dots from JSE Suite */}
              <span className="flex gap-1.5 ml-2">
                {Array.from({ length: room.totalRounds }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      idx + 1 < room.currentRound
                        ? "bg-emerald-400"
                        : idx + 1 === room.currentRound
                        ? isMarketOpen
                          ? "bg-emerald-400 animate-pulse ring-2 ring-emerald-400/50"
                          : "bg-amber-400"
                        : "bg-slate-700"
                    }`}
                  />
                ))}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Manual Facilitator Control • Click <span className="text-emerald-400 font-bold">Start Round</span> to open order matching, <span className="text-rose-400 font-bold">Stop Round</span> to conclude trading.
          </p>
        </div>

        {/* Primary Controls: START & STOP Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* START BUTTON */}
          <button
            type="button"
            onClick={handleStartRound}
            disabled={isMarketOpen}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all ${
              isMarketOpen
                ? "bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:scale-[1.02] cursor-pointer"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{room.status === "LOBBY" ? "Start Market" : "Start Round"}</span>
          </button>

          {/* STOP BUTTON */}
          <button
            type="button"
            onClick={handleStopRound}
            disabled={!isMarketOpen}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all ${
              !isMarketOpen
                ? "bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50"
                : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 hover:scale-[1.02] cursor-pointer animate-pulse"
            }`}
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop Round</span>
          </button>

          {/* NEXT ROUND BUTTON */}
          <button
            type="button"
            onClick={() => {
              sounds.playBell();
              onAdvanceRound();
            }}
            disabled={room.currentRound >= room.totalRounds}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4 h-4" />
            <span>Next Round</span>
          </button>

          {/* Bell Icon */}
          <button
            type="button"
            onClick={() => sounds.playBell()}
            title="Ring Market Bell"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition-all"
          >
            <BellRing className="w-4 h-4" />
          </button>

          {/* Bot simulator toggle */}
          <button
            type="button"
            onClick={toggleBots}
            className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-xl font-bold text-xs border transition-all ${
              botsActive
                ? "bg-purple-600 text-white border-purple-500 animate-pulse shadow-md shadow-purple-950/50"
                : "bg-slate-800 text-purple-300 border-purple-900/50 hover:bg-slate-700"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{botsActive ? "AI Traders: ON" : "AI Traders: OFF"}</span>
          </button>

          {/* Spawn 30 AI Classmates */}
          <button
            type="button"
            onClick={onSpawnBots}
            className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-semibold transition-all"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>+30 Classmates</span>
          </button>

          {/* Reset Room */}
          <button
            type="button"
            onClick={onResetRoom}
            title="Reset Game"
            className="p-2.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
