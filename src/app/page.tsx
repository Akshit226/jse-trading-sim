"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentDesk } from "@/types/trading";
import { DEFAULT_TEACHER_PIN, getCompanyFullName, getCompanyIndustry } from "@/lib/constants";
import { loginWithGoogle, logoutGoogle } from "@/lib/firebase";
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
  LogOut,
  Mail,
  UserCheck,
} from "lucide-react";

interface StockQuote {
  id: string;
  name: string;
  industry: string;
  subSector: string;
  price: string;
  chg: string;
  pos: boolean;
  sector: string;
}

const STOCK_ROSTER: StockQuote[] = [
  {
    id: "RELIANCE",
    name: "Reliance Industries Limited",
    industry: "Energy, Telecom & Retail",
    subSector: "Oil-to-Chemicals & Jio 5G Ecosystem",
    price: "₹2,950.00",
    chg: "+1.8%",
    pos: true,
    sector: "ENERGY",
  },
  {
    id: "TATAMOTORS",
    name: "Tata Motors Limited",
    industry: "Automobile & Electric Vehicles",
    subSector: "Passenger EVs, Commercial & JLR",
    price: "₹980.00",
    chg: "+3.4%",
    pos: true,
    sector: "AUTO",
  },
  {
    id: "TCS",
    name: "Tata Consultancy Services Limited",
    industry: "Information Technology",
    subSector: "Global IT Services & Enterprise AI",
    price: "₹4,150.00",
    chg: "+0.9%",
    pos: true,
    sector: "IT",
  },
  {
    id: "HDFCBANK",
    name: "HDFC Bank Limited",
    industry: "Banking & Financial Services",
    subSector: "Private Retail Banking & Corporate Lending",
    price: "₹1,680.00",
    chg: "+0.6%",
    pos: true,
    sector: "BANKING",
  },
  {
    id: "INFY",
    name: "Infosys Limited",
    industry: "Information Technology",
    subSector: "Digital Consulting & Cloud Engineering",
    price: "₹1,850.00",
    chg: "-0.5%",
    pos: false,
    sector: "IT",
  },
  {
    id: "ITC",
    name: "ITC Limited",
    industry: "Fast-Moving Consumer Goods",
    subSector: "Packaged Foods, Cigarettes & Luxury Hotels",
    price: "₹470.00",
    chg: "+1.2%",
    pos: true,
    sector: "FMCG",
  },
  {
    id: "ZOMATO",
    name: "Zomato Limited",
    industry: "Consumer Tech & Quick Commerce",
    subSector: "Food Delivery & 10-Min Blinkit Groceries",
    price: "₹260.00",
    chg: "+4.1%",
    pos: true,
    sector: "CONSUMER_TECH",
  },
  {
    id: "ADANIENT",
    name: "Adani Enterprises Limited",
    industry: "Infrastructure & Energy Transition",
    subSector: "Airports, Green Hydrogen & Solar Infrastructure",
    price: "₹3,100.00",
    chg: "-1.8%",
    pos: false,
    sector: "INFRA",
  },
  {
    id: "SBIN",
    name: "State Bank of India",
    industry: "Banking & Financial Services",
    subSector: "Public Sector Banking & Nation-Building Credit",
    price: "₹820.00",
    chg: "+1.4%",
    pos: true,
    sector: "BANKING",
  },
  {
    id: "MARUTI",
    name: "Maruti Suzuki India Limited",
    industry: "Automobile",
    subSector: "Passenger Cars, SUVs & Strong-Hybrid Mobility",
    price: "₹12,400.00",
    chg: "+0.7%",
    pos: true,
    sector: "AUTO",
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
    name: "Tech & Digital Innovators Desk",
    focus: "Enterprise cloud, software exporters & high-growth digital tech",
    cash: "₹6,14,950 Cash",
    holdingsSummary: "405 Total Shares (TCS, Infosys, Zomato, Tata Motors, Reliance)",
    shares: [
      { ticker: "TCS", count: 30 },
      { ticker: "INFY", count: 50 },
      { ticker: "ZOMATO", count: 250 },
      { ticker: "TATAMOTORS", count: 60 },
      { ticker: "RELIANCE", count: 15 },
    ],
  },
  {
    id: "fmcg_consumer",
    name: "FMCG, Consumer & Auto Desk",
    focus: "Defensive consumer champions, quick commerce & auto mobility",
    cash: "₹5,44,150 Cash",
    holdingsSummary: "695 Total Shares (ITC, Zomato, Maruti, Tata Motors, Reliance)",
    shares: [
      { ticker: "ITC", count: 300 },
      { ticker: "ZOMATO", count: 300 },
      { ticker: "MARUTI", count: 10 },
      { ticker: "TATAMOTORS", count: 70 },
      { ticker: "RELIANCE", count: 15 },
    ],
  },
  {
    id: "institutional_fii",
    name: "Institutional & FII Sovereign Desk",
    focus: "Multi-sector frontline heavyweights & macro sovereign weighting",
    cash: "₹4,28,600 Cash",
    holdingsSummary: "420 Total Shares across balanced Bluechip Index basket",
    shares: [
      { ticker: "RELIANCE", count: 30 },
      { ticker: "HDFCBANK", count: 50 },
      { ticker: "TCS", count: 20 },
      { ticker: "ADANIENT", count: 25 },
      { ticker: "SBIN", count: 80 },
      { ticker: "MARUTI", count: 5 },
    ],
  },
  {
    id: "retail_momentum",
    name: "Retail Momentum & Value Traders",
    focus: "High cash buffer for rapid entry, dips & tactical momentum",
    cash: "₹6,04,700 Cash",
    holdingsSummary: "705 Total Shares across high-beta momentum leaders",
    shares: [
      { ticker: "TATAMOTORS", count: 120 },
      { ticker: "ZOMATO", count: 400 },
      { ticker: "ADANIENT", count: 25 },
      { ticker: "SBIN", count: 60 },
      { ticker: "ITC", count: 100 },
    ],
  },
];

export default function HomePage() {
  const router = useRouter();

  // Screen A Splash toggle
  const [showSplash, setShowSplash] = useState(true);

  // Screen B Login State
  const [roomCode, setRoomCode] = useState("WALLST");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [studentEmailInput, setStudentEmailInput] = useState("");
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    name: string;
    email: string;
    uid: string;
    photoURL?: string;
  } | null>(null);

  // Screen C Market Roster filter
  const [sectorFilter, setSectorFilter] = useState<"ALL" | "IT" | "FMCG">("ALL");

  // Faculty Gate
  const [showFacultyGate, setShowFacultyGate] = useState(false);
  const [facultyPin, setFacultyPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isFacultyUnlocked, setIsFacultyUnlocked] = useState(false);

  useEffect(() => {
    // Check faculty session & cached Google identity
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("jse_teacher_authorized");
      if (auth === "true") setIsFacultyUnlocked(true);

      const visited = sessionStorage.getItem("jse_splash_entered");
      if (visited === "true") setShowSplash(false);

      const cachedName = localStorage.getItem("trading_sim_player_name");
      const cachedEmail = localStorage.getItem("trading_sim_player_email");
      const cachedUid = localStorage.getItem("trading_sim_player_id");
      const cachedPhoto = localStorage.getItem("trading_sim_player_photo");

      if (cachedName && cachedEmail) {
        setAuthenticatedUser({
          name: cachedName,
          email: cachedEmail,
          uid: cachedUid || `std_${Date.now()}`,
          photoURL: cachedPhoto || undefined,
        });
      }
    }
  }, []);

  const handleEnterFromSplash = () => {
    sessionStorage.setItem("jse_splash_entered", "true");
    setShowSplash(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const user = await loginWithGoogle();
      setAuthenticatedUser(user);
      localStorage.setItem("trading_sim_player_name", user.name);
      localStorage.setItem("trading_sim_player_email", user.email);
      localStorage.setItem("trading_sim_player_id", user.uid);
      if (user.photoURL) {
        localStorage.setItem("trading_sim_player_photo", user.photoURL);
      }

      const trimmedCode = (roomCode || "WALLST").trim().toUpperCase();
      const query = new URLSearchParams({
        name: user.name,
        email: user.email,
        uid: user.uid,
      });
      if (user.photoURL) query.set("photo", user.photoURL);
      router.push(`/play/${trimmedCode}?${query.toString()}`);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setGoogleError("Sign-in popup was closed. Please try again.");
      } else if (err.code === "auth/unauthorized-domain") {
        setGoogleError(
          "Vercel domain (jse-trading-sim.vercel.app) needs to be authorized in Firebase Console. You can enter your email below in the meantime."
        );
        setShowEmailFallback(true);
      } else {
        setGoogleError(err.message || "Google sign-in error.");
        setShowEmailFallback(true);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmailInput.trim() || !studentEmailInput.includes("@")) return;

    // Automatically derive verified student name from college email ID!
    const emailClean = studentEmailInput.trim().toLowerCase();
    const localPart = emailClean.split("@")[0];
    const derivedName = localPart
      .replace(/[._\-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const uid = `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    localStorage.setItem("trading_sim_player_name", derivedName);
    localStorage.setItem("trading_sim_player_email", emailClean);
    localStorage.setItem("trading_sim_player_id", uid);

    const trimmedCode = (roomCode || "WALLST").trim().toUpperCase();
    const query = new URLSearchParams({
      name: derivedName,
      email: emailClean,
      uid,
    });
    router.push(`/play/${trimmedCode}?${query.toString()}`);
  };

  const handleEnterAsAuthenticated = () => {
    if (!authenticatedUser) return;
    const trimmedCode = (roomCode || "WALLST").trim().toUpperCase();
    const query = new URLSearchParams({
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      uid: authenticatedUser.uid,
    });
    if (authenticatedUser.photoURL) query.set("photo", authenticatedUser.photoURL);
    router.push(`/play/${trimmedCode}?${query.toString()}`);
  };

  const handleSwitchAccount = async () => {
    await logoutGoogle();
    localStorage.removeItem("trading_sim_player_name");
    localStorage.removeItem("trading_sim_player_email");
    localStorage.removeItem("trading_sim_player_id");
    localStorage.removeItem("trading_sim_player_photo");
    setAuthenticatedUser(null);
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

              {/* VIEW B1: STUDENT GOOGLE AUTH LOGIN */}
              {!showFacultyGate ? (
                <div className="space-y-5">
                  {/* Classroom PIN */}
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

                  {authenticatedUser ? (
                    /* ALREADY AUTHENTICATED VIA GOOGLE */
                    <div className="p-4 bg-surface-subtle border border-accent/40 rounded-ui space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {authenticatedUser.photoURL ? (
                            <img
                              src={authenticatedUser.photoURL}
                              alt={authenticatedUser.name}
                              className="w-9 h-9 rounded-full border border-accent shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent text-accent font-bold flex items-center justify-center shrink-0">
                              {authenticatedUser.name[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{authenticatedUser.name}</span>
                              <CheckCircle2 className="w-4 h-4 text-gain shrink-0" />
                            </div>
                            <div className="text-xs text-neutralMuted truncate font-mono">
                              {authenticatedUser.email}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSwitchAccount}
                          className="text-[11px] text-neutralMuted hover:text-loss flex items-center gap-1 ml-2 transition-colors shrink-0"
                          title="Switch Google Account"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Switch</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleEnterAsAuthenticated}
                        className="w-full min-h-touch py-3 bg-accent hover:bg-accent-hover text-white font-bold text-sm rounded-ui shadow-ui motion-btn-press flex items-center justify-center gap-2"
                      >
                        <span>Enter Trading Floor as {authenticatedUser.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* GOOGLE SIGN IN BUTTON */
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="w-full min-h-touch py-3.5 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-sm rounded-ui shadow-ui motion-btn-press flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>{googleLoading ? "Connecting to Google..." : "Sign in with Google to Enter Floor"}</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-[11px] text-neutralMuted justify-center font-mono">
                        <UserCheck className="w-3.5 h-3.5 text-gain" />
                        <span>Trader identity is verified automatically from your Google account.</span>
                      </div>

                      {googleError && (
                        <div className="p-3 bg-loss-subtle border border-loss-border rounded-ui text-xs text-loss space-y-2">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{googleError}</span>
                          </div>
                          {showEmailFallback && (
                            <form onSubmit={handleEmailIdentitySubmit} className="pt-2 border-t border-loss-border/40 space-y-2">
                              <label className="block text-[11px] text-slate-300">
                                Enter College / University Email:
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="email"
                                  required
                                  placeholder="student.name@jainuniversity.ac.in"
                                  value={studentEmailInput}
                                  onChange={(e) => setStudentEmailInput(e.target.value)}
                                  className="flex-1 bg-surface border border-borderSubtle rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded"
                                >
                                  Join
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                        Faculty Access Protected • Authorized PIN Required
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
