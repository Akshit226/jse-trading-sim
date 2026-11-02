import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JSE — Jain University Stock Exchange Simulation",
  description:
    "Institutional market simulation with live double-auction order matching, macroeconomic news catalysts, and Web Pro & Mobile terminals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-app text-slate-100 min-h-screen antialiased selection:bg-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}
