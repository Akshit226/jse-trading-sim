"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { AssetId, RoomState } from "@/types/trading";
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
  Volume2,
  VolumeX,
  Layers,
  Clock,
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
    return Object.values(room.players || {})
      .sort((a, b) => b.totalNetWorth - a.totalNetWorth)
      .slice(0, 3);
  }, [room?.players]);

  if (!room) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
        <h2 className="text-sm font-bold font-mono text-neutralMuted">
          Connecting Projector to Trading Floor ({roomCode})...
        </h2>
      </div>
    );
  }

  const selectedAsset = room.assets?.[selectedAssetId] || Object.values(room.assets || {})[0];
  const isMarketOpen = room.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-app text-slate-100 p-4 sm:p-6 flex flex-col justify-between font-sans">
      {/* Top Banner: Market Status, QR Code, Simulation Info */}
      <header className="card-surface p-4 flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-white rounded-ui shrink-0">
            <img src="/jain-logo.png" alt="Jain University Logo" className="h-7 w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                JSE Trading Floor Projector
              </h1>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-surface-subtle text-accent border border-borderSubtle">
                ROOM: {room.code}
              </span>
            </div>
            <p className="text-xs text-neutralMuted font-mono mt-0.5 flex items-center gap-1.5">
              <span>Round {room.currentRound} of {room.totalRounds}</span>
              <span>•</span>
              <span
                className={`font-bold uppercase ${
                  isMarketOpen ? "text-gain" : "text-neutralMuted"
                }`}
              >
                {room.status}
              </span>
            </p>
          </div>
        </div>

        {/* QR Code and Join URL */}
        <div className="flex items-center space-x-3 bg-surface-subtle border border-borderSubtle px-3.5 py-2 rounded-ui">
          <div className="bg-white p-1 rounded shrink-0">
            <QRCodeSVG value={joinUrl} size={44} />
          </div>
          <div className="text-left font-mono">
            <div className="text-[10px] font-bold uppercase text-neutralMuted">Scan to Join</div>
            <div className="text-xs font-bold text-white tracking-wider">{room.code}</div>
            <div className="text-[10px] text-neutralMuted truncate max-w-[120px]">{originUrl}</div>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            title="Toggle Audio"
            className="p-1.5 rounded-ui bg-surface border border-borderSubtle text-neutralMuted hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-accent" /> : <VolumeX className="w-3.5 h-3.5 text-neutralMuted" />}
          </button>
        </div>
      </header>

      {/* Market Ticker Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-2 font-mono text-xs mb-4">
        {(Object.keys(room.assets) as AssetId[]).map((aid) => {
          const a = room.assets[aid];
          const isPos = a.changePercent >= 0;
          const isSelected = selectedAssetId === aid;

          return (
            <button
              key={aid}
              type="button"
              onClick={() => setSelectedAssetId(aid)}
              className={`p-2.5 rounded-ui text-left border transition-colors ${
                isSelected
                  ? "bg-accent-subtle border-accent"
                  : "bg-surface border-borderSubtle hover:border-borderStrong"
              }`}
            >
              <div className="text-neutralMuted text-[10px] font-bold">{aid}</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate tabular-nums">
                {formatINR(a.currentPrice)}
              </div>
              <div
                className={`text-[10px] font-bold tabular-nums ${
                  isPos ? "text-gain" : "text-loss"
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 card-surface text-center my-4 motion-modal-enter">
          <Trophy className="w-10 h-10 text-amber-400 mb-2" />
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
            Market Closed: Final Podium
          </h2>
          <p className="text-xs text-neutralMuted mb-6 font-mono">
            Session completed across {room.totalRounds} rounds
          </p>

          <div className="flex items-end justify-center space-x-6 w-full max-w-xl mb-6">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="flex flex-col items-center w-1/3">
                <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 flex items-center justify-center font-bold text-xs mb-1.5">
                  #2
                </div>
                <span className="font-bold text-xs text-white truncate max-w-full">{top3[1].name}</span>
                <span className="font-mono text-xs text-gain tabular-nums mt-0.5">
                  {formatINR(top3[1].totalNetWorth)}
                </span>
                <div className="w-full bg-surface-subtle border border-borderSubtle rounded-t-ui h-28 flex items-center justify-center font-bold text-lg text-neutralMuted mt-2">
                  2nd
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="flex flex-col items-center w-1/3">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm mb-1.5 shadow-ui">
                  #1
                </div>
                <span className="font-bold text-sm text-white truncate max-w-full">{top3[0].name}</span>
                <span className="font-mono text-sm font-bold text-gain tabular-nums mt-0.5">
                  {formatINR(top3[0].totalNetWorth)}
                </span>
                <div className="w-full bg-accent-subtle border border-accent rounded-t-ui h-40 flex items-center justify-center font-bold text-2xl text-accent mt-2">
                  1st
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="flex flex-col items-center w-1/3">
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs mb-1.5">
                  #3
                </div>
                <span className="font-bold text-xs text-white truncate max-w-full">{top3[2].name}</span>
                <span className="font-mono text-xs text-gain tabular-nums mt-0.5">
                  {formatINR(top3[2].totalNetWorth)}
                </span>
                <div className="w-full bg-surface-subtle border border-borderSubtle rounded-t-ui h-20 flex items-center justify-center font-bold text-sm text-neutralMuted mt-2">
                  3rd
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Regular Projector View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* Main Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <BreakingNewsBanner news={room.currentNews} />

            {selectedAsset && (
              <div className="card-surface p-5 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">{selectedAsset.name}</h2>
                      <span className="text-xs px-2 py-0.5 rounded bg-surface-subtle border border-borderSubtle font-mono text-neutralMuted">
                        {selectedAsset.id}
                      </span>
                    </div>
                    <div className="text-xs text-neutralMuted font-mono mt-0.5">
                      NSE Real-Time • Category: {selectedAsset.category}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-white tabular-nums">
                      {formatINR(selectedAsset.currentPrice)}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold tabular-nums ${
                        selectedAsset.changePercent >= 0 ? "text-gain" : "text-loss"
                      }`}
                    >
                      {selectedAsset.changePercent >= 0 ? "+" : ""}
                      {selectedAsset.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <PriceChart asset={selectedAsset} height={320} hideHeader={true} hideWrapper={true} />
              </div>
            )}
          </div>

          {/* Right: Live Standings (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <LiveLeaderboard players={room.players} maxDisplay={12} />
            <SentimentMeter recentTrades={room.recentTrades} />
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="w-full text-center text-[11px] text-neutralMuted font-mono py-3 border-t border-borderSubtle mt-4">
        Jain (Deemed-to-be University) • CMS Bengaluru • Trading Floor Display
      </footer>
    </div>
  );
}
