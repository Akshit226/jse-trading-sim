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
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStartRound = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    sounds.playBell();
    try {
      await onUpdateStatus("ACTIVE");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStopRound = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    sounds.playBell();
    try {
      await onUpdateStatus("PAUSED");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdvance = async () => {
    if (isUpdating || room.currentRound >= room.totalRounds) return;
    setIsUpdating(true);
    sounds.playBell();
    try {
      await onAdvanceRound();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onResetRoom();
    } finally {
      setIsUpdating(false);
    }
  };

  const isMarketOpen = room.status === "ACTIVE";
  const isMarketEnded = room.status === "ENDED";
  const isMarketPaused = room.status === "PAUSED";

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
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${
                isMarketOpen
                  ? "bg-gain-subtle text-gain border border-gain-border"
                  : isMarketPaused
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : isMarketEnded
                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                  : "bg-surface-subtle text-neutralMuted border border-borderSubtle"
              }`}
            >
              {isMarketOpen && (
                <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
              )}
              {isMarketPaused && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
              <span>{room.status}</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isMarketOpen ? (
            <button
              type="button"
              onClick={handleStopRound}
              disabled={isUpdating}
              className="min-h-touch px-4 py-2 bg-loss hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press flex items-center gap-1.5 shadow-ui transition-all"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>{isUpdating ? "Pausing..." : "Pause Round"}</span>
            </button>
          ) : isMarketEnded ? (
            <button
              type="button"
              disabled
              className="min-h-touch px-4 py-2 bg-surface-subtle border border-borderSubtle text-neutralMuted font-bold text-xs uppercase tracking-wider rounded-ui flex items-center gap-1.5 cursor-not-allowed opacity-60"
            >
              <span>Session Finished</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRound}
              disabled={isUpdating}
              className="min-h-touch px-4 py-2 bg-gain hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press flex items-center gap-1.5 shadow-ui transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>
                {isUpdating
                  ? isMarketPaused ? "Resuming..." : "Starting..."
                  : isMarketPaused
                  ? `Resume Round ${room.currentRound}`
                  : `Start Round ${room.currentRound}`}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAdvance}
            disabled={isUpdating || room.currentRound >= room.totalRounds}
            className="min-h-touch px-3 py-2 bg-surface-subtle hover:bg-surface border border-borderSubtle text-neutralMuted hover:text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-all"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>{isUpdating ? "Advancing..." : "Next Round"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isUpdating}
            className="min-h-touch px-3 py-2 bg-surface-subtle hover:bg-surface border border-borderSubtle text-neutralMuted hover:text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Floor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
