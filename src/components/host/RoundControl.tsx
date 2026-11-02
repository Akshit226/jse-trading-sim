"use client";

import React from "react";
import { RoomState } from "@/types/trading";
import { sounds } from "@/lib/audio";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Layers,
} from "lucide-react";

interface RoundControlProps {
  room: RoomState;
  onUpdateStatus: (status: RoomState["status"]) => Promise<void>;
  onAdvanceRound: () => Promise<void>;
  onResetRoom: () => Promise<void>;
}

export const RoundControl: React.FC<RoundControlProps> = ({
  room,
  onUpdateStatus,
  onAdvanceRound,
  onResetRoom,
}) => {
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
    <div className="card-surface p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-borderSubtle">
        {/* Status */}
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutralMuted">
            Simulation Control
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2 mt-1">
            <span>Round {room.currentRound} of {room.totalRounds}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isMarketOpen
                  ? "bg-gain-subtle text-gain border border-gain-border"
                  : room.status === "PAUSED"
                  ? "bg-surface-subtle text-warningMuted border border-borderSubtle"
                  : "bg-surface-subtle text-neutralMuted border border-borderSubtle"
              }`}
            >
              {room.status}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isMarketOpen ? (
            <button
              type="button"
              onClick={handleStopRound}
              className="min-h-touch px-4 py-2 bg-loss hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press flex items-center gap-1.5 shadow-ui"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Round</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRound}
              className="min-h-touch px-4 py-2 bg-gain hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press flex items-center gap-1.5 shadow-ui"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Round {room.currentRound}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAdvanceRound}
            disabled={room.currentRound >= room.totalRounds}
            className="min-h-touch px-3 py-2 bg-surface-subtle hover:bg-surface border border-borderSubtle text-neutralMuted hover:text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Next Round</span>
          </button>

          <button
            type="button"
            onClick={onResetRoom}
            className="min-h-touch px-3 py-2 bg-surface-subtle hover:bg-surface border border-borderSubtle text-neutralMuted hover:text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Floor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
