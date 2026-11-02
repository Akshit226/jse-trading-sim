import { Asset, AssetId, StudentDesk } from "@/types/trading";

export const STARTING_CASH = 1000000; // ₹10,00,000 (₹10 Lakhs)
export const DEFAULT_ROUND_DURATION = 240; // 4 minutes per round
export const TOTAL_ROUNDS = 5;
export const DEFAULT_TEACHER_PIN = process.env.NEXT_PUBLIC_TEACHER_PIN || "2026";

/**
 * Formats a number to Indian Rupees with Indian comma separation
 * e.g. 1000000 -> ₹10,00,000.00
 */
export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
}

export interface AssetCompanyInfo {
  ticker: AssetId;
  fullName: string;
  industry: string;
  sector: "IT" | "FMCG";
  subSector: string;
}

export const ASSET_COMPANIES: Record<AssetId, AssetCompanyInfo> = {
  MPHASIS: {
    ticker: "MPHASIS",
    fullName: "Mphasis Limited",
    industry: "Information Technology",
    sector: "IT",
    subSector: "Cloud & Cognitive Solutions",
  },
  COFORGE: {
    ticker: "COFORGE",
    fullName: "Coforge Limited",
    industry: "Information Technology",
    sector: "IT",
    subSector: "Digital Services & AI Solutions",
  },
  OFSS: {
    ticker: "OFSS",
    fullName: "Oracle Financial Services Software Limited",
    industry: "Information Technology",
    sector: "IT",
    subSector: "Core Banking & Fintech",
  },
  LTTS: {
    ticker: "LTTS",
    fullName: "L&T Technology Services Limited",
    industry: "Information Technology",
    sector: "IT",
    subSector: "Engineering R&D (ER&D)",
  },
  TATAELXSI: {
    ticker: "TATAELXSI",
    fullName: "Tata Elxsi Limited",
    industry: "Information Technology",
    sector: "IT",
    subSector: "Design & Autonomous Systems",
  },
  COLPAL: {
    ticker: "COLPAL",
    fullName: "Colgate-Palmolive (India) Limited",
    industry: "Fast-Moving Consumer Goods",
    sector: "FMCG",
    subSector: "Oral Care & Personal Hygiene",
  },
  PGHH: {
    ticker: "PGHH",
    fullName: "Procter & Gamble Hygiene and Health Care Limited",
    industry: "Fast-Moving Consumer Goods",
    sector: "FMCG",
    subSector: "Healthcare & Feminine Care",
  },
  RADICO: {
    ticker: "RADICO",
    fullName: "Radico Khaitan Limited",
    industry: "Fast-Moving Consumer Goods",
    sector: "FMCG",
    subSector: "Distillery & Premium Spirits",
  },
  UBL: {
    ticker: "UBL",
    fullName: "United Breweries Limited",
    industry: "Fast-Moving Consumer Goods",
    sector: "FMCG",
    subSector: "Brewing & Malt Beverages",
  },
  GILLETTE: {
    ticker: "GILLETTE",
    fullName: "Gillette India Limited",
    industry: "Fast-Moving Consumer Goods",
    sector: "FMCG",
    subSector: "Grooming & Shaving Systems",
  },
};

export function getCompanyFullName(assetId: string): string {
  if (assetId in ASSET_COMPANIES) {
    return ASSET_COMPANIES[assetId as AssetId].fullName;
  }
  return assetId;
}

export function getCompanyIndustry(assetId: string): string {
  if (assetId in ASSET_COMPANIES) {
    return ASSET_COMPANIES[assetId as AssetId].industry;
  }
  return "Equities";
}

export function getCompanySubSector(assetId: string): string {
  if (assetId in ASSET_COMPANIES) {
    return ASSET_COMPANIES[assetId as AssetId].subSector;
  }
  return "";
}

export const INITIAL_ASSETS: Record<AssetId, Asset> = {
  MPHASIS: {
    id: "MPHASIS",
    name: "Mphasis Limited",
    category: "IT",
    industry: "Information Technology",
    description: "Cloud computing & cognitive solutions provider with strong BFSI client portfolio.",
    basePrice: 2850.0,
    currentPrice: 2850.0,
    roundOpenPrice: 2850.0,
    previousClosePrice: 2850.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 2850.0 }],
    changePercent: 0.0,
    dayHigh: 2850.0,
    dayLow: 2850.0,
    volume: 0,
  },
  COFORGE: {
    id: "COFORGE",
    name: "Coforge Limited",
    category: "IT",
    industry: "Information Technology",
    description: "High-growth digital services, AI engineering, and enterprise cloud migration specialist.",
    basePrice: 7600.0,
    currentPrice: 7600.0,
    roundOpenPrice: 7600.0,
    previousClosePrice: 7600.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 7600.0 }],
    changePercent: 0.0,
    dayHigh: 7600.0,
    dayLow: 7600.0,
    volume: 0,
  },
  OFSS: {
    id: "OFSS",
    name: "Oracle Financial Services Software Limited",
    category: "IT",
    industry: "Information Technology",
    description: "Cash-rich core banking IT provider, high operating margins & record dividend yield.",
    basePrice: 10500.0,
    currentPrice: 10500.0,
    roundOpenPrice: 10500.0,
    previousClosePrice: 10500.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 10500.0 }],
    changePercent: 0.0,
    dayHigh: 10500.0,
    dayLow: 10500.0,
    volume: 0,
  },
  LTTS: {
    id: "LTTS",
    name: "L&T Technology Services Limited",
    category: "IT",
    industry: "Information Technology",
    description: "Global ER&D engineering services leader across automotive, industrial, and aerospace.",
    basePrice: 5200.0,
    currentPrice: 5200.0,
    roundOpenPrice: 5200.0,
    previousClosePrice: 5200.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 5200.0 }],
    changePercent: 0.0,
    dayHigh: 5200.0,
    dayLow: 5200.0,
    volume: 0,
  },
  TATAELXSI: {
    id: "TATAELXSI",
    name: "Tata Elxsi Limited",
    category: "IT",
    industry: "Information Technology",
    description: "Tata Group premium design & tech firm, high beta, leader in Autonomous EV & GenAI.",
    basePrice: 7100.0,
    currentPrice: 7100.0,
    roundOpenPrice: 7100.0,
    previousClosePrice: 7100.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 7100.0 }],
    changePercent: 0.0,
    dayHigh: 7100.0,
    dayLow: 7100.0,
    volume: 0,
  },
  COLPAL: {
    id: "COLPAL",
    name: "Colgate-Palmolive (India) Limited",
    category: "FMCG",
    industry: "Fast-Moving Consumer Goods",
    description: "Oral care staple with 50%+ market share. Defensive fortress, resilient pricing power.",
    basePrice: 3100.0,
    currentPrice: 3100.0,
    roundOpenPrice: 3100.0,
    previousClosePrice: 3100.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 3100.0 }],
    changePercent: 0.0,
    dayHigh: 3100.0,
    dayLow: 3100.0,
    volume: 0,
  },
  PGHH: {
    id: "PGHH",
    name: "Procter & Gamble Hygiene and Health Care Limited",
    category: "FMCG",
    industry: "Fast-Moving Consumer Goods",
    description: "Premium healthcare and feminine hygiene giant (Whisper, Vicks), low float, steady compounder.",
    basePrice: 15800.0,
    currentPrice: 15800.0,
    roundOpenPrice: 15800.0,
    previousClosePrice: 15800.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 15800.0 }],
    changePercent: 0.0,
    dayHigh: 15800.0,
    dayLow: 15800.0,
    volume: 0,
  },
  RADICO: {
    id: "RADICO",
    name: "Radico Khaitan Limited",
    category: "FMCG",
    industry: "Fast-Moving Consumer Goods",
    description: "Fastest-growing Indian spirits and alco-bev maker (Magic Moments, Rampur), high retail momentum.",
    basePrice: 2150.0,
    currentPrice: 2150.0,
    roundOpenPrice: 2150.0,
    previousClosePrice: 2150.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 2150.0 }],
    changePercent: 0.0,
    dayHigh: 2150.0,
    dayLow: 2150.0,
    volume: 0,
  },
  UBL: {
    id: "UBL",
    name: "United Breweries Limited",
    category: "FMCG",
    industry: "Fast-Moving Consumer Goods",
    description: "Kingfisher brewer, Heineken group subsidiary, summer seasonal demand play.",
    basePrice: 1950.0,
    currentPrice: 1950.0,
    roundOpenPrice: 1950.0,
    previousClosePrice: 1950.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 1950.0 }],
    changePercent: 0.0,
    dayHigh: 1950.0,
    dayLow: 1950.0,
    volume: 0,
  },
  GILLETTE: {
    id: "GILLETTE",
    name: "Gillette India Limited",
    category: "FMCG",
    industry: "Fast-Moving Consumer Goods",
    description: "Dominant razor & shaving care franchise, debt-free, predictable FMCG cash conversion.",
    basePrice: 8400.0,
    currentPrice: 8400.0,
    roundOpenPrice: 8400.0,
    previousClosePrice: 8400.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 8400.0 }],
    changePercent: 0.0,
    dayHigh: 8400.0,
    dayLow: 8400.0,
    volume: 0,
  },
};

export const DESK_METADATA: Record<
  StudentDesk,
  { name: string; icon: string; badgeColor: string; description: string }
> = {
  tech_analyst: {
    name: "IT & Tech Analysts",
    icon: "Cpu",
    badgeColor: "bg-blue-600/30 text-blue-400 border-blue-500/50",
    description: "Specializes in Mphasis, Coforge, Tata Elxsi, OFSS, and LTTS. Receives confidential deal pipeline whispers.",
  },
  fmcg_consumer: {
    name: "FMCG & Consumer Goods Desk",
    icon: "ShoppingBag",
    badgeColor: "bg-amber-600/30 text-amber-400 border-amber-500/50",
    description: "Monitors Colpal, PGHH, Radico, UBL, and Gillette. Tracks raw material inflation and festive demand prints.",
  },
  institutional_fii: {
    name: "Institutional & FII Flow Desk",
    icon: "Landmark",
    badgeColor: "bg-emerald-600/30 text-emerald-400 border-emerald-500/50",
    description: "Tracks RBI interest rates, macro inflation reports, and foreign institutional block purchases.",
  },
  retail_momentum: {
    name: "Retail Momentum & Value Traders",
    icon: "Zap",
    badgeColor: "bg-purple-600/30 text-purple-400 border-purple-500/50",
    description: "Higher liquid cash buffer, rapid 1-click execution, special dividend capture & breakout momentum.",
  },
};

/**
 * Asymmetric Initial Portfolios:
 * Each desk receives an initial allocation tailored to its mandate.
 * All desks are strictly normalized to exactly ₹10,00,000.00 starting Net Worth.
 */
export const DESK_STARTING_PORTFOLIOS: Record<
  StudentDesk,
  { cash: number; shares: Record<AssetId, number> }
> = {
  tech_analyst: {
    // 25*2850 (71250) + 10*7600 (76000) + 5*10500 (52500) + 15*5200 (78000) + 15*7100 (106500) = ₹3,84,250
    // Cash = 10,00,000 - 3,84,250 = ₹6,15,750
    cash: 615750,
    shares: {
      MPHASIS: 25,
      COFORGE: 10,
      OFSS: 5,
      LTTS: 15,
      TATAELXSI: 15,
      COLPAL: 0,
      PGHH: 0,
      RADICO: 0,
      UBL: 0,
      GILLETTE: 0,
    },
  },
  fmcg_consumer: {
    // 40*3100 (124000) + 6*15800 (94800) + 45*2150 (96750) + 35*1950 (68250) + 10*8400 (84000) = ₹4,67,800
    // Cash = 10,00,000 - 4,67,800 = ₹5,32,200
    cash: 532200,
    shares: {
      MPHASIS: 0,
      COFORGE: 0,
      OFSS: 0,
      LTTS: 0,
      TATAELXSI: 0,
      COLPAL: 40,
      PGHH: 6,
      RADICO: 45,
      UBL: 35,
      GILLETTE: 10,
    },
  },
  institutional_fii: {
    // 15*2850 (42750) + 5*7600 (38000) + 10*10500 (105000) + 10*5200 (52000) + 8*7100 (56800) +
    // 20*3100 (62000) + 3*15800 (47400) + 15*2150 (32250) + 20*1950 (39000) + 5*8400 (42000) = ₹5,17,200
    // Cash = 10,00,000 - 5,17,200 = ₹4,82,800
    cash: 482800,
    shares: {
      MPHASIS: 15,
      COFORGE: 5,
      OFSS: 10,
      LTTS: 10,
      TATAELXSI: 8,
      COLPAL: 20,
      PGHH: 3,
      RADICO: 15,
      UBL: 20,
      GILLETTE: 5,
    },
  },
  retail_momentum: {
    // 10*2850 (28500) + 5*7600 (38000) + 10*7100 (71000) + 15*3100 (46500) + 40*2150 (86000) + 30*1950 (58500) = ₹3,28,500
    // Cash = 10,00,000 - 3,28,500 = ₹6,71,500
    cash: 671500,
    shares: {
      MPHASIS: 10,
      COFORGE: 5,
      OFSS: 0,
      LTTS: 0,
      TATAELXSI: 10,
      COLPAL: 15,
      PGHH: 0,
      RADICO: 40,
      UBL: 30,
      GILLETTE: 0,
    },
  },
};
