"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentDesk } from "@/types/trading";
import { DEFAULT_TEACHER_PIN, getCompanyFullName, getCompanyIndustry } from "@/lib/constants";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock,
  KeyRound,
  ShieldCheck,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";

interface StockQuote {
  id: string;
  name: string;
  industry: string;
  subSector: string;
  price: string;
  chg: string;
  pos: boolean;
  sector: "IT" | "FMCG";
}

const STOCK_ROSTER: StockQuote[] = [
  {
    id: "MPHASIS",
    name: "Mphasis Limited",
    industry: "Information Technology",
    subSector: "Cloud & Cognitive Solutions",
    price: "₹2,850.00",
    chg: "+1.2%",
    pos: true,
    sector: "IT",
  },
  {
    id: "COFORGE",
    name: "Coforge Limited",
    industry: "Information Technology",
    subSector: "Digital Services & AI Solutions",
    price: "₹7,600.00",
    chg: "+2.4%",
    pos: true,
    sector: "IT",
  },
  {
    id: "OFSS",
    name: "Oracle Financial Services Software Limited",
    industry: "Information Technology",
    subSector: "Core Banking & Fintech",
    price: "₹10,500.00",
    chg: "+0.8%",
    pos: true,
    sector: "IT",
  },
  {
    id: "LTTS",
    name: "L&T Technology Services Limited",
    industry: "Information Technology",
    subSector: "Engineering R&D (ER&D)",
    price: "₹5,200.00",
    chg: "-0.4%",
    pos: false,
    sector: "IT",
  },
  {
    id: "TATAELXSI",
    name: "Tata Elxsi Limited",
    industry: "Information Technology",
    subSector: "Design & Autonomous Systems",
    price: "₹7,100.00",
    chg: "+1.9%",
    pos: true,
    sector: "IT",
  },
  {
    id: "COLPAL",
    name: "Colgate-Palmolive (India) Limited",
    industry: "Fast-Moving Consumer Goods",
    subSector: "Oral Care & Personal Hygiene",
    price: "₹3,100.00",
    chg: "+0.5%",
    pos: true,
    sector: "FMCG",
  },
  {
    id: "PGHH",
    name: "Procter & Gamble Hygiene and Health Care Limited",
    industry: "Fast-Moving Consumer Goods",
    subSector: "Healthcare & Feminine Care",
    price: "₹15,800.00",
    chg: "-1.1%",
    pos: false,
    sector: "FMCG",
  },
  {
    id: "RADICO",
    name: "Radico Khaitan Limited",
    industry: "Fast-Moving Consumer Goods",
    subSector: "Distillery & Premium Spirits",
    price: "₹2,150.00",
    chg: "+3.2%",
    pos: true,
    sector: "FMCG",
  },
  {
    id: "UBL",
    name: "United Breweries Limited",
    industry: "Fast-Moving Consumer Goods",
    subSector: "Brewing & Malt Beverages",
    price: "₹1,950.00",
    chg: "+0.7%",
    pos: true,
    sector: "FMCG",
  },
  {
    id: "GILLETTE",
    name: "Gillette India Limited",
    industry: "Fast-Moving Consumer Goods",
    subSector: "Grooming & Shaving Systems",
    price: "₹8,400.00",
    chg: "+0.3%",
    pos: true,
    sector: "FMCG",
  },
];

interface DeskOption {
  id: StudentDesk;
  name: string;
  focus: string;
  cash: string;
  holdingsSummary: string;
  shares: { ticker: string; count: number }[];
}

const DESK_OPTIONS: DeskOption[] = [
  {
    id: "tech_analyst",
    name: "IT & Tech Analysts",
    focus: "Enterprise cloud, software exporters & high-beta AI",
    cash: "₹6,15,750 Cash",
    holdingsSummary: "70 Total Shares (Mphasis, Coforge, OFSS, LTTS, Tata Elxsi)",
    shares: [
      { ticker: "MPHASIS", count: 25 },
      { ticker: "COFORGE", count: 10 },
      { ticker: "OFSS", count: 5 },
      { ticker: "LTTS", count: 15 },
      { ticker: "TATAELXSI", count: 15 },
    ],
  },
  {
    id: "fmcg_consumer",
    name: "FMCG Consumer Goods",
    focus: "Defensive staples, household brands & margin pricing power",
    cash: "₹5,32,200 Cash",
    holdingsSummary: "136 Total Shares (Colpal, PGHH, Radico, UBL, Gillette)",
    shares: [
      { ticker: "COLPAL", count: 40 },
      { ticker: "PGHH", count: 6 },
      { ticker: "RADICO", count: 45 },
      { ticker: "UBL", count: 35 },
      { ticker: "GILLETTE", count: 10 },
    ],
  },
  {
    id: "institutional_fii",
    name: "Institutional & FII Flow",
    focus: "Multi-sector blue-chip allocation & macro index weighting",
    cash: "₹4,82,800 Cash",
    holdingsSummary: "103 Total Shares across balanced IT and Consumer basket",
    shares: [
      { ticker: "MPHASIS", count: 15 },
      { ticker: "COFORGE", count: 5 },
      { ticker: "OFSS", count: 10 },
      { ticker: "COLPAL", count: 20 },
      { ticker: "RADICO", count: 15 },
      { ticker: "UBL", count: 20 },
    ],
  },
  {
    id: "retail_momentum",
    name: "Retail Momentum & Value",
    focus: "High cash buffer for rapid entry, dips & tactical momentum",
    cash: "₹6,71,500 Cash",
    holdingsSummary: "45 Total Shares + highest liquid reserve",
    shares: [
      { ticker: "MPHASIS", count: 10 },
      { ticker: "COFORGE", count: 5 },
      { ticker: "TATAELXSI", count: 10 },
      { ticker: "RADICO", count: 40 },
      { ticker: "UBL", count: 30 },
    ],
  },
];

export default function HomePage() {
  const router = useRouter();

  // Screen A Splash toggle
  const [showSplash, setShowSplash] = useState(true);

  // Screen B Login State
  const [studentName, setStudentName] = useState("");
  const [roomCode, setRoomCode] = useState("WALLST");
  const [selectedDesk, setSelectedDesk] = useState<StudentDesk>("tech_analyst");
  const [expandedDesk, setExpandedDesk] = useState<StudentDesk | null>(null);

  // Screen C Market Roster filter
  const [sectorFilter, setSectorFilter] = useState<"ALL" | "IT" | "FMCG">("ALL");

  // Faculty Gate
  const [showFacultyGate, setShowFacultyGate] = useState(false);
  const [facultyPin, setFacultyPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isFacultyUnlocked, setIsFacultyUnlocked] = useState(false);

  useEffect(() => {
    // Check faculty session
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("jse_teacher_authorized");
      if (auth === "true") setIsFacultyUnlocked(true);

      // If user already visited in this session, skip splash
      const visited = sessionStorage.getItem("jse_splash_entered");
      if (visited === "true") setShowSplash(false);
    }
  }, []);

  const handleEnterFromSplash = () => {
    sessionStorage.setItem("jse_splash_entered", "true");
    setShowSplash(false);
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
      setIsFacultyUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLockFaculty = () => {
    sessionStorage.removeItem("jse_teacher_authorized");
    setIsFacultyUnlocked(false);
    setFacultyPin("");
  };

  const filteredStocks = STOCK_ROSTER.filter((s) => {
    if (sectorFilter === "ALL") return true;
    return s.sector === sectorFilter;
  });

  // =========================================================================
  // SCREEN A: SPLASH / INTRO (Cinematic Zoom, Minimalist, Single Primary Action)
  // =========================================================================
  if (showSplash) {
    return (
      <main className="min-h-screen bg-app text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
        <div className="max-w-md w-full flex flex-col items-center text-center space-y-6 motion-intro-zoom">
          {/* Centered Crest */}
          <div className="bg-white p-3 rounded-ui shadow-ui flex items-center justify-center">
            <img
              src="/jain-logo.png"
              alt="Jain University Crest"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Title & Single Subtitle */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              JSE Trading Simulator
            </h1>
            <p className="text-sm text-neutralMuted font-normal max-w-sm mx-auto">
              Real-time institutional classroom trading floor with live order matching.
            </p>
          </div>

          {/* Single Primary Action */}
          <button
            type="button"
            onClick={handleEnterFromSplash}
            className="w-full sm:w-auto min-w-[200px] min-h-touch px-6 py-3 bg-accent hover:bg-accent-hover text-white font-bold text-sm rounded-ui shadow-ui motion-btn-press flex items-center justify-center gap-2"
          >
            <span>Enter Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quiet Footer */}
        <div className="absolute bottom-6 text-[11px] text-neutralMuted font-mono">
          Jain (Deemed-to-be University) • CMS Bengaluru
        </div>
      </main>
    );
  }

  // =========================================================================
  // SCREEN B (Login) + SCREEN C (Market Roster)
  // =========================================================================
  return (
    <main className="min-h-screen bg-app text-slate-100 flex flex-col justify-between motion-view-enter">
      {/* Slim, Slower Continuous Ticker Tape */}
      <div className="w-full bg-surface-subtle border-b border-borderSubtle overflow-hidden py-1.5 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
        <div className="animate-slim-ticker space-x-6 text-xs font-mono">
          {[...STOCK_ROSTER, ...STOCK_ROSTER].map((st, idx) => (
            <div key={idx} className="flex items-center space-x-2 shrink-0">
              <span className="font-bold text-white">{st.name}</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface border border-borderSubtle text-neutralMuted">
                {st.id}
              </span>
              <span className="text-[10px] text-accent font-mono">
                {st.industry}
              </span>
              <span className="text-white font-bold tabular-nums">{st.price}</span>
              <span
                className={`text-[11px] font-mono font-bold tabular-nums ${
                  st.pos ? "text-gain" : "text-loss"
                }`}
              >
                {st.chg}
              </span>
              <span className="text-borderSubtle mx-1.5 opacity-40">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================= */}
          {/* SCREEN B: LOGIN & DESK SELECTOR (Lg: 7 cols)            */}
          {/* ======================================================= */}
          <div className="lg:col-span-7">
            <div className="card-surface p-6 sm:p-8 space-y-6">
              
              {/* Header: Title + Role Toggle */}
              <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded-md shrink-0">
                    <img src="/jain-logo.png" alt="Jain Logo" className="h-5 w-auto" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">
                      {showFacultyGate ? "Faculty Console" : "Trader Sign-In"}
                    </h2>
                    <p className="text-xs text-neutralMuted mt-0.5">
                      {showFacultyGate ? "Facilitator controls & projector HUD" : "Enter your trader name and classroom PIN"}
                    </p>
                  </div>
                </div>

                {/* Subdued Switcher Button */}
                <button
                  type="button"
                  onClick={() => setShowFacultyGate(!showFacultyGate)}
                  className="text-xs text-neutralMuted hover:text-white px-2.5 py-1 rounded-ui border border-borderSubtle hover:border-borderStrong transition-colors"
                >
                  {showFacultyGate ? "Student Portal" : "Faculty Login"}
                </button>
              </div>

              {/* VIEW B1: STUDENT LOGIN */}
              {!showFacultyGate ? (
                <form onSubmit={handleJoinStudent} className="space-y-5">
                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutralMuted uppercase tracking-wider mb-1.5">
                        Trader Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jordan B. / Aarav S."
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full min-h-touch bg-surface-subtle border border-borderSubtle focus:border-borderFocus rounded-ui px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutralMuted uppercase tracking-wider mb-1.5 flex justify-between">
                        <span>Classroom PIN</span>
                        <span className="text-[10px] text-neutralMuted lowercase font-mono">default WALLST</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="WALLST"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="w-full min-h-touch bg-surface-subtle border border-borderSubtle focus:border-borderFocus rounded-ui px-3.5 py-2 text-sm text-white font-mono uppercase tracking-widest font-bold focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Single Primary Action Button */}
                  <button
                    type="submit"
                    className="w-full min-h-touch py-3 bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-bold text-sm rounded-ui shadow-ui motion-btn-press flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Enter Trading Floor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* VIEW B2: FACULTY AUTH GATEWAY */
                <div className="space-y-4">
                  {!isFacultyUnlocked ? (
                    <form onSubmit={handleVerifyFacultyPin} className="space-y-4">
                      <div className="p-4 bg-surface-subtle border border-borderSubtle rounded-ui text-center space-y-1">
                        <Lock className="w-5 h-5 text-neutralMuted mx-auto mb-1" />
                        <div className="text-sm font-bold text-white">Faculty Authorization</div>
                        <p className="text-xs text-neutralMuted">
                          Enter facilitator PIN to manage rounds and open projector.
                        </p>
                      </div>

                      <div className="max-w-xs mx-auto">
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
                          className={`w-full min-h-touch bg-surface-subtle border ${
                            pinError ? "border-loss text-loss" : "border-borderSubtle text-white"
                          } focus:border-borderFocus rounded-ui px-4 py-2 text-center text-lg font-mono tracking-widest font-bold focus:outline-none`}
                        />
                        {pinError && (
                          <div className="text-xs text-loss text-center font-bold mt-1.5">
                            Invalid PIN. Access restricted to faculty.
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full min-h-touch py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider rounded-ui motion-btn-press"
                      >
                        Unlock Facilitator Console
                      </button>

                      <p className="text-[11px] text-center text-neutralMuted font-mono">
                        Default classroom PIN: <span className="font-bold text-white">2026</span>
                      </p>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-gain-subtle border border-gain-border rounded-ui flex items-center justify-between text-xs text-gain font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Faculty Verified • Room {roomCode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleLockFaculty}
                          className="text-[11px] text-neutralMuted hover:text-white underline font-mono font-normal"
                        >
                          Lock Session
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => router.push(`/host?room=${roomCode}`)}
                          className="p-4 bg-surface-subtle border border-borderSubtle hover:border-borderStrong rounded-ui text-left motion-btn-press"
                        >
                          <div className="text-xs font-bold text-accent mb-1 font-mono">/host</div>
                          <div className="text-sm font-bold text-white">Teacher Command Center</div>
                          <p className="text-xs text-neutralMuted mt-1">
                            Start/pause rounds, inject news shocks, spawn AI bots, export CSV.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => router.push(`/projector/${roomCode}`)}
                          className="p-4 bg-surface-subtle border border-borderSubtle hover:border-borderStrong rounded-ui text-left motion-btn-press"
                        >
                          <div className="text-xs font-bold text-accent mb-1 font-mono">/projector</div>
                          <div className="text-sm font-bold text-white">Classroom Projector HUD</div>
                          <p className="text-xs text-neutralMuted mt-1">
                            Big-screen live display with student phone QR join code.
                          </p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ======================================================= */}
          {/* SCREEN C: MARKET ROSTER (Lg: 5 cols)                    */}
          {/* ======================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card-surface p-6 space-y-4">
              
              {/* Roster Header + Sector Segmented Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Market Roster (10)
                </span>

                {/* Segmented Filter Toggle (All / IT / FMCG) */}
                <div className="inline-flex bg-surface-subtle p-0.5 rounded-ui border border-borderSubtle text-xs">
                  {(["ALL", "IT", "FMCG"] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSectorFilter(sec)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                        sectorFilter === sec
                          ? "bg-surface text-white shadow-sm"
                          : "text-neutralMuted hover:text-white"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* 10-Stock Row List */}
              <div className="space-y-1.5">
                {filteredStocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="p-3 rounded-ui bg-surface-subtle border border-borderSubtle flex items-center justify-between text-xs hover:border-borderStrong transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-xs sm:text-sm tracking-tight">{stock.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-surface border border-borderSubtle text-neutralMuted shrink-0">
                          {stock.id}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent-subtle text-accent border border-accent/20 shrink-0">
                          {stock.industry}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutralMuted truncate mt-0.5 font-mono">
                        {stock.subSector}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-white tabular-nums text-xs sm:text-sm">
                        {stock.price}
                      </div>
                      <div
                        className={`text-[11px] font-mono font-bold tabular-nums ${
                          stock.pos ? "text-gain" : "text-loss"
                        }`}
                      >
                        {stock.chg}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Quiet Footer */}
      <footer className="w-full text-center text-xs text-neutralMuted font-mono py-4 border-t border-borderSubtle">
        Jain (Deemed-to-be University) • CMS Bengaluru • Microstructure Simulator
      </footer>
    </main>
  );
}
