import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSE — Jain University Stock Exchange Simulation | Classroom Trading Floor",
  description:
    "Institutional-grade real-time market microstructure simulation with live double-auction order matching, macroeconomic news catalysts, and dual Web Pro & Native Mobile terminals for Jain University CMS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070B12] text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
