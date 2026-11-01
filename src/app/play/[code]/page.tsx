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
import {
  STARTING_CASH,
  DESK_METADATA,
  DESK_STARTING_PORTFOLIOS,
  formatINR,
} from "@/lib/constants";
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
  TrendingDown,
  Volume2,
  VolumeX,
  Trophy,
  Activity,
  Smartphone,
  Monitor,
  Briefcase,
  Layers,
  ArrowUp,
  ArrowDown,
  Megaphone,
  Sparkles,
  PieChart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function PlayRoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = ((params?.code as string) || "WALLST").toUpperCase();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"trade" | "portfolio" | "leaderboard" | "markets">("trade");
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId>("COFORGE");
  const [mobileLot, setMobileLot] = useState<number>(50);
  const [mobileOrderLoading, setMobileOrderLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"responsive" | "web" | "app">("responsive");

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
      rank: Object.keys(room.players || {}).length + 1,
      lastActive: Date.now(),
    };
  }, [room, playerId]);

  const handleExecuteTrade = async (order: TradeOrder) => {
    return await submitOrder(roomCode, order);
  };

  // Quick 1-tap trade for mobile interface
  const handleQuickMobileTrade = async (side: "BUY" | "SELL") => {
    if (!room || !currentPlayer || !selectedAsset) return;
    setMobileOrderLoading(true);

    const order: TradeOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      desk: currentPlayer.desk,
      assetId: selectedAssetId,
      side,
      quantity: mobileLot,
      price: selectedAsset.currentPrice,
      timestamp: Date.now(),
      total: Number((mobileLot * selectedAsset.currentPrice).toFixed(2)),
    };

    const res = await submitOrder(roomCode, order);
    setMobileOrderLoading(false);
    if (res.success) {
      sounds.playTradeSuccess();
    } else {
      sounds.playBell();
      alert(res.error || "Order rejected");
    }
  };

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen bg-[#070B12] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-300 font-mono">Connecting to JSE Trading Floor ({roomCode})...</p>
      </div>
    );
  }

  const selectedAsset = room.assets?.[selectedAssetId] || Object.values(room.assets || {})[0];
  const deskInfo = DESK_METADATA[currentPlayer.desk];
  const holding = (selectedAsset && currentPlayer.shares[selectedAsset.id]) || 0;
  const isMarketActive = room.status === "ACTIVE";
  const mobileOrderEstimate = Number((mobileLot * (selectedAsset?.currentPrice || 0)).toFixed(2));

  // RENDER APP COMPONENT (Native Smartphone Experience)
  const renderAppView = () => (
    <div className="w-full max-w-sm mx-auto rounded-[38px] p-3 sm:p-4 bg-gradient-to-b from-slate-800 via-slate-900 to-black border-4 border-slate-800 shadow-2xl relative">
      {/* Dynamic Notch / Status Dot */}
      <div className="w-28 h-4 bg-black rounded-full mx-auto mb-3 flex items-center justify-end px-3">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
      </div>

      {/* Screen Inner Container */}
      <div className="bg-[#090E17] rounded-[28px] p-4 text-white overflow-hidden border border-slate-800 space-y-4">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-black text-black text-xs shadow-md">
              JSE
            </div>
            <div>
              <div className="text-[10px] text-slate-400 leading-none">Desk • {deskInfo?.name}</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">{currentPlayer.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-800 text-[10px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isMarketActive ? "bg-emerald-400 animate-ping" : "bg-amber-400"
              }`}
            />
            <span className={isMarketActive ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {room.status}
            </span>
          </div>
        </div>

        {/* Breaking News Notification Pill */}
        {room.currentNews && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-amber-200">
            <Megaphone className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span className="truncate font-mono">{room.currentNews.title}</span>
          </div>
        )}

        {/* Portfolio Value Card (Inspired by View 3) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/60 shadow-lg relative overflow-hidden">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
            <span>Total Portfolio Value</span>
            <span className="text-amber-400 font-bold">Rank #{currentPlayer.rank}</span>
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-white">
            {formatINR(currentPlayer.totalNetWorth)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs font-bold font-mono flex items-center ${
                currentPlayer.returnPercent >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {currentPlayer.returnPercent >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {currentPlayer.returnPercent.toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({formatINR(currentPlayer.totalNetWorth - currentPlayer.initialNetWorth)})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-700/50 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">Realized PnL</span>
              <span
                className={`font-semibold ${
                  currentPlayer.realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatINR(currentPlayer.realizedPnL)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Liquid Cash</span>
              <span className="text-slate-200 font-semibold">{formatINR(currentPlayer.cash)}</span>
            </div>
          </div>
        </div>

        {/* Active Trade Box */}
        {activeTab === "trade" && selectedAsset && (
          <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            {/* Asset Switcher Dropdown */}
            <div className="flex items-center justify-between gap-2">
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value as AssetId)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-400 flex-1"
              >
                {(Object.keys(room.assets) as AssetId[]).map((aid) => (
                  <option key={aid} value={aid}>
                    {aid} — {formatINR(room.assets[aid].currentPrice)}
                  </option>
                ))}
              </select>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold shrink-0">
                {selectedAsset.category}
              </span>
            </div>

            {/* Price & Change */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-lg font-black font-mono text-white">
                  {formatINR(selectedAsset.currentPrice)}
                </div>
                <div
                  className={`text-[11px] font-mono font-semibold ${
                    selectedAsset.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {selectedAsset.changePercent >= 0 ? "+" : ""}
                  {selectedAsset.changePercent.toFixed(2)}% Today
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-400">
                Holding: <span className="font-bold text-white">{holding} shares</span>
              </div>
            </div>

            {/* Mini Sparkline Chart */}
            <div className="w-full">
              <PriceChart asset={selectedAsset} height={130} />
            </div>

            {/* Lot Size Chips */}
            <div>
              <div className="text-[10px] text-slate-400 mb-1.5 flex justify-between">
                <span>Select Order Lots</span>
                <span className="font-mono text-cyan-300">{mobileLot} Shares</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setMobileLot(qty)}
                    className={`py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      mobileLot === qty
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Total */}
            <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-800">
              <span className="text-slate-400">Est. Order Value</span>
              <span className="font-bold text-white">{formatINR(mobileOrderEstimate)}</span>
            </div>

            {/* Big Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickMobileTrade("BUY")}
                disabled={mobileOrderLoading || !isMarketActive || currentPlayer.cash < mobileOrderEstimate}
                className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-1 transition shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowUp className="w-4 h-4 stroke-[3]" /> BUY
              </button>
              <button
                type="button"
                onClick={() => handleQuickMobileTrade("SELL")}
                disabled={mobileOrderLoading || !isMarketActive || holding < mobileLot}
                className="py-3 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1 transition shadow-lg shadow-rose-500/20 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowDown className="w-4 h-4 stroke-[3]" /> SELL
              </button>
            </div>
          </div>
        )}

        {/* Tab View: Portfolio */}
        {activeTab === "portfolio" && (
          <div className="space-y-3">
            <PortfolioCard player={currentPlayer} room={room} />
          </div>
        )}

        {/* Tab View: Rankings */}
        {activeTab === "leaderboard" && (
          <div className="space-y-3">
            <LiveLeaderboard
              players={room.players}
              currentPlayerId={currentPlayer.id}
              maxDisplay={20}
            />
          </div>
        )}

        {/* Tab View: Markets Watchlist */}
        {activeTab === "markets" && (
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {(Object.keys(room.assets) as AssetId[]).map((aid) => {
              const a = room.assets[aid];
              const isPos = a.changePercent >= 0;
              return (
                <div
                  key={aid}
                  onClick={() => {
                    setSelectedAssetId(aid);
                    setActiveTab("trade");
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-400 transition-all"
                >
                  <div>
                    <span className="font-black text-xs text-white">{aid}</span>
                    <span className="text-[10px] text-slate-400 block">{a.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-white">{formatINR(a.currentPrice)}</div>
                    <div className={`text-[10px] font-semibold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPos ? "+" : ""}{a.changePercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Tab Bar (App Navigation) */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around text-slate-400 text-[10px]">
          <button
            onClick={() => setActiveTab("trade")}
            className={`flex flex-col items-center transition-colors ${
              activeTab === "trade" ? "text-cyan-400 font-bold" : "hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4 mb-0.5" /> Trade
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex flex-col items-center transition-colors ${
              activeTab === "portfolio" ? "text-cyan-400 font-bold" : "hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4 mb-0.5" /> Portfolio
          </button>
          <button
            onClick={() => setActiveTab("markets")}
            className={`flex flex-col items-center transition-colors ${
              activeTab === "markets" ? "text-cyan-400 font-bold" : "hover:text-slate-200"
            }`}
          >
            <PieChart className="w-4 h-4 mb-0.5" /> Markets
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex flex-col items-center transition-colors ${
              activeTab === "leaderboard" ? "text-cyan-400 font-bold" : "hover:text-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4 mb-0.5" /> Rankings
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER WEB PRO TERMINAL COMPONENT (Full Desktop Trading Floor)
  const renderWebTerminal = () => (
    <div className="space-y-5">
      {/* Top Market Ticker Header Strip (Inspired by View 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2 font-mono text-xs">
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
              } ${isSelected ? "ring-2 ring-cyan-400 bg-slate-800/80" : "hover:bg-slate-800/50"}`}
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

      {/* Main Trading Floor Split: Watchlist + Main Chart + Order Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Watchlist & Execution Feed (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Watchlist */}
          <div className="glass-card rounded-2xl p-4 flex flex-col h-[280px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Watchlist (10 Equities)
              </span>
              <span className="text-[10px] font-mono text-slate-400">₹ INR</span>
            </div>

            <div className="mt-2.5 flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono">
              {(Object.keys(room.assets) as AssetId[]).map((aid) => {
                const a = room.assets[aid];
                const isPos = a.changePercent >= 0;
                const isSelected = selectedAssetId === aid;

                return (
                  <div
                    key={aid}
                    onClick={() => setSelectedAssetId(aid)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-800 border-cyan-400 shadow-md"
                        : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white">{aid}</span>
                      <span className="text-[10px] text-slate-500 block">{a.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-200">{formatINR(a.currentPrice)}</span>
                      <span className={`block text-[10px] font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPos ? "+" : ""}{a.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Feed */}
          <div className="glass-card rounded-2xl p-4 flex flex-col h-[280px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Execution Feed
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Live Sync</span>
            </div>

            <div className="mt-2.5 flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono">
              {(room.recentTrades?.length || 0) === 0 ? (
                <div className="text-slate-500 text-xs italic py-4 text-center">Waiting for market orders...</div>
              ) : (
                (room.recentTrades || []).slice(0, 10).map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{t.assetId}</span>
                      <span className="text-[10px] text-slate-500 block">{t.playerName}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.side === "BUY"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {t.side} {t.quantity}
                    </span>
                    <span className="text-slate-300 font-medium">{formatINR(t.price)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Chart & Sentiment (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Breaking News Banner with Audio */}
          <BreakingNewsBanner news={room.currentNews} />

          {/* Price Chart Container */}
          {selectedAsset && (
            <div className="glass-card rounded-2xl p-5 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white tracking-tight">{selectedAsset.name}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                      {selectedAsset.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold">
                      {selectedAsset.changePercent >= 0 ? "+" : ""}
                      {selectedAsset.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    NSE: {selectedAsset.id} • Sector: {selectedAsset.category}
                  </div>
                </div>

                <div className="flex items-center bg-slate-800/80 p-1 rounded-lg text-xs font-mono">
                  <button className="px-2.5 py-1 rounded bg-slate-700 text-white font-bold">1D</button>
                  <button className="px-2.5 py-1 rounded text-slate-400 hover:text-white">1W</button>
                  <button className="px-2.5 py-1 rounded text-slate-400 hover:text-white">1M</button>
                  <button className="px-2.5 py-1 rounded text-slate-400 hover:text-white">YTD</button>
                </div>
              </div>

              {/* Price Display */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-black font-mono text-white tracking-tight">
                  {formatINR(selectedAsset.currentPrice)}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Day High: {formatINR(selectedAsset.dayHigh)} • Low: {formatINR(selectedAsset.dayLow)}
                </span>
              </div>

              {/* Chart SVG */}
              <div className="mt-3">
                <PriceChart asset={selectedAsset} height={250} />
              </div>
            </div>
          )}

          {/* Sentiment Gauge */}
          <SentimentMeter recentTrades={room.recentTrades} />
        </div>

        {/* Right Column: Order Pad & Leaderboard (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Order Slip / TradePad */}
          <TradePad
            player={currentPlayer}
            room={room}
            onTrade={handleExecuteTrade}
            selectedAssetId={selectedAssetId}
            onSelectAsset={setSelectedAssetId}
          />

          {/* Portfolio & Rank Card */}
          <PortfolioCard player={currentPlayer} room={room} />

          {/* Live Rankings */}
          <LiveLeaderboard
            players={room.players}
            currentPlayerId={currentPlayer.id}
            maxDisplay={10}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 pb-16 font-sans">
      {/* Top Global Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-[#0A0E17]/90 sticky top-0 z-50 backdrop-blur-md px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-black text-black text-sm tracking-tight shadow-md">
              JSE
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase leading-none">
                Jain University
              </div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
                <span>{currentPlayer.name}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                  #{currentPlayer.rank}
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400">
                  ({deskInfo?.name})
                </span>
              </div>
            </div>
          </div>

          {/* View Mode Switcher: Web Pro Terminal vs Mobile App */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setViewMode("web")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "web" || (viewMode === "responsive" && typeof window !== "undefined" && window.innerWidth >= 1024)
                  ? "text-white bg-slate-800 shadow font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Web Pro Terminal</span>
              <span className="sm:hidden">Web</span>
            </button>

            <button
              onClick={() => setViewMode("app")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "app" || (viewMode === "responsive" && typeof window !== "undefined" && window.innerWidth < 1024)
                  ? "text-white bg-slate-800 shadow font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Mobile App View</span>
              <span className="sm:hidden">App</span>
            </button>
          </div>

          {/* Audio, Clock & PIN */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex flex-col text-right font-mono text-xs">
              <span className="text-slate-400 text-[10px]">ROOM PIN</span>
              <span className="font-bold text-cyan-400">{roomCode}</span>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total Net Worth
              </div>
              <div className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                {formatINR(currentPlayer.totalNetWorth)}
              </div>
            </div>

            <button
              onClick={toggleSound}
              title="Toggle Audio & AI Voice"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {viewMode === "app" ? (
          renderAppView()
        ) : viewMode === "web" ? (
          renderWebTerminal()
        ) : (
          <>
            {/* Responsive Mode: Mobile on small screens, Web on large screens */}
            <div className="lg:hidden">{renderAppView()}</div>
            <div className="hidden lg:block">{renderWebTerminal()}</div>
          </>
        )}
      </main>
    </div>
  );
}

export default function PlayRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070B12] flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-300 font-mono">Loading Trading Floor...</p>
        </div>
      }
    >
      <PlayRoomContent />
    </Suspense>
  );
}
