export type AssetId =
  | "MPHASIS"
  | "COFORGE"
  | "OFSS"
  | "LTTS"
  | "TATAELXSI"
  | "COLPAL"
  | "PGHH"
  | "RADICO"
  | "UBL"
  | "GILLETTE";

export type StudentDesk =
  | "tech_analyst"
  | "fmcg_consumer"
  | "institutional_fii"
  | "retail_momentum";

export type NewsSentiment =
  | "strongly_bullish"
  | "bullish"
  | "neutral"
  | "bearish"
  | "strongly_bearish";

export interface Asset {
  id: AssetId;
  name: string;
  category: "IT" | "FMCG";
  industry?: string;
  description: string;
  currentPrice: number;
  basePrice: number;
  roundOpenPrice: number;
  previousClosePrice: number;
  historicalPrices: { time: number; price: number }[];
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
}

export interface NewsEvent {
  id: string;
  title: string;
  description: string;
  affectedAsset: AssetId | "ALL" | "IT" | "FMCG";
  sentiment: NewsSentiment;
  priceImpact: number; // percentage shift e.g. +0.20 (+20%) or -0.30 (-30%)
  soundCue: "breaking_news" | "crash_alert" | "bullish_alert" | "fed_bell";
  deskWhisper?: {
    desk: StudentDesk;
    rumorText: string;
  };
  voiceNarration?: {
    pitch?: number;
    rate?: number;
    urgency?: "emergency" | "bullish" | "authoritative";
  };
  timestamp: number;
  round: number;
}

export interface TradeOrder {
  id: string;
  playerId: string;
  playerName: string;
  desk: StudentDesk;
  assetId: AssetId;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  timestamp: number;
  total: number;
}

export interface PlayerPortfolio {
  id: string;
  name: string;
  desk: StudentDesk;
  cash: number;
  shares: Record<AssetId, number>;
  totalNetWorth: number;
  initialNetWorth: number;
  returnPercent: number;
  totalTrades: number;
  realizedPnL: number;
  rank: number;
  lastActive: number;
}

export interface RoomState {
  code: string;
  status: "LOBBY" | "ACTIVE" | "PAUSED" | "ENDED";
  currentRound: number;
  totalRounds: number;
  roundTimeRemaining: number;
  roundDurationSec: number;
  currentNews: NewsEvent | null;
  newsHistory: NewsEvent[];
  recentTrades: TradeOrder[];
  assets: Record<AssetId, Asset>;
  players: Record<string, PlayerPortfolio>;
}
