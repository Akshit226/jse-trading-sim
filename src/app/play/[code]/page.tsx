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
  getCompanyFullName,
  getCompanyIndustry,
  getCompanySubSector,
} from "@/lib/constants";
import {
  joinPlayer,
  submitOrder,
  subscribeToRoom,
  subscribeToRoomMeta,
  subscribeToAssets,
  subscribeToPlayerPortfolio,
  subscribeToNews,
  calculateOptimisticTrade,
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
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function PlayRoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = ((params?.code as string) || "WALLST").toUpperCase();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fallbackPlayer, setFallbackPlayer] = useState<PlayerPortfolio | null>(null);

  // Mobile Bottom Tab: Market | Trade | Portfolio | Leaderboard | News
  const [mobileTab, setMobileTab] = useState<"market" | "trade" | "portfolio" | "leaderboard" | "news">("trade");
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId>("COFORGE");
  const [viewMode, setViewMode] = useState<"responsive" | "web" | "app">("responsive");

  // Mobile Bottom Sheet toggle
  const [showMobileTradeSheet, setShowMobileTradeSheet] = useState(false);

  // Collapsible panels in desktop right col
  const [showFeed, setShowFeed] = useState(true);

  // Dynamic Clock
  const [clockTime, setClockTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setClockTime(
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize or fetch student identity
  useEffect(() => {
    let pid = localStorage.getItem("trading_sim_player_id");
    if (!pid) {
      pid = `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      localStorage.setItem("trading_sim_player_id", pid);
    }
    setPlayerId(pid);

    const name = searchParams.get("name") || localStorage.getItem("trading_sim_player_name") || "Student Trader";
    const email = searchParams.get("email") || localStorage.getItem("trading_sim_player_email") || undefined;
    const photoURL = searchParams.get("photo") || localStorage.getItem("trading_sim_player_photo") || undefined;
    const desk =
      (searchParams.get("desk") as StudentDesk) ||
      (localStorage.getItem("trading_sim_player_desk") as StudentDesk) ||
      "tech_analyst";

    localStorage.setItem("trading_sim_player_name", name);
    if (email) localStorage.setItem("trading_sim_player_email", email);
    if (photoURL) localStorage.setItem("trading_sim_player_photo", photoURL);
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
      email,
      photoURL,
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

    setFallbackPlayer(initialPortfolio);

    joinPlayer(roomCode, initialPortfolio).then((updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.players?.[pid]) {
        setFallbackPlayer(updatedRoom.players[pid]);
      }
    });
  }, [roomCode, searchParams]);

  // Real-time room subscription with granular micro-listeners
  useEffect(() => {
    const unsubRoom = subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
      if (playerId && updatedRoom.players?.[playerId]) {
        setFallbackPlayer(updatedRoom.players[playerId]);
      }
    });

    const unsubPlayer = subscribeToPlayerPortfolio(roomCode, playerId, (p) => {
      setFallbackPlayer(p);
    });

    const unsubAssets = subscribeToAssets(roomCode, (assets) => {
      setRoom((prev) => (prev ? { ...prev, assets } : prev));
    });

    const unsubNews = subscribeToNews(roomCode, (currentNews) => {
      setRoom((prev) => (prev ? { ...prev, currentNews } : prev));
    });

    const unsubMeta = subscribeToRoomMeta(roomCode, (meta) => {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              status: meta.status,
              currentRound: meta.currentRound,
              roundTimeRemaining: meta.roundTimeRemaining,
            }
          : prev
      );
    });

    return () => {
      unsubRoom();
      unsubPlayer();
      unsubAssets();
      unsubNews();
      unsubMeta();
    };
  }, [roomCode, playerId]);

  // Toggle sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    newsSpeaker.setEnabled(next);
  };

  // Get current player portfolio
  const currentPlayer = useMemo(() => {
    if (room?.players?.[playerId]) {
      return room.players[playerId];
    }
    return fallbackPlayer;
  }, [room, playerId, fallbackPlayer]);

  // Handle Trade Execution with 0ms Optimistic UI Feedback
  const handleExecuteTrade = async (order: TradeOrder) => {
    if (currentPlayer && selectedAsset) {
      const optimistic = calculateOptimisticTrade(
        currentPlayer,
        selectedAsset,
        order.side,
        order.quantity
      );
      setFallbackPlayer(optimistic);
    }

    const res = await submitOrder(roomCode, order);
    if (res.success && res.room) {
      setRoom(res.room);
      if (playerId && res.room.players?.[playerId]) {
        setFallbackPlayer(res.room.players[playerId]);
      }
      return { success: true };
    } else {
      sounds.playBell();
      return { success: false, error: res.error || "Order rejected" };
    }
  };

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-neutralMuted font-mono">
          Connecting to JSE Trading Floor ({roomCode})...
        </p>
      </div>
    );
  }

  const selectedAsset = room.assets?.[selectedAssetId] || Object.values(room.assets || {})[0];
  const isMarketActive = room.status === "ACTIVE";
  const isReturnPositive = currentPlayer.returnPercent >= 0;

  // =========================================================================
  // SCREEN E: MOBILE TERMINAL (Thumb-first Native App + Bottom Sheet)
  // =========================================================================
  const renderMobileTerminal = () => (
    <div className="flex flex-col min-h-[calc(100vh-60px)] space-y-4">
      {/* Non-blocking News Catalyst */}
      <BreakingNewsBanner news={room.currentNews} />

      {/* TAB 1: MARKETS LIST */}
      {mobileTab === "market" && (
        <div className="space-y-2 motion-view-enter">
          <div className="flex items-center justify-between text-xs font-bold text-neutralMuted uppercase px-1 font-mono">
            <span>Market Equities (10)</span>
            <span>Real-Time NSE</span>
          </div>

          <div className="space-y-1.5">
            {(Object.keys(room.assets) as AssetId[]).map((aid) => {
              const a = room.assets[aid];
              const isPos = a.changePercent >= 0;
              const isSel = selectedAssetId === aid;

              return (
                <div
                  key={aid}
                  onClick={() => {
                    setSelectedAssetId(aid);
                    setShowMobileTradeSheet(true);
                  }}
                  className={`p-3 rounded-ui border transition-colors flex items-center justify-between cursor-pointer ${
                    isSel
                      ? "bg-accent-subtle border-accent"
                      : "bg-surface border-borderSubtle hover:border-borderStrong"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-white tracking-tight">{a.name}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-subtle border border-borderSubtle text-neutralMuted shrink-0">
                        {aid}
                      </span>
                    </div>
                    <div className="text-xs text-neutralMuted flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-subtle text-accent border border-accent/20 shrink-0">
                        {getCompanyIndustry(aid)}
                      </span>
                      <span className="text-[11px] text-neutralMuted truncate font-mono">
                        {getCompanySubSector(aid)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold font-mono text-white tabular-nums">
                      {formatINR(a.currentPrice)}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold tabular-nums ${
                        isPos ? "text-gain" : "text-loss"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {a.changePercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TRADE (Chart + TradePad) */}
      {mobileTab === "trade" && selectedAsset && (
        <div className="space-y-4 motion-view-enter">
          {/* Asset Select Dropdown */}
          <div className="flex items-center justify-between gap-2">
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value as AssetId)}
              className="min-h-touch bg-surface border border-borderSubtle focus:border-borderFocus rounded-ui px-3 py-2 text-xs sm:text-sm text-white font-mono font-bold focus:outline-none flex-1 truncate"
            >
              {(Object.keys(room.assets) as AssetId[]).map((aid) => (
                <option key={aid} value={aid}>
                  {room.assets[aid].name} ({aid}) • {getCompanyIndustry(aid)} — {formatINR(room.assets[aid].currentPrice)}
                </option>
              ))}
            </select>

            <span className="px-2.5 py-1.5 rounded-ui bg-accent-subtle border border-accent/20 text-xs font-mono text-accent shrink-0">
              {getCompanyIndustry(selectedAssetId)}
            </span>
          </div>

          {/* Chart */}
          <div className="card-surface p-4">
            <PriceChart asset={selectedAsset} height={180} hideHeader={false} hideWrapper={true} />
          </div>

          {/* Trade Pad */}
          <TradePad
            player={currentPlayer}
            room={room}
            onTrade={handleExecuteTrade}
            selectedAssetId={selectedAssetId}
            onSelectAsset={setSelectedAssetId}
          />
        </div>
      )}

      {/* TAB 3: PORTFOLIO */}
      {mobileTab === "portfolio" && (
        <div className="space-y-4 motion-view-enter">
          <PortfolioCard player={currentPlayer} room={room} />
        </div>
      )}

      {/* TAB 4: LEADERBOARD */}
      {mobileTab === "leaderboard" && (
        <div className="space-y-4 motion-view-enter">
          <LiveLeaderboard players={room.players} currentPlayerId={currentPlayer.id} maxDisplay={20} />
        </div>
      )}

      {/* TAB 5: NEWS FEED */}
      {mobileTab === "news" && (
        <div className="card-surface p-4 space-y-3 motion-view-enter">
          <div className="flex items-center justify-between pb-2 border-b border-borderSubtle">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              News Wire & Shocks
            </span>
            <span className="text-xs font-mono text-neutralMuted">
              {room.newsHistory?.length || 0} Events
            </span>
          </div>

          {(room.newsHistory?.length || 0) === 0 ? (
            <div className="text-xs text-neutralMuted italic py-6 text-center font-mono">
              Waiting for instructor news catalysts...
            </div>
          ) : (
            <div className="space-y-2">
              {(room.newsHistory || []).map((n) => (
                <div key={n.id} className="p-3 bg-surface-subtle rounded-ui border border-borderSubtle space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{n.title}</span>
                    <span className="text-[10px] text-neutralMuted font-mono">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-neutralMuted leading-relaxed">{n.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Sheet for Quick Order */}
      {showMobileTradeSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface border-t border-borderSubtle rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto motion-sheet-enter space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-borderSubtle">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0 pr-2">
                <span className="text-xs font-bold text-white tracking-tight">
                  {selectedAsset.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-subtle border border-borderSubtle text-neutralMuted">
                  {selectedAssetId}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-subtle text-accent border border-accent/20">
                  {getCompanyIndustry(selectedAssetId)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileTradeSheet(false)}
                className="p-1 rounded text-neutralMuted hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TradePad
              player={currentPlayer}
              room={room}
              onTrade={async (order) => {
                const res = await handleExecuteTrade(order);
                if (res.success) setShowMobileTradeSheet(false);
                return res;
              }}
              selectedAssetId={selectedAssetId}
              onSelectAsset={setSelectedAssetId}
            />
          </div>
        </div>
      )}

      {/* Sticky Bottom Tab Bar (44px min touch height) */}
      <nav className="sticky bottom-0 z-40 bg-surface/95 backdrop-blur-md border-t border-borderSubtle p-1.5 flex items-center justify-around text-xs font-medium">
        <button
          type="button"
          onClick={() => setMobileTab("market")}
          className={`min-h-touch flex-1 flex flex-col items-center justify-center gap-1 rounded-md transition-colors ${
            mobileTab === "market" ? "text-accent font-bold" : "text-neutralMuted hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px]">Market</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("trade")}
          className={`min-h-touch flex-1 flex flex-col items-center justify-center gap-1 rounded-md transition-colors ${
            mobileTab === "trade" ? "text-accent font-bold" : "text-neutralMuted hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px]">Trade</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("portfolio")}
          className={`min-h-touch flex-1 flex flex-col items-center justify-center gap-1 rounded-md transition-colors ${
            mobileTab === "portfolio" ? "text-accent font-bold" : "text-neutralMuted hover:text-white"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span className="text-[10px]">Portfolio</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("leaderboard")}
          className={`min-h-touch flex-1 flex flex-col items-center justify-center gap-1 rounded-md transition-colors ${
            mobileTab === "leaderboard" ? "text-accent font-bold" : "text-neutralMuted hover:text-white"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span className="text-[10px]">Ranks</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("news")}
          className={`min-h-touch flex-1 flex flex-col items-center justify-center gap-1 rounded-md transition-colors ${
            mobileTab === "news" ? "text-accent font-bold" : "text-neutralMuted hover:text-white"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span className="text-[10px]">News</span>
        </button>
      </nav>
    </div>
  );

  // =========================================================================
  // SCREEN D: WEB PRO TERMINAL (Strict 3-Column Data-First Layout)
  // =========================================================================
  const renderWebTerminal = () => (
    <div className="grid grid-cols-12 gap-5 items-start">
      
      {/* ------------------------------------------------------------------- */}
      {/* COLUMN 1 (Left: 3 cols) - Watchlist & Live Equities                 */}
      {/* ------------------------------------------------------------------- */}
      <div className="col-span-3 space-y-4">
        <div className="card-surface p-4 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-borderSubtle">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-accent" /> Watchlist
            </span>
            <span className="text-[11px] font-mono text-neutralMuted">10 Equities</span>
          </div>

          <div className="mt-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 text-xs font-mono">
            {(Object.keys(room.assets) as AssetId[]).map((aid) => {
              const a = room.assets[aid];
              const isPos = a.changePercent >= 0;
              const isSelected = selectedAssetId === aid;

              return (
                <div
                  key={aid}
                  onClick={() => setSelectedAssetId(aid)}
                  className={`p-2.5 rounded-ui border transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-accent-subtle border-accent"
                      : "bg-surface-subtle border-borderSubtle hover:border-borderStrong"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs truncate max-w-[130px] font-sans">
                        {a.name}
                      </span>
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface border border-borderSubtle text-neutralMuted shrink-0">
                        {aid}
                      </span>
                    </div>
                    <div className="text-[10px] text-accent truncate mt-0.5 font-mono">
                      {getCompanyIndustry(aid)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-white tabular-nums">
                      {formatINR(a.currentPrice)}
                    </div>
                    <div
                      className={`text-[11px] font-bold tabular-nums ${
                        isPos ? "text-gain" : "text-loss"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {a.changePercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* COLUMN 2 (Center: 6 cols) - Chart & Consolidated Order Ticket       */}
      {/* ------------------------------------------------------------------- */}
      <div className="col-span-6 space-y-4">
        {/* Non-blocking News Catalyst */}
        <BreakingNewsBanner news={room.currentNews} />

        {/* SVG Price Chart Card */}
        {selectedAsset && (
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-white tracking-tight">{selectedAsset.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-subtle border border-borderSubtle font-mono text-neutralMuted font-bold">
                    {selectedAsset.id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-accent-subtle text-accent border border-accent/20 font-mono">
                    {getCompanyIndustry(selectedAsset.id)}
                  </span>
                </div>
                <div className="text-xs text-neutralMuted font-mono mt-1">
                  NSE Real-Time • {getCompanySubSector(selectedAsset.id)}
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

            {/* Price Chart SVG */}
            <PriceChart asset={selectedAsset} height={200} hideHeader={true} hideWrapper={true} />
          </div>
        )}

        {/* Consolidated Order Ticket */}
        <TradePad
          player={currentPlayer}
          room={room}
          onTrade={handleExecuteTrade}
          selectedAssetId={selectedAssetId}
          onSelectAsset={setSelectedAssetId}
        />
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* COLUMN 3 (Right: 3 cols) - Positions, Feed, & Leaderboard           */}
      {/* ------------------------------------------------------------------- */}
      <div className="col-span-3 space-y-4">
        {/* Portfolio & Positions */}
        <PortfolioCard player={currentPlayer} room={room} />

        {/* Live Leaderboard */}
        <LiveLeaderboard players={room.players} currentPlayerId={currentPlayer.id} maxDisplay={6} />

        {/* Collapsible Execution Feed */}
        <div className="card-surface p-4 flex flex-col">
          <div
            onClick={() => setShowFeed(!showFeed)}
            className="flex items-center justify-between cursor-pointer pb-1 border-b border-borderSubtle"
          >
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-neutralMuted" /> Execution Feed
            </span>
            {showFeed ? <ChevronUp className="w-3.5 h-3.5 text-neutralMuted" /> : <ChevronDown className="w-3.5 h-3.5 text-neutralMuted" />}
          </div>

          {showFeed && (
            <div className="mt-2 space-y-1 max-h-[160px] overflow-y-auto pr-1 text-xs font-mono">
              {(room.recentTrades?.length || 0) === 0 ? (
                <div className="text-neutralMuted text-xs italic py-3 text-center">
                  Waiting for orders...
                </div>
              ) : (
                (room.recentTrades || []).slice(0, 8).map((t) => (
                  <div
                    key={t.id}
                    className="p-1.5 rounded bg-surface-subtle border border-borderSubtle flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white">{t.assetId}</span>
                      <span className="text-[10px] text-neutralMuted block truncate max-w-[80px]">
                        {t.playerName}
                      </span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        t.side === "BUY" ? "text-gain bg-gain-subtle" : "text-loss bg-loss-subtle"
                      }`}
                    >
                      {t.side} {t.quantity}
                    </span>
                    <span className="text-white tabular-nums">{formatINR(t.price)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sentiment Meter */}
        <SentimentMeter recentTrades={room.recentTrades} />
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-app text-slate-100 flex flex-col justify-between font-sans">
      
      {/* =================================================================== */}
      {/* STICKY MINIMALIST TERMINAL HEADER                                   */}
      {/* =================================================================== */}
      <header className="border-b border-borderSubtle bg-surface sticky top-0 z-50 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand + Trader Desk Badge */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="bg-white p-1 rounded-md shrink-0">
              <img src="/jain-logo.png" alt="Jain Logo" className="h-4 w-auto" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate flex items-center gap-1.5">
                <span className="truncate">{currentPlayer.name}</span>
                <span className="text-[10px] font-mono font-bold text-amber-400">
                  #{currentPlayer.rank}
                </span>
              </div>
              <div className="text-[10px] text-neutralMuted font-mono truncate">
                Room {roomCode} • Live Trading Floor
              </div>
            </div>
          </div>

          {/* Center: Live Clock & Round Telemetry */}
          <div className="hidden md:flex items-center gap-3 font-mono text-xs text-neutralMuted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span className="text-white font-bold tabular-nums">{clockTime || "10:00:00"}</span>
            </span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                isMarketActive ? "bg-gain-subtle text-gain" : "bg-warningMuted-subtle text-warningMuted"
              }`}
            >
              {room.status} (Round {room.currentRound} of {room.totalRounds})
            </span>
          </div>

          {/* Right: Net Worth, Liquid Cash, Audio & Mode Toggle */}
          <div className="flex items-center gap-3 text-xs shrink-0 font-mono">
            
            {/* Net Worth & P&L */}
            <div className="text-right">
              <div className="text-xs sm:text-sm font-bold text-white tabular-nums">
                {formatINR(currentPlayer.totalNetWorth)}
              </div>
              <div
                className={`text-[11px] font-bold tabular-nums ${
                  isReturnPositive ? "text-gain" : "text-loss"
                }`}
              >
                {isReturnPositive ? "+" : ""}
                {currentPlayer.returnPercent.toFixed(2)}%
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:inline-flex bg-surface-subtle p-0.5 rounded-ui border border-borderSubtle text-xs">
              <button
                type="button"
                onClick={() => setViewMode("web")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  viewMode === "web" || (viewMode === "responsive" && typeof window !== "undefined" && window.innerWidth >= 1024)
                    ? "bg-surface text-white shadow-sm"
                    : "text-neutralMuted hover:text-white"
                }`}
              >
                Pro
              </button>
              <button
                type="button"
                onClick={() => setViewMode("app")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  viewMode === "app" || (viewMode === "responsive" && typeof window !== "undefined" && window.innerWidth < 1024)
                    ? "bg-surface text-white shadow-sm"
                    : "text-neutralMuted hover:text-white"
                }`}
              >
                App
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title="Toggle audio"
              className="p-1.5 rounded-ui bg-surface-subtle text-neutralMuted hover:text-white border border-borderSubtle transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-accent" /> : <VolumeX className="w-3.5 h-3.5 text-neutralMuted" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1">
        {viewMode === "app" ? (
          renderMobileTerminal()
        ) : viewMode === "web" ? (
          renderWebTerminal()
        ) : (
          <>
            <div className="lg:hidden">{renderMobileTerminal()}</div>
            <div className="hidden lg:block">{renderWebTerminal()}</div>
          </>
        )}
      </main>

      <footer className="w-full text-center text-[11px] text-neutralMuted font-mono py-3 border-t border-borderSubtle">
        JSE Simulation • Continuous Double Auction • Zero Risk
      </footer>
    </div>
  );
}

export default function PlayRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PlayRoomContent />
    </Suspense>
  );
}
