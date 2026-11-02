"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentDesk } from "@/types/trading";
import { DESK_METADATA, DEFAULT_TEACHER_PIN } from "@/lib/constants";
import {
  TrendingUp,
  TrendingDown,
  Presentation,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Unlock,
  KeyRound,
  AlertTriangle,
  Cpu,
  ShoppingBag,
  Landmark,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Monitor,
  Smartphone,
  Layers,
  ChevronRight,
  Shield,
  Activity,
  Award,
  Clock,
  Radio,
  BarChart3,
  Flame,
  ArrowUpRight,
  PieChart,
} from "lucide-react";

const TICKER_ITEMS = [
  { id: "MPHASIS", name: "Mphasis Ltd", price: "₹2,850.00", chg: "+1.2%", pos: true, sector: "IT" },
  { id: "COFORGE", name: "Coforge Ltd", price: "₹7,600.00", chg: "+2.4%", pos: true, sector: "IT" },
  { id: "OFSS", name: "Oracle Financial", price: "₹10,500.00", chg: "+0.8%", pos: true, sector: "IT" },
  { id: "LTTS", name: "L&T Tech Services", price: "₹5,200.00", chg: "-0.4%", pos: false, sector: "IT" },
  { id: "TATAELXSI", name: "Tata Elxsi", price: "₹7,100.00", chg: "+1.9%", pos: true, sector: "IT" },
  { id: "COLPAL", name: "Colgate-Palmolive", price: "₹3,100.00", chg: "+0.5%", pos: true, sector: "FMCG" },
  { id: "PGHH", name: "Procter & Gamble", price: "₹15,800.00", chg: "-1.1%", pos: false, sector: "FMCG" },
  { id: "RADICO", name: "Radico Khaitan", price: "₹2,150.00", chg: "+3.2%", pos: true, sector: "FMCG" },
  { id: "UBL", name: "United Breweries", price: "₹1,950.00", chg: "+0.7%", pos: true, sector: "FMCG" },
  { id: "GILLETTE", name: "Gillette India", price: "₹8,400.00", chg: "+0.3%", pos: true, sector: "FMCG" },
];

interface DeskDetail {
  icon: React.ElementType;
  badge: string;
  strategyMandate: string;
  starterCashVal: string;
  cashPercent: number;
  stockPercent: number;
  starterHoldingsSummary: string;
  starterPills: string[];
  themeColor: string;
  borderActive: string;
  bgActive: string;
  badgeBg: string;
  badgeText: string;
}

const DESK_CONFIGS: Record<StudentDesk, DeskDetail> = {
  tech_analyst: {
    icon: Cpu,
    badge: "Tech Growth Focus",
    strategyMandate: "High Beta Tech & Enterprise AI",
    starterCashVal: "₹6,15,750",
    cashPercent: 62,
    stockPercent: 38,
    starterHoldingsSummary: "70 Total Shares in Indian IT Leaders",
    starterPills: ["MPHASIS 15", "COFORGE 10", "OFSS 5", "LTTS 20", "TATAELXSI 20"],
    themeColor: "text-cyan-400",
    borderActive: "border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-950/50",
    bgActive: "bg-cyan-950/40",
    badgeBg: "bg-cyan-500/15 border-cyan-500/30",
    badgeText: "text-cyan-300",
  },
  fmcg_consumer: {
    icon: ShoppingBag,
    badge: "Defensive Staples",
    strategyMandate: "Resilient Consumer Goods & Margins",
    starterCashVal: "₹5,32,200",
    cashPercent: 53,
    stockPercent: 47,
    starterHoldingsSummary: "136 Total Shares in FMCG Household Brands",
    starterPills: ["COLPAL 30", "PGHH 6", "RADICO 50", "UBL 35", "GILLETTE 15"],
    themeColor: "text-amber-400",
    borderActive: "border-amber-400 ring-2 ring-amber-400/40 shadow-amber-950/50",
    bgActive: "bg-amber-950/40",
    badgeBg: "bg-amber-500/15 border-amber-500/30",
    badgeText: "text-amber-300",
  },
  institutional_fii: {
    icon: Landmark,
    badge: "Macro & Institutional",
    strategyMandate: "Diversified Blue-Chip Multi-Sector Flow",
    starterCashVal: "₹4,82,800",
    cashPercent: 48,
    stockPercent: 52,
    starterHoldingsSummary: "103 Total Shares across Balanced Mix",
    starterPills: ["COFORGE 15", "COLPAL 25", "MPHASIS 20", "PGHH 8", "RADICO 35"],
    themeColor: "text-emerald-400",
    borderActive: "border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-950/50",
    bgActive: "bg-emerald-950/40",
    badgeBg: "bg-emerald-500/15 border-emerald-500/30",
    badgeText: "text-emerald-300",
  },
  retail_momentum: {
    icon: Zap,
    badge: "Tactical Liquidity",
    strategyMandate: "High Dry Powder & Fast Execution",
    starterCashVal: "₹6,71,500",
    cashPercent: 67,
    stockPercent: 33,
    starterHoldingsSummary: "45 Total Shares in Fast-Moving Outperformers",
    starterPills: ["TATAELXSI 15", "RADICO 30"],
    themeColor: "text-purple-400",
    borderActive: "border-purple-400 ring-2 ring-purple-400/40 shadow-purple-950/50",
    bgActive: "bg-purple-950/40",
    badgeBg: "bg-purple-500/15 border-purple-500/30",
    badgeText: "text-purple-300",
  },
};

export default function HomePage() {
  const router = useRouter();

  // Role Switcher Tab: student | faculty
  const [activePortalRole, setActivePortalRole] = useState<"student" | "faculty">("student");

  // Student Form State
  const [studentName, setStudentName] = useState("");
  const [roomCode, setRoomCode] = useState("WALLST");
  const [selectedDesk, setSelectedDesk] = useState<StudentDesk>("tech_analyst");

  // Faculty Gate State
  const [facultyPin, setFacultyPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Simulated Live Clock
  const [currentTime, setCurrentTime] = useState("");
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    // Session authorization check
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("jse_teacher_authorized");
      if (auth === "true") {
        setIsUnlocked(true);
      }
    }

    // Dynamic Clock
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyPin = () => {
    navigator.clipboard.writeText(roomCode.trim().toUpperCase() || "WALLST");
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleJoinStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !roomCode.trim()) return;

    const trimmedCode = roomCode.trim().toUpperCase();
    const query = new URLSearchParams({
      name: studentName.trim(),
      desk: selectedDesk,
    });

    router.push(`/play/${trimmedCode}?${query.toString()}`);
  };

  const handleVerifyFacultyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (facultyPin.trim() === DEFAULT_TEACHER_PIN) {
      sessionStorage.setItem("jse_teacher_authorized", "true");
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLockFaculty = () => {
    sessionStorage.removeItem("jse_teacher_authorized");
    setIsUnlocked(false);
    setFacultyPin("");
  };

  const handleOpenHost = () => {
    const code = roomCode.trim().toUpperCase() || "WALLST";
    router.push(`/host?room=${code}`);
  };

  const handleOpenProjector = () => {
    const code = roomCode.trim().toUpperCase() || "WALLST";
    router.push(`/projector/${code}`);
  };

  return (
    <main className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Ambient Grid & Glows */}
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* TOP INSTITUTIONAL BAR: University Brand, Live Simulation Status, Clock & Session PIN */}
      <header className="border-b border-slate-800/80 bg-[#0A0E17]/95 sticky top-0 z-50 backdrop-blur-md px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Crest */}
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/95 p-1.5 rounded-xl border border-slate-700/80 shadow-md shadow-cyan-950/40 flex items-center justify-center shrink-0">
                <img
                  src="/jain-logo.png"
                  alt="Jain University Crest"
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase leading-none font-mono">
                  Jain (Deemed-to-be University)
                </div>
                <div className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                  <span>JSE Stock Exchange</span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    LIVE SIM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Telemetry Pill (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Continuous Double Auction</span>
            <span className="text-slate-600">•</span>
            <span>₹10 Lakhs Starting Fund</span>
            <span className="text-slate-600">•</span>
            <span>10 NSE Equities</span>
          </div>

          {/* Quick Session Info & Live Simulation Clock */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-slate-500 font-mono text-[10px] tracking-wider uppercase flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> SIMULATION CLOCK
              </span>
              <span className="font-mono font-bold text-xs text-slate-200">
                {currentTime || "10:00:00 AM"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
              <span className="text-slate-500 text-[11px]">ROOM:</span>
              <span className="text-cyan-400 font-black tracking-wider">{roomCode || "WALLST"}</span>
              <button
                type="button"
                onClick={handleCopyPin}
                title="Copy Room Code"
                className="hover:text-white text-slate-400 transition-colors ml-1 p-0.5 rounded hover:bg-slate-800"
              >
                {copiedPin ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTINUOUS MARKET TICKER STRIP (10 Indian Equities) */}
      <div className="w-full bg-[#080D16] border-b border-slate-800/80 overflow-hidden py-2 relative z-20 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
        <div className="animate-ticker space-x-6 text-xs font-mono">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 shrink-0">
              <span className="font-black text-white">{item.id}</span>
              <span className="text-slate-300 font-medium">{item.price}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  item.pos
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                {item.pos ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {item.chg}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA: Institutional 2-Column Balanced Grid */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 flex-1 flex flex-col justify-center">
        
        {/* On mobile, show a compact hero intro above everything */}
        <div className="block lg:hidden mb-5 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold tracking-wide">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>CMS FINANCIAL LAB • JSE ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Institutional-Grade{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Trading Simulation
            </span>
          </h1>
          <p className="text-xs text-slate-300">
            Real-time double auction matching with{" "}
            <span className="text-white font-bold font-mono">₹10,00,000 INR</span> starting capital.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN (Lg: 7 cols) - Institutional Briefing & Market */}
          {/* Order: On mobile, rendered SECOND (order-2 lg:order-1)     */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 order-2 lg:order-1 space-y-6">
            
            {/* Desktop Hero Headline (hidden on small mobile screens since already in intro) */}
            <div className="hidden lg:block space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wide">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>CMS FINANCIAL SIMULATION LAB • JSE ENGINE</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
                Institutional-Grade{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                  Trading Simulation.
                </span>
              </h1>

              <p className="text-sm xl:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
                Experience high-velocity market microstructure, continuous double-auction limit orders,
                and real-time macroeconomic news shocks — with{" "}
                <span className="text-white font-bold font-mono">₹10,00,000</span>{" "}
                <span className="text-white font-bold">INR starting capital</span> per trader and zero
                financial risk.
              </p>
            </div>

            {/* Micro Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Starting Fund</span>
                <span className="text-base font-black font-mono text-emerald-400">₹10,00,000</span>
                <span className="text-[10px] text-slate-500 block">Per Trader</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Order Engine</span>
                <span className="text-base font-black font-mono text-cyan-400">Continuous</span>
                <span className="text-[10px] text-slate-500 block">Double Auction</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Simulated Latency</span>
                <span className="text-base font-black font-mono text-amber-400">&lt; 15 ms</span>
                <span className="text-[10px] text-slate-500 block">Live WebSockets</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Classroom Format</span>
                <span className="text-base font-black font-mono text-purple-400">5 Rounds</span>
                <span className="text-[10px] text-slate-500 block">Breaking News Shocks</span>
              </div>
            </div>

            {/* LIVE MARKET OVERVIEW (10 Indian Equities: IT vs FMCG) */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Equities Roster (10 Indian Stocks)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">2 Key Sectors</span>
              </div>

              {/* 2 Sector Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sector A: IT */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase font-mono flex items-center justify-between px-1">
                    <span>💻 IT & Technology</span>
                    <span className="text-[10px] text-slate-500">5 Equities</span>
                  </div>
                  <div className="space-y-1">
                    {TICKER_ITEMS.filter((i) => i.sector === "IT").map((st) => (
                      <div
                        key={st.id}
                        className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <span className="font-bold text-white">{st.id}</span>
                          <span className="text-[10px] text-slate-500 block">{st.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-200 font-semibold">{st.price}</span>
                          <span
                            className={`block text-[10px] font-bold ${
                              st.pos ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {st.chg}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sector B: FMCG */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-400 uppercase font-mono flex items-center justify-between px-1">
                    <span>🛒 FMCG Consumer Staples</span>
                    <span className="text-[10px] text-slate-500">5 Equities</span>
                  </div>
                  <div className="space-y-1">
                    {TICKER_ITEMS.filter((i) => i.sector === "FMCG").map((st) => (
                      <div
                        key={st.id}
                        className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <span className="font-bold text-white">{st.id}</span>
                          <span className="text-[10px] text-slate-500 block">{st.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-200 font-semibold">{st.price}</span>
                          <span
                            className={`block text-[10px] font-bold ${
                              st.pos ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {st.chg}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pedagogy Features Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-2">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">Dual Student Terminals</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Switch anytime between the 3-column Web Pro Terminal and Native Mobile App view.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-2">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">Catalyst Shock Engine</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  RBI interest rate decisions, quarterly tech earnings, and consumer tax policy shifts.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-2">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">Institutional Pedagogy</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Real-time Net Worth & PnL ranking across all desks for competitive classroom learning.
                </p>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (Lg: 5 cols) - Interactive Terminal Gateway   */}
          {/* Order: On mobile, rendered FIRST (order-1 lg:order-2)      */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-800 relative overflow-hidden">
              
              {/* Subtle Ambient Card Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Segmented Role Switcher: Student vs Faculty */}
              <div className="grid grid-cols-2 p-1 bg-slate-950/95 rounded-2xl border border-slate-800 mb-6 text-xs font-semibold relative z-10">
                <button
                  type="button"
                  onClick={() => setActivePortalRole("student")}
                  className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activePortalRole === "student"
                      ? "bg-slate-800 text-white shadow-lg font-black border border-cyan-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span>Student Trader</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePortalRole("faculty")}
                  className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activePortalRole === "faculty"
                      ? "bg-slate-800 text-white shadow-lg font-black border border-purple-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Faculty & Floor</span>
                </button>
              </div>

              {/* ======================================================= */}
              {/* VIEW A: STUDENT REGISTRATION & SYNDICATE DESK SELECTOR  */}
              {/* ======================================================= */}
              {activePortalRole === "student" ? (
                <form onSubmit={handleJoinStudent} className="space-y-4 relative z-10">
                  
                  {/* Form Input Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Your Trader Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jordan B. / Aarav S."
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Classroom PIN</span>
                        <span className="text-[10px] text-cyan-400 lowercase font-mono">default WALLST</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="WALLST"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase tracking-widest font-black focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 transition-all"
                      />
                    </div>
                  </div>

                  {/* Trading Syndicate Selection */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <span>Select Syndicate Desk</span>
                      <span className="text-[11px] text-cyan-400 font-mono font-bold">
                        ₹10,00,000 Total Allocation
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {(Object.keys(DESK_CONFIGS) as StudentDesk[]).map((desk) => {
                        const meta = DESK_METADATA[desk];
                        const cfg = DESK_CONFIGS[desk];
                        const IconComponent = cfg.icon;
                        const isSelected = selectedDesk === desk;

                        return (
                          <div
                            key={desk}
                            onClick={() => setSelectedDesk(desk)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? `${cfg.borderActive} ${cfg.bgActive} shadow-lg`
                                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                            }`}
                          >
                            {/* Header row: Icon, Name, Badge, Checkmark */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center space-x-2.5">
                                <div
                                  className={`p-2 rounded-xl bg-slate-900 border border-slate-700/80 ${cfg.themeColor}`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-extrabold text-white flex items-center gap-2 flex-wrap">
                                    <span>{meta.name}</span>
                                    <span
                                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${cfg.badgeBg} ${cfg.badgeText}`}
                                    >
                                      {cfg.badge}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {cfg.strategyMandate}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right font-mono">
                                  <div className="text-xs font-black text-white">
                                    {cfg.starterCashVal}
                                  </div>
                                  <div className="text-[10px] text-emerald-400 font-bold">
                                    {cfg.cashPercent}% Cash
                                  </div>
                                </div>
                                {isSelected ? (
                                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-700" />
                                )}
                              </div>
                            </div>

                            {/* Two-tone Cash vs Stock Allocation Ratio Bar */}
                            <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                                <span>Allocation: {cfg.cashPercent}% Cash</span>
                                <span>{cfg.stockPercent}% Equities</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                                <div
                                  style={{ width: `${cfg.cashPercent}%` }}
                                  className={
                                    desk === "tech_analyst"
                                      ? "bg-cyan-400"
                                      : desk === "fmcg_consumer"
                                      ? "bg-amber-400"
                                      : desk === "institutional_fii"
                                      ? "bg-emerald-400"
                                      : "bg-purple-400"
                                  }
                                />
                                <div
                                  style={{ width: `${cfg.stockPercent}%` }}
                                  className="bg-slate-700"
                                />
                              </div>
                            </div>

                            {/* Starter Stock Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {cfg.starterPills.map((pill, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-300 font-medium"
                                >
                                  {pill}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enter Trading Floor CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.99] text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-950/60 flex items-center justify-center space-x-2 transition-all uppercase tracking-wider mt-3 group"
                  >
                    <span>Enter Trading Floor (₹10 Lakhs Capital)</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <p className="text-[10px] text-center text-slate-500 font-mono">
                    Zero Risk • Live Double-Auction Engine • Jain University CMS
                  </p>
                </form>
              ) : (
                /* ======================================================= */
                /* VIEW B: FACULTY & CLASSROOM PROJECTOR GATEWAY           */
                /* ======================================================= */
                <div className="space-y-4 relative z-10">
                  {!isUnlocked ? (
                    <form onSubmit={handleVerifyFacultyPin} className="space-y-4">
                      
                      {/* Security Header Banner */}
                      <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl text-center space-y-1">
                        <div className="inline-flex p-2.5 bg-purple-950/60 border border-purple-500/30 rounded-2xl text-purple-400 mb-1">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                          Faculty Command Authorization
                        </h3>
                        <p className="text-xs text-slate-400">
                          Authenticate with the 4-digit facilitator PIN to access room controls.
                        </p>
                      </div>

                      {/* Room Code Confirmation for Faculty */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Active Classroom Room Code
                        </label>
                        <input
                          type="text"
                          required
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          placeholder="WALLST"
                          className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase tracking-widest font-black focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/25 transition-all text-center"
                        />
                      </div>

                      {/* PIN Input */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-center">
                          Enter 4-Digit Facilitator PIN
                        </label>
                        <div className="relative max-w-xs mx-auto">
                          <input
                            type="password"
                            autoFocus
                            required
                            placeholder="••••"
                            value={facultyPin}
                            onChange={(e) => {
                              setFacultyPin(e.target.value);
                              if (pinError) setPinError(false);
                            }}
                            className={`w-full bg-slate-950 border ${
                              pinError
                                ? "border-rose-500 text-rose-300"
                                : "border-slate-700 text-white"
                            } rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-[0.4em] font-black focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all`}
                          />
                          <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {pinError && (
                          <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-bold mt-2 justify-center">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Invalid PIN. Access restricted to faculty.</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/50 transition-all"
                      >
                        Authenticate Facilitator Console
                      </button>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                        <div className="font-bold text-slate-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          <span>Facilitator Permissions:</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                          <li>Start/Pause 5-minute trading rounds</li>
                          <li>Trigger 6 market news catalysts with instant price shifts</li>
                          <li>Projector screen display with student QR join code</li>
                          <li>Audit gradebook & export student CSV performance</li>
                        </ul>
                      </div>

                      <p className="text-[11px] text-center text-slate-500 font-mono">
                        Default classroom facilitator PIN:{" "}
                        <span className="text-slate-300 font-bold">2026</span>
                      </p>
                    </form>
                  ) : (
                    /* UNLOCKED FACULTY GATEWAY */
                    <div className="space-y-3.5">
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Faculty Verified • Room {roomCode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleLockFaculty}
                          className="text-[10px] text-slate-400 hover:text-white underline font-mono font-normal"
                        >
                          Lock Session
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleOpenHost}
                          className="p-4 bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 hover:border-purple-400 rounded-2xl text-left transition-all hover:scale-[1.01] shadow-xl group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-sm font-black text-white">
                                  Teacher Command Center
                                </div>
                                <div className="text-[10px] text-purple-300 font-mono">
                                  /host • Round Controller
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Start/Stop rounds, inject news shocks (RBI, Earnings), spawn 30 AI bots, export gradebook CSV.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenProjector}
                          className="p-4 bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/40 hover:border-amber-400 rounded-2xl text-left transition-all hover:scale-[1.01] shadow-xl group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                                <Presentation className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-sm font-black text-white">
                                  Classroom Floor Projector
                                </div>
                                <div className="text-[10px] text-amber-300 font-mono">
                                  /projector/{roomCode} • Big Screen HUD
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <p className="text-[11px] text-slate-400">
                            High-contrast live projector display with student mobile QR code, live order tape, and podium leaderboard.
                          </p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* INSTITUTIONAL ACCREDITATION FOOTER */}
      <footer className="w-full text-center text-xs text-slate-500 font-mono py-4 border-t border-slate-900 bg-[#070B12]/90 relative z-20 space-y-1">
        <p className="font-semibold text-slate-400">
          Jain (Deemed-to-be University) • Center for Management Studies (CMS), Bengaluru
        </p>
        <p className="text-[10px] text-slate-600">
          Financial Microstructure Simulation Lab • Real-Time Order Matching • Zero Financial Risk • ₹ INR Currency Engine
        </p>
      </footer>
    </main>
  );
}
