"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NewsEvent, RoomState, StudentDesk, AssetId, PlayerPortfolio } from "@/types/trading";
import {
  advanceRound,
  createInitialRoom,
  getRoomState,
  resetRoomState,
  saveRoomState,
  spawnBots,
  subscribeToRoom,
  subscribeToTrades,
  triggerNewsEvent,
  updateRoomStatus,
} from "@/lib/sync/syncService";
import {
  subscribeToFirebaseConnection,
  isFirebaseConfigured,
  FirebaseConnectionStatus,
  database,
} from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
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
  Users,
  Search,
  Activity,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  Gamepad2,
} from "lucide-react";
import {
  formatINR,
  DEFAULT_TEACHER_PIN,
  DESK_METADATA,
  getCompanyFullName,
  getCompanyIndustry,
} from "@/lib/constants";
import Link from "next/link";

function HostDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("room") || "WALLST";
  const [roomCode, setRoomCode] = useState(roomParam.toUpperCase());
  const [room, setRoom] = useState<RoomState | null>(null);

  // Security gate state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [hostPlayerName, setHostPlayerName] = useState("");
  const [pinError, setPinError] = useState(false);

  // Real-time Firebase RTDB connection status
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>({
    connected: false,
    permissionGranted: false,
    permissionDenied: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Student roster search & desk filter
  const [deskFilter, setDeskFilter] = useState<"ALL" | StudentDesk>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("jse_teacher_authorized");
    if (auth === "true") setIsAuthorized(true);
  }, []);

  useEffect(() => {
    return subscribeToFirebaseConnection(setFirebaseStatus);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const latest = await getRoomState(roomCode);
      if (latest) {
        setRoom(latest);
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pinInput.trim();
    if (pin === "8797") {
      setIsAuthorized(true);
      setPinError(false);
      sessionStorage.setItem("jse_teacher_authorized", "true");
    } else {
      setPinError(true);
    }
  };

  const handleHostJoinAsPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pin = pinInput.trim();
    if (pin !== "8797") {
      setPinError(true);
      return;
    }
    setPinError(false);
    sessionStorage.setItem("jse_teacher_authorized", "true");
    const nameToUse = hostPlayerName.trim() || "Faculty Host";
    const uid = `player_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const email = `faculty.${Date.now()}@jainuniversity.ac.in`;

    localStorage.setItem("trading_sim_player_name", nameToUse);
    localStorage.setItem("trading_sim_player_email", email);
    localStorage.setItem("trading_sim_player_id", uid);

    const query = new URLSearchParams({
      name: nameToUse,
      email,
      uid,
    });
    router.push(`/play/${roomCode}?${query.toString()}`);
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

    const unsubTrades = subscribeToTrades(roomCode, (recentTrades) => {
      setRoom((prev) => (prev ? { ...prev, recentTrades } : prev));
    });

    // Instant real-time listener for student joins
    let unsubPlayers: (() => void) | null = null;
    if (isFirebaseConfigured && database) {
      try {
        const playersRef = ref(database, `rooms/${roomCode}/players`);
        unsubPlayers = onValue(playersRef, (snapshot) => {
          if (snapshot.exists()) {
            const players = snapshot.val() as Record<string, PlayerPortfolio>;
            setRoom((prev) => (prev ? { ...prev, players } : prev));
          }
        });
      } catch {}
    }

    return () => {
      unsubscribe();
      unsubTrades();
      if (unsubPlayers) unsubPlayers();
    };
  }, [roomCode]);

  const handleUpdateStatus = async (status: RoomState["status"]) => {
    if (!room) return;
    // Optimistic immediate update for 0ms teacher UI feedback
    setRoom((prev) => (prev ? { ...prev, status } : prev));
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
    if (
      !window.confirm(
        "Are you sure you want to reset all trades, students, and portfolios for this session?"
      )
    ) {
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

  // Enhanced CSV Export including Holdings Breakdown
  const handleExportCSV = () => {
    if (!room) return;
    const playersList = Object.values(room.players || {}).sort(
      (a, b) => (b.totalNetWorth ?? 0) - (a.totalNetWorth ?? 0)
    );

    const headers = [
      "Rank",
      "Trader Name",
      "Verified Email",
      "Total Net Worth (INR)",
      "Return (%)",
      "Liquid Cash (INR)",
      "Total Trades",
      "Portfolio Holdings",
    ];

    const rows = playersList.map((p, idx) => {
      const holdingsStr = Object.entries(p.shares || {})
        .filter(([, qty]) => qty > 0)
        .map(([aid, qty]) => `${aid}:${qty}`)
        .join("; ");

      return [
        idx + 1,
        `"${(p.name || "Student").replace(/"/g, '""')}"`,
        `"${(p.email || p.id || "").replace(/"/g, '""')}"`,
        (p.totalNetWorth ?? 1000000).toFixed(2),
        (p.returnPercent ?? 0).toFixed(2),
        (p.cash ?? 1000000).toFixed(2),
        p.totalTrades ?? 0,
        `"${holdingsStr}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `JSE_Student_Results_Room_${room.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered student list
  const allPlayers = useMemo(() => {
    if (!room?.players) return [];
    return Object.values(room.players).sort(
      (a, b) => (b.totalNetWorth ?? 0) - (a.totalNetWorth ?? 0)
    );
  }, [room?.players]);

  const filteredStudents = useMemo(() => {
    return allPlayers.filter((p) => {
      const matchesDesk = deskFilter === "ALL" || p.desk === deskFilter;
      const q = searchQuery.trim().toLowerCase();
      const name = (p.name || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      const id = (p.id || "").toLowerCase();
      const matchesSearch = !q || name.includes(q) || email.includes(q) || id.includes(q);
      return matchesDesk && matchesSearch;
    });
  }, [allPlayers, deskFilter, searchQuery]);

  // Breakdown counts by desk
  const deskCounts = useMemo(() => {
    const counts: Record<string, number> = {
      tech_analyst: 0,
      fmcg_consumer: 0,
      institutional_fii: 0,
      retail_momentum: 0,
    };
    allPlayers.forEach((p) => {
      if (p.desk in counts) counts[p.desk]++;
    });
    return counts;
  }, [allPlayers]);

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
              <label className="block text-xs font-bold text-neutralMuted uppercase tracking-wider mb-1 font-mono flex justify-between">
                <span>Security PIN</span>
                <span className="text-[10px] text-accent font-mono font-bold">PIN: 8797</span>
              </label>
              <input
                type="password"
                autoFocus
                required
                placeholder="Enter PIN (8797)"
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
                <div className="text-xs text-loss font-bold text-center mt-1.5 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Invalid PIN. Access restricted to authorized faculty (PIN: 8797).</span>
                </div>
              )}
            </div>

            {/* Direct Play with Custom Name */}
            <div className="p-3 bg-accent/10 border border-accent/30 rounded-ui space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-accent" />
                  <span>Play Floor as Custom Trader</span>
                </span>
                <span className="text-[10px] text-gain font-mono font-bold">BYPASSES EMAIL</span>
              </label>
              <input
                type="text"
                placeholder="Type player name (e.g. Prof. Sharma, Akshit)"
                value={hostPlayerName}
                onChange={(e) => setHostPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleHostJoinAsPlayer();
                  }
                }}
                className="w-full min-h-touch bg-surface border border-borderSubtle focus:border-accent rounded-ui px-3.5 py-2 text-xs text-white placeholder:text-neutralMuted/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleHostJoinAsPlayer()}
                className="w-full min-h-touch py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider rounded-ui shadow-ui motion-btn-press flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Floor as {hostPlayerName.trim() || "Faculty Host"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              className="w-full min-h-touch py-2.5 bg-surface-subtle hover:bg-surface border border-borderSubtle hover:border-borderStrong text-white font-bold text-xs uppercase tracking-wider rounded-ui shadow-ui motion-btn-press"
            >
              Unlock Facilitator Console
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
                
                {/* Real-Time Live Sync Status Badge */}
                <div
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                    firebaseStatus.permissionGranted
                      ? "bg-gain-subtle text-gain border border-gain-border"
                      : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                  }`}
                  title={
                    firebaseStatus.permissionGranted
                      ? "Google Cloud Firebase Realtime Database active and streaming live updates via WebSocket"
                      : "Firebase RTDB security rules locked (permission denied) - set .read: true, .write: true in Firebase Console"
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      firebaseStatus.permissionGranted ? "bg-gain animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  <span>
                    {firebaseStatus.permissionGranted
                      ? "Firebase RTDB Multi-Device Live"
                      : "Rules Locked (Single-Device Fallback)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-subtle border border-borderSubtle text-xs font-mono text-neutralMuted">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span className="font-bold text-white">{allPlayers.length}</span>
              <span>Traders</span>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              className="min-h-touch px-3 py-1.5 rounded-ui bg-surface-subtle hover:bg-surface border border-borderSubtle text-xs font-bold text-white motion-btn-press flex items-center gap-1.5"
              title="Force sync latest room state from server"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-accent ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Floor"}</span>
            </button>

            <Link
              href={`/play/${roomCode}`}
              target="_blank"
              className="min-h-touch px-3 py-1.5 rounded-ui bg-accent/15 hover:bg-accent/25 border border-accent/40 text-xs font-bold text-accent hover:text-white motion-btn-press flex items-center gap-1.5"
              title="Open trading floor as trader in new tab"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-accent" />
              <span>Play on Floor</span>
            </Link>

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
            {/* Multi-Device Cloud Sync Warning if Firebase Rules are locked */}
            {firebaseStatus.permissionDenied && (
              <div className="card-surface p-4 border border-amber-500/40 bg-amber-500/10 rounded-ui space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        Multi-Device Cloud Synchronization Is Blocked (Firebase Rules Locked)
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ACTION REQUIRED IN FIREBASE CONSOLE
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      Other devices (smartphones, tablets, student laptops) cannot synchronize live with your system because your Google Cloud Firebase Realtime Database rules currently reject read and write access.
                    </p>
                    <div className="text-xs font-mono bg-black/60 p-3 rounded-ui border border-amber-500/20 text-slate-300 space-y-2.5 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                        <span>
                          Open your Firebase Console:{" "}
                          <a
                            href="https://console.firebase.google.com/project/jse-trading-sim/database/jse-trading-sim-default-rtdb/rules"
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent underline font-bold"
                          >
                            Firebase Console &gt; Realtime Database &gt; Rules Tab
                          </a>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                        <span>Replace existing rules with:</span>
                      </div>
                      <div className="p-2.5 rounded bg-black text-gain font-mono text-xs border border-white/10 select-all">
                        {`{\n  "rules": {\n    ".read": true,\n    ".write": true\n  }\n}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                        <span>Click <strong>Publish</strong>. All connected devices will instantly synchronize live in real time!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Round Controls */}
            <RoundControl
              room={room}
              onUpdateStatus={handleUpdateStatus}
              onAdvanceRound={handleAdvanceRound}
              onResetRoom={handleResetRoom}
            />

            {/* News Catalyst Dispatcher & Leaderboard Row */}
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
                <LiveLeaderboard players={room.players} maxDisplay={10} />
                <SentimentMeter recentTrades={room.recentTrades} />
              </div>
            </div>

            {/* ============================================================= */}
            {/* REAL-TIME STUDENT ROSTER & RECORDED PORTFOLIO MONITOR         */}
            {/* ============================================================= */}
            <div className="card-surface p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-borderSubtle">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span>Live Student Roster & Portfolio Monitor</span>
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-accent-subtle text-accent border border-accent/20">
                      {filteredStudents.length} of {allPlayers.length} Active
                    </span>
                  </div>
                  <p className="text-xs text-neutralMuted mt-0.5 font-mono">
                    Real-time stream of all student portfolios recorded in Firebase Realtime Database
                  </p>
                </div>

                {/* Desk Filter Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setDeskFilter("ALL")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      deskFilter === "ALL"
                        ? "bg-accent text-white"
                        : "bg-surface-subtle text-neutralMuted hover:text-white border border-borderSubtle"
                    }`}
                  >
                    ALL ({allPlayers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeskFilter("tech_analyst")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      deskFilter === "tech_analyst"
                        ? "bg-accent text-white"
                        : "bg-surface-subtle text-neutralMuted hover:text-white border border-borderSubtle"
                    }`}
                  >
                    IT Tech ({deskCounts.tech_analyst})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeskFilter("fmcg_consumer")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      deskFilter === "fmcg_consumer"
                        ? "bg-accent text-white"
                        : "bg-surface-subtle text-neutralMuted hover:text-white border border-borderSubtle"
                    }`}
                  >
                    FMCG ({deskCounts.fmcg_consumer})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeskFilter("institutional_fii")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      deskFilter === "institutional_fii"
                        ? "bg-accent text-white"
                        : "bg-surface-subtle text-neutralMuted hover:text-white border border-borderSubtle"
                    }`}
                  >
                    FII ({deskCounts.institutional_fii})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeskFilter("retail_momentum")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      deskFilter === "retail_momentum"
                        ? "bg-accent text-white"
                        : "bg-surface-subtle text-neutralMuted hover:text-white border border-borderSubtle"
                    }`}
                  >
                    Retail ({deskCounts.retail_momentum})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutralMuted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student name or trader ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-subtle border border-borderSubtle focus:border-borderFocus rounded-ui pl-9 pr-4 py-2 text-xs text-white placeholder-neutralMuted font-mono focus:outline-none"
                />
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-borderSubtle text-neutralMuted uppercase text-[10px] tracking-wider">
                      <th className="pb-2 pl-2">Rank & Verified Trader</th>
                      <th className="pb-2">Desk Assignment</th>
                      <th className="pb-2 text-right">Net Worth</th>
                      <th className="pb-2 text-right">Return</th>
                      <th className="pb-2 text-right">Liquid Cash</th>
                      <th className="pb-2 text-center">Trades</th>
                      <th className="pb-2 text-right pr-2">Holdings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderSubtle">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutralMuted italic">
                          No students registered in this room yet. Ask students to sign in with Google at{" "}
                          <span className="text-accent underline font-bold">/play/{roomCode}</span>.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, idx) => {
                        const isExpanded = expandedStudentId === student.id;
                        const desk = student.desk ? DESK_METADATA[student.desk] : undefined;
                        const returnPct = typeof student.returnPercent === "number" ? student.returnPercent : 0;
                        const isPositive = returnPct >= 0;
                        const studentNetWorth = typeof student.totalNetWorth === "number" ? student.totalNetWorth : 1000000;
                        const studentCash = typeof student.cash === "number" ? student.cash : 1000000;
                        const studentName = student.name || "Student Trader";
                        const nonZeroShares = Object.entries(student.shares || {}).filter(
                          ([, qty]) => qty > 0
                        );

                        return (
                          <React.Fragment key={student.id}>
                            <tr className="hover:bg-surface-subtle/60 transition-colors">
                              <td className="py-2.5 pl-2 font-bold text-white flex items-center gap-2">
                                <span className="w-5 text-center text-neutralMuted text-[11px]">
                                  #{idx + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    {student.photoURL ? (
                                      <img
                                        src={student.photoURL}
                                        alt={studentName}
                                        className="w-4 h-4 rounded-full shrink-0"
                                      />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-accent/20 text-accent font-bold text-[9px] flex items-center justify-center shrink-0">
                                        {studentName[0] || "S"}
                                      </div>
                                    )}
                                    <span className="font-sans text-xs font-bold text-white">{studentName}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" title="Live Verified Student" />
                                  </div>
                                  <span className="text-[10px] text-neutralMuted font-normal block truncate max-w-[190px]">
                                    {student.email || student.id}
                                  </span>
                                </div>
                              </td>

                              <td className="py-2.5">
                                <span className="px-2 py-0.5 rounded bg-surface border border-borderSubtle text-[10px] text-neutralMuted">
                                  {desk?.name || student.desk || "Student"}
                                </span>
                              </td>

                              <td className="py-2.5 text-right font-bold text-white tabular-nums">
                                {formatINR(studentNetWorth)}
                              </td>

                              <td
                                className={`py-2.5 text-right font-bold tabular-nums ${
                                  isPositive ? "text-gain" : "text-loss"
                                }`}
                              >
                                {isPositive ? "+" : ""}
                                {returnPct.toFixed(2)}%
                              </td>

                              <td className="py-2.5 text-right text-neutralMuted tabular-nums">
                                {formatINR(studentCash)}
                              </td>

                              <td className="py-2.5 text-center tabular-nums">
                                <span className="px-1.5 py-0.5 rounded bg-surface-subtle text-[11px] font-bold text-white border border-borderSubtle">
                                  {student.totalTrades ?? 0}
                                </span>
                              </td>

                              <td className="py-2.5 text-right pr-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedStudentId(isExpanded ? null : student.id)
                                  }
                                  className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-medium"
                                >
                                  <span>{nonZeroShares.length} Assets</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Holdings Breakdown */}
                            {isExpanded && (
                              <tr className="bg-surface-subtle/80">
                                <td colSpan={7} className="px-4 py-3">
                                  <div className="text-[10px] uppercase font-bold text-neutralMuted mb-1.5">
                                    {student.name}&apos;s Recorded Stock Portfolio:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {nonZeroShares.length === 0 ? (
                                      <span className="text-xs text-neutralMuted italic">
                                        All cash position (no active equity shares)
                                      </span>
                                    ) : (
                                      nonZeroShares.map(([aid, qty]) => {
                                        const asset = room?.assets?.[aid as AssetId];
                                        const assetPrice = asset?.currentPrice || 0;
                                        const totalVal = qty * assetPrice;
                                        return (
                                          <div
                                            key={aid}
                                            className="px-2.5 py-1 rounded bg-surface border border-borderSubtle text-xs flex items-center gap-2"
                                          >
                                            <span className="font-bold text-white">{aid}</span>
                                            <span className="text-neutralMuted text-[11px]">
                                              {qty} shs
                                            </span>
                                            <span className="text-accent text-[11px] font-bold tabular-nums">
                                              {formatINR(totalVal)}
                                            </span>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ============================================================= */}
            {/* LIVE TRADE EXECUTION STREAM (Incoming Orders in Real Time)   */}
            {/* ============================================================= */}
            <div className="card-surface p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-borderSubtle">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Real-Time Order Execution Stream
                  </h3>
                </div>
                <span className="text-xs font-mono text-neutralMuted">
                  {room.recentTrades?.length || 0} Executed
                </span>
              </div>

              {(room.recentTrades?.length || 0) === 0 ? (
                <div className="text-xs text-neutralMuted italic py-6 text-center font-mono">
                  Waiting for student orders... Orders executed in /play will appear here in real time.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 font-mono text-xs">
                  {room.recentTrades.slice(0, 15).map((trade) => {
                    const isBuy = trade.side === "BUY";
                    return (
                      <div
                        key={trade.id}
                        className="p-2.5 rounded bg-surface-subtle border border-borderSubtle flex items-center justify-between hover:border-borderStrong transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isBuy
                                ? "bg-gain-subtle text-gain border border-gain-border"
                                : "bg-loss-subtle text-loss border border-loss-border"
                            }`}
                          >
                            {trade.side}
                          </span>
                          <span className="font-bold text-white truncate max-w-[120px] sm:max-w-none">
                            {trade.playerName}
                          </span>
                          <span className="text-[10px] text-neutralMuted hidden sm:inline">
                            ({DESK_METADATA[trade.desk]?.name || trade.desk})
                          </span>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-bold text-white">
                              {trade.quantity} × {trade.assetId}
                            </span>
                            <span className="text-[11px] text-neutralMuted block">
                              @{formatINR(trade.price)}
                            </span>
                          </div>
                          <div className="font-bold text-white tabular-nums">
                            {formatINR(trade.total)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

export default function HostDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HostDashboardContent />
    </Suspense>
  );
}
