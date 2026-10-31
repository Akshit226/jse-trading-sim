"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StudentDesk } from "@/types/trading";
import { DESK_METADATA, DEFAULT_TEACHER_PIN } from "@/lib/constants";
import {
  TrendingUp,
  Presentation,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
  Flame,
  Lock,
  KeyRound,
  X,
  AlertTriangle,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [roomCode, setRoomCode] = useState("WALLST");
  const [selectedDesk, setSelectedDesk] = useState<StudentDesk>("tech_analyst");

  // Faculty Gate state
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyPin, setFacultyPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

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

  const handleOpenHost = () => {
    router.push("/host");
  };

  const handleOpenProjector = () => {
    const code = roomCode.trim().toUpperCase() || "WALLST";
    router.push(`/projector/${code}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-2xl shadow-cyan-950/50 border border-slate-700 mb-3.5 transition-transform hover:scale-105">
            <img
              src="/jain-logo.png"
              alt="Jain University Logo"
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome to the <span className="text-cyan-400">JSE</span>
          </h1>
          <p className="text-xs sm:text-sm font-extrabold text-amber-400 tracking-wide mt-1 uppercase">
            Jain University Stock Exchange
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Real-Time Classroom Trading Floor & News Sentiment Engine (₹ INR)
          </p>
        </div>

        {/* Student Join Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md mb-4">
          <div className="flex items-center space-x-2 mb-4">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Join as Student Trader
            </h2>
          </div>

          <form onSubmit={handleJoinStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Your Full Name / Nickname
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan B."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Classroom Room PIN
              </label>
              <input
                type="text"
                required
                placeholder="e.g. WALLST"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono uppercase tracking-widest font-black focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Trading Desk Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Select Your Trading Syndicate
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(DESK_METADATA) as StudentDesk[]).map((desk) => {
                  const meta = DESK_METADATA[desk];
                  const isSelected = selectedDesk === desk;
                  return (
                    <button
                      type="button"
                      key={desk}
                      onClick={() => setSelectedDesk(desk)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-extrabold leading-snug">{meta.name}</div>
                      <div className="text-[10px] opacity-75 line-clamp-1 mt-0.5">
                        {meta.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center space-x-2 transition-all uppercase tracking-wider"
            >
              <span>Enter Trading Floor (₹10 Lakhs)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Faculty & Presenter Discreet Access */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setShowFacultyModal(true);
              setPinError(false);
              setFacultyPin("");
            }}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 px-3 rounded-lg hover:bg-slate-900/60"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500/70" />
            <span>Faculty & Presenter Access</span>
          </button>
        </div>

        {/* Classroom Highlights footer */}
        <div className="mt-6 text-center text-[11px] text-slate-600">
          <p>Designed for 30–35 students • Jain University Stock Exchange (JSE)</p>
        </div>
      </div>

      {/* Faculty Gate Modal */}
      {showFacultyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowFacultyModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="inline-flex p-2.5 bg-purple-950/80 border border-purple-500/30 rounded-2xl text-purple-400 mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">Faculty Authentication</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter teacher PIN to access host controls or classroom projector.
              </p>
            </div>

            {!isUnlocked ? (
              <form onSubmit={handleVerifyFacultyPin} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      required
                      placeholder="Enter 4-digit PIN"
                      value={facultyPin}
                      onChange={(e) => {
                        setFacultyPin(e.target.value);
                        if (pinError) setPinError(false);
                      }}
                      className={`w-full bg-slate-950 border ${
                        pinError ? "border-rose-500 text-rose-300" : "border-slate-700 text-white"
                      } rounded-xl px-4 py-2.5 text-center text-base font-mono tracking-[0.3em] font-black focus:outline-none focus:border-cyan-400`}
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {pinError && (
                    <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-bold mt-2 justify-center">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Invalid PIN. Access denied.</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                >
                  Verify PIN
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300 font-bold">
                  ✓ Faculty PIN Verified
                </div>

                <button
                  onClick={handleOpenHost}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Teacher Command Center</span>
                </button>

                <button
                  onClick={handleOpenProjector}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  <Presentation className="w-4 h-4" />
                  <span>Launch Classroom Projector</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
