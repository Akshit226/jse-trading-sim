import { Asset, AssetCategory, AssetId, StudentDesk } from "@/types/trading";

export const STARTING_CASH = 1000000; // ₹10,00,000 (₹10 Lakhs)
export const DEFAULT_ROUND_DURATION = 240; // 4 minutes per round
export const TOTAL_ROUNDS = 5;
export const DEFAULT_TEACHER_PIN = "8797";

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
  sector: AssetCategory;
  subSector: string;
  brandHighlight: string;
}

export const ASSET_COMPANIES: Record<AssetId, AssetCompanyInfo> = {
  RELIANCE: {
    ticker: "RELIANCE",
    fullName: "Reliance Industries Limited",
    industry: "Energy, Telecom & Retail",
    sector: "ENERGY",
    subSector: "Oil-to-Chemicals & Jio 5G Ecosystem",
    brandHighlight: "Jio • Reliance Retail • Jamnagar Refinery",
  },
  TATAMOTORS: {
    ticker: "TATAMOTORS",
    fullName: "Tata Motors Limited",
    industry: "Automobile & Electric Vehicles",
    sector: "AUTO",
    subSector: "Passenger EVs, Commercial Vehicles & JLR",
    brandHighlight: "Nexon EV • Harrier • Jaguar Land Rover",
  },
  TCS: {
    ticker: "TCS",
    fullName: "Tata Consultancy Services Limited",
    industry: "Information Technology",
    sector: "IT",
    subSector: "Global IT Services & Enterprise AI",
    brandHighlight: "BaNCS • Ignio • Enterprise Cloud",
  },
  HDFCBANK: {
    ticker: "HDFCBANK",
    fullName: "HDFC Bank Limited",
    industry: "Banking & Financial Services",
    sector: "BANKING",
    subSector: "Private Retail Banking & Corporate Lending",
    brandHighlight: "SmartBuy • PayZapp • HDFC Home Loans",
  },
  INFY: {
    ticker: "INFY",
    fullName: "Infosys Limited",
    industry: "Information Technology",
    sector: "IT",
    subSector: "Digital Consulting & Cloud Engineering",
    brandHighlight: "Topaz GenAI • Cobalt Cloud • Finacle",
  },
  ITC: {
    ticker: "ITC",
    fullName: "ITC Limited",
    industry: "Fast-Moving Consumer Goods",
    sector: "FMCG",
    subSector: "Packaged Foods, Cigarettes & Luxury Hotels",
    brandHighlight: "Aashirvaad • Sunfeast • ITC Hotels • Bingo",
  },
  ZOMATO: {
    ticker: "ZOMATO",
    fullName: "Zomato Limited",
    industry: "Consumer Tech & Quick Commerce",
    sector: "CONSUMER_TECH",
    subSector: "Food Delivery & 10-Minute Blinkit Groceries",
    brandHighlight: "Blinkit Quick Commerce • Zomato Gold • Hyperpure",
  },
  ADANIENT: {
    ticker: "ADANIENT",
    fullName: "Adani Enterprises Limited",
    industry: "Infrastructure & Energy Transition",
    sector: "INFRA",
    subSector: "Airports, Green Hydrogen & Solar Infrastructure",
    brandHighlight: "Adani Airports • Khavda Green Energy • Mining",
  },
  SBIN: {
    ticker: "SBIN",
    fullName: "State Bank of India",
    industry: "Banking & Financial Services",
    sector: "BANKING",
    subSector: "Public Sector Banking & Nation-Building Credit",
    brandHighlight: "YONO App • Sovereign Branch Network • Retail Loans",
  },
  MARUTI: {
    ticker: "MARUTI",
    fullName: "Maruti Suzuki India Limited",
    industry: "Automobile",
    sector: "AUTO",
    subSector: "Passenger Cars, SUVs & Strong-Hybrid Mobility",
    brandHighlight: "Grand Vitara Hybrid • Swift • Brezza • Nexa",
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

export function getCompanyBrandHighlight(assetId: string): string {
  if (assetId in ASSET_COMPANIES) {
    return ASSET_COMPANIES[assetId as AssetId].brandHighlight;
  }
  return "";
}

export const INITIAL_ASSETS: Record<AssetId, Asset> = {
  RELIANCE: {
    id: "RELIANCE",
    name: "Reliance Industries Limited",
    category: "ENERGY",
    industry: "Energy, Telecom & Retail",
    description: "India's premier conglomerate spanning oil-to-chemicals, Jio 5G digital ecosystem, and retail market leadership.",
    basePrice: 2950.0,
    currentPrice: 2950.0,
    roundOpenPrice: 2950.0,
    previousClosePrice: 2950.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 2950.0 }],
    changePercent: 0.0,
    dayHigh: 2950.0,
    dayLow: 2950.0,
    volume: 0,
  },
  TATAMOTORS: {
    id: "TATAMOTORS",
    name: "Tata Motors Limited",
    category: "AUTO",
    industry: "Automobile & Electric Vehicles",
    description: "Pioneer in Indian Electric Mobility (Nexon EV, Punch EV) and owner of British luxury marquee Jaguar Land Rover.",
    basePrice: 980.0,
    currentPrice: 980.0,
    roundOpenPrice: 980.0,
    previousClosePrice: 980.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 980.0 }],
    changePercent: 0.0,
    dayHigh: 980.0,
    dayLow: 980.0,
    volume: 0,
  },
  TCS: {
    id: "TCS",
    name: "Tata Consultancy Services Limited",
    category: "IT",
    industry: "Information Technology",
    description: "Asia's largest IT powerhouse with $29B+ revenues, fortress balance sheet, and top-tier global AI partnership roster.",
    basePrice: 4150.0,
    currentPrice: 4150.0,
    roundOpenPrice: 4150.0,
    previousClosePrice: 4150.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 4150.0 }],
    changePercent: 0.0,
    dayHigh: 4150.0,
    dayLow: 4150.0,
    volume: 0,
  },
  HDFCBANK: {
    id: "HDFCBANK",
    name: "HDFC Bank Limited",
    category: "BANKING",
    industry: "Banking & Financial Services",
    description: "India's largest private lender post mega-merger, commanding high CASA deposits and low retail credit default rates.",
    basePrice: 1680.0,
    currentPrice: 1680.0,
    roundOpenPrice: 1680.0,
    previousClosePrice: 1680.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 1680.0 }],
    changePercent: 0.0,
    dayHigh: 1680.0,
    dayLow: 1680.0,
    volume: 0,
  },
  INFY: {
    id: "INFY",
    name: "Infosys Limited",
    category: "IT",
    industry: "Information Technology",
    description: "Global software consulting bellwether, leading in digital core enterprise migration and Topaz AI platforms.",
    basePrice: 1850.0,
    currentPrice: 1850.0,
    roundOpenPrice: 1850.0,
    previousClosePrice: 1850.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 1850.0 }],
    changePercent: 0.0,
    dayHigh: 1850.0,
    dayLow: 1850.0,
    volume: 0,
  },
  ITC: {
    id: "ITC",
    name: "ITC Limited",
    category: "FMCG",
    industry: "Fast-Moving Consumer Goods",
    description: "Defensive consumer fortress with high cash dividend yields, commanding 75%+ cigarette share and booming packaged foods.",
    basePrice: 470.0,
    currentPrice: 470.0,
    roundOpenPrice: 470.0,
    previousClosePrice: 470.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 470.0 }],
    changePercent: 0.0,
    dayHigh: 470.0,
    dayLow: 470.0,
    volume: 0,
  },
  ZOMATO: {
    id: "ZOMATO",
    name: "Zomato Limited",
    category: "CONSUMER_TECH",
    industry: "Consumer Tech & Quick Commerce",
    description: "High-growth consumer internet champion; Blinkit 10-minute grocery delivery driving explosive top-line revenue expansion.",
    basePrice: 260.0,
    currentPrice: 260.0,
    roundOpenPrice: 260.0,
    previousClosePrice: 260.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 260.0 }],
    changePercent: 0.0,
    dayHigh: 260.0,
    dayLow: 260.0,
    volume: 0,
  },
  ADANIENT: {
    id: "ADANIENT",
    name: "Adani Enterprises Limited",
    category: "INFRA",
    industry: "Infrastructure & Energy Transition",
    description: "Flagship incubator of the Adani Group, operating major national airports, solar giga-plants, and expressways.",
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
  SBIN: {
    id: "SBIN",
    name: "State Bank of India",
    category: "BANKING",
    industry: "Banking & Financial Services",
    description: "India's largest public sector lender, backbone of sovereign credit, delivering record corporate and retail loan book growth.",
    basePrice: 820.0,
    currentPrice: 820.0,
    roundOpenPrice: 820.0,
    previousClosePrice: 820.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 820.0 }],
    changePercent: 0.0,
    dayHigh: 820.0,
    dayLow: 820.0,
    volume: 0,
  },
  MARUTI: {
    id: "MARUTI",
    name: "Maruti Suzuki India Limited",
    category: "AUTO",
    industry: "Automobile",
    description: "Market king of Indian passenger cars with 40%+ market share, aggressive transition toward strong-hybrid and CNG platforms.",
    basePrice: 12400.0,
    currentPrice: 12400.0,
    roundOpenPrice: 12400.0,
    previousClosePrice: 12400.0,
    historicalPrices: [{ time: Date.now() - 60000, price: 12400.0 }],
    changePercent: 0.0,
    dayHigh: 12400.0,
    dayLow: 12400.0,
    volume: 0,
  },
};

export const DESK_METADATA: Record<
  StudentDesk,
  { name: string; icon: string; badgeColor: string; description: string }
> = {
  tech_analyst: {
    name: "Tech & Digital Innovators Desk",
    icon: "Cpu",
    badgeColor: "bg-blue-600/30 text-blue-400 border-blue-500/50",
    description: "Specializes in TCS, Infosys, Zomato, and Tata Motors EV tech. Receives confidential deal pipeline whispers.",
  },
  fmcg_consumer: {
    name: "FMCG, Consumer & Auto Desk",
    icon: "ShoppingBag",
    badgeColor: "bg-amber-600/30 text-amber-400 border-amber-500/50",
    description: "Monitors ITC, Zomato Quick Commerce, Maruti Suzuki, and Reliance Retail. Tracks consumer demand and raw material inflation.",
  },
  institutional_fii: {
    name: "Institutional & FII Sovereign Desk",
    icon: "Landmark",
    badgeColor: "bg-emerald-600/30 text-emerald-400 border-emerald-500/50",
    description: "Tracks RBI interest rates, Reliance, HDFC Bank, Adani, SBI, and sovereign foreign capital flows.",
  },
  retail_momentum: {
    name: "Retail Momentum & Value Traders",
    icon: "Zap",
    badgeColor: "bg-purple-600/30 text-purple-400 border-purple-500/50",
    description: "High liquid cash buffer, rapid execution, riding breakout momentum in Tata Motors, Adani, Zomato, and ITC.",
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
    // 30*4150 (124500) + 50*1850 (92500) + 250*260 (65000) + 60*980 (58800) + 15*2950 (44250) = ₹3,85,050
    // Cash = 10,00,000 - 3,85,050 = ₹6,14,950
    cash: 614950,
    shares: {
      RELIANCE: 15,
      TATAMOTORS: 60,
      TCS: 30,
      HDFCBANK: 0,
      INFY: 50,
      ITC: 0,
      ZOMATO: 250,
      ADANIENT: 0,
      SBIN: 0,
      MARUTI: 0,
    },
  },
  fmcg_consumer: {
    // 300*470 (141000) + 300*260 (78000) + 10*12400 (124000) + 70*980 (68600) + 15*2950 (44250) = ₹4,55,850
    // Cash = 10,00,000 - 4,55,850 = ₹5,44,150
    cash: 544150,
    shares: {
      RELIANCE: 15,
      TATAMOTORS: 70,
      TCS: 0,
      HDFCBANK: 0,
      INFY: 0,
      ITC: 300,
      ZOMATO: 300,
      ADANIENT: 0,
      SBIN: 0,
      MARUTI: 10,
    },
  },
  institutional_fii: {
    // 30*2950 (88500) + 50*1680 (84000) + 20*4150 (83000) + 25*3100 (77500) + 80*820 (65600) +
    // 5*12400 (62000) + 20*1850 (37000) + 60*470 (28200) + 20*980 (19600) + 100*260 (26000) = ₹5,71,400
    // Cash = 10,00,000 - 5,71,400 = ₹4,28,600
    cash: 428600,
    shares: {
      RELIANCE: 30,
      TATAMOTORS: 20,
      TCS: 20,
      HDFCBANK: 50,
      INFY: 20,
      ITC: 60,
      ZOMATO: 100,
      ADANIENT: 25,
      SBIN: 80,
      MARUTI: 5,
    },
  },
  retail_momentum: {
    // 120*980 (117600) + 400*260 (104000) + 25*3100 (77500) + 60*820 (49200) + 100*470 (47000) = ₹3,95,300
    // Cash = 10,00,000 - 3,95,300 = ₹6,04,700
    cash: 604700,
    shares: {
      RELIANCE: 0,
      TATAMOTORS: 120,
      TCS: 0,
      HDFCBANK: 0,
      INFY: 0,
      ITC: 100,
      ZOMATO: 400,
      ADANIENT: 25,
      SBIN: 60,
      MARUTI: 0,
    },
  },
};
