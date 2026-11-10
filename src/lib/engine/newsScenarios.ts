import { NewsEvent } from "@/types/trading";

export const PRESET_NEWS_SCENARIOS: NewsEvent[] = [
  // ==========================================
  // ROUND 1: Company Financial Performance & EV Growth
  // ==========================================
  {
    id: "r1-tatamotors-ev-surge",
    round: 1,
    title: "Tata Motors Q3 Net Profit Surges +74% on Record EV Sales & JLR Turnaround",
    description:
      "Electric Mobility Boom: Tata Motors reports all-time high quarterly operating profit of ₹7,025 Crore. Nexon EV & Punch EV command 73% Indian EV market share while Jaguar Land Rover free cash flow hits record £620M.",
    affectedAsset: "TATAMOTORS",
    affectedSector: "Automobile & Electric Vehicles",
    affectedCompanies: ["TATAMOTORS"],
    sentiment: "strongly_bullish",
    priceImpact: 0.22, // +22%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "tech_analyst",
      rumorText:
        "Channel checks in Coventry & Pune confirm JLR order book at 148,000 units with supply bottlenecks completely resolved.",
    },
    voiceNarration: {
      pitch: 1.05,
      rate: 1.05,
      urgency: "bullish",
    },
    timestamp: 0,
  },
  {
    id: "r1-zomato-blinkit-profits",
    round: 1,
    title: "Blinkit Achieves Breakeven: Zomato Quick Commerce Revenue Explodes +115% YoY",
    description:
      "10-Minute Retail Revolution: Zomato delivers blowout Q2 results as Blinkit dark store throughput turns cash-flow positive. Quick commerce gross order value eclipses traditional food delivery.",
    affectedAsset: "ZOMATO",
    affectedSector: "Consumer Tech & Quick Commerce",
    affectedCompanies: ["ZOMATO"],
    sentiment: "strongly_bullish",
    priceImpact: 0.19, // +19%
    soundCue: "breaking_news",
    deskWhisper: {
      desk: "retail_momentum",
      rumorText:
        "Blinkit opening 100 new dark stores this quarter; institutional analysts doubling 12-month target multiples.",
    },
    voiceNarration: {
      pitch: 1.02,
      rate: 1.02,
      urgency: "bullish",
    },
    timestamp: 0,
  },

  // ==========================================
  // ROUND 2: Macro Inflation & Central Bank Rate Shocks
  // ==========================================
  {
    id: "r2-rbi-rate-hike-banking",
    round: 2,
    title: "RBI Delivers Surprise 50 bps Repo Rate Hike; Directs Banks to Curb Unsecured Credit",
    description:
      "Monetary Policy Shock: Persistent headline inflation forces the Reserve Bank of India into aggressive monetary tightening. Net interest margins face sharp compression as deposit costs surge.",
    affectedAsset: "BANKING",
    affectedSector: "Banking & Financial Services",
    affectedCompanies: ["HDFCBANK", "SBIN"],
    sentiment: "strongly_bearish",
    priceImpact: -0.14, // -14%
    soundCue: "fed_bell",
    deskWhisper: {
      desk: "institutional_fii",
      rumorText:
        "FII algorithmic baskets triggered heavy institutional liquidation across private and PSU bank constituents.",
    },
    voiceNarration: {
      pitch: 1.12,
      rate: 1.1,
      urgency: "emergency",
    },
    timestamp: 0,
  },
  {
    id: "r2-us-tech-spending-cut",
    round: 2,
    title: "Wall Street Mega-Banks Slash Offshore Tech Budgets: Infosys & TCS Guidance Cut",
    description:
      "Global Tech Spending Freeze: Top tier-1 US banking clients halt discretionary IT consulting contracts amid US recessionary fears. Deal conversions face unprecedented multi-month delays.",
    affectedAsset: "IT",
    affectedSector: "Information Technology",
    affectedCompanies: ["INFY", "TCS"],
    sentiment: "bearish",
    priceImpact: -0.12, // -12%
    soundCue: "crash_alert",
    deskWhisper: {
      desk: "tech_analyst",
      rumorText:
        "Infosys internal memo confirms North American BFSI pipeline conversion rate slowed to 3-year lows.",
    },
    voiceNarration: {
      pitch: 1.15,
      rate: 1.12,
      urgency: "emergency",
    },
    timestamp: 0,
  },

  // ==========================================
  // ROUND 3: Explosive Corporate Reports & Sovereign Mega-Deals
  // ==========================================
  {
    id: "r3-adani-hindenburg-shock",
    round: 3,
    title: "US Short-Seller Report Alleges High Leverage: Adani Enterprises Sinks -28% in Heavy Sell-Off",
    description:
      "Explosive Forensic Report: Overseas short-seller publishes scathing allegations regarding offshore shell entities and debt leverage, triggering emergency circuit filters and massive margin calls.",
    affectedAsset: "ADANIENT",
    affectedSector: "Infrastructure & Energy Transition",
    affectedCompanies: ["ADANIENT"],
    sentiment: "strongly_bearish",
    priceImpact: -0.28, // -28%
    soundCue: "crash_alert",
    deskWhisper: {
      desk: "institutional_fii",
      rumorText:
        "Global custodian clearing desks raising margin requirements to 100% on Adani Group equity derivatives.",
    },
    voiceNarration: {
      pitch: 1.18,
      rate: 1.15,
      urgency: "emergency",
    },
    timestamp: 0,
  },
  {
    id: "r3-reliance-jio-green-energy",
    round: 3,
    title: "Reliance Unveils ₹75,000 Cr Green Energy Gigafactory & Accelerates Historic Jio 5G Mega-IPO",
    description:
      "Conglomerate Transformation: Chairman announces sovereign wealth funds acquiring strategic stakes in Jio Platforms at $110B valuation. Solar giga-manufacturing commences commercial output.",
    affectedAsset: "RELIANCE",
    affectedSector: "Energy, Telecom & Retail",
    affectedCompanies: ["RELIANCE"],
    sentiment: "strongly_bullish",
    priceImpact: 0.18, // +18%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "fmcg_consumer",
      rumorText:
        "Sovereign wealth fund allocations leaked early; expected institutional block accumulation order arriving at market bell.",
    },
    voiceNarration: {
      pitch: 1.05,
      rate: 1.05,
      urgency: "bullish",
    },
    timestamp: 0,
  },

  // ==========================================
  // ROUND 4: Government Regulation & Foreign Capital Inflows
  // ==========================================
  {
    id: "r4-hybrid-gst-concession",
    round: 4,
    title: "Government Proposes Historic 50% GST Reduction for Strong Hybrid Cars; Maruti Rallies",
    description:
      "Union Policy Shift: Ministry of Heavy Industries rewards clean hybrid powertrains over EV-only subsidies. Maruti Suzuki Grand Vitara & Invicto backorders surge past 150,000 units.",
    affectedAsset: "MARUTI",
    affectedSector: "Automobile & Mobility",
    affectedCompanies: ["MARUTI"],
    sentiment: "strongly_bullish",
    priceImpact: 0.21, // +21%
    soundCue: "breaking_news",
    deskWhisper: {
      desk: "retail_momentum",
      rumorText:
        "GST council draft gazette confirmed; Maruti Suzuki dealer inventory cleared out with 6-month waiting lists.",
    },
    voiceNarration: {
      pitch: 1.02,
      rate: 1.02,
      urgency: "bullish",
    },
    timestamp: 0,
  },
  {
    id: "r4-fii-sovereign-inflow",
    round: 4,
    title: "Sovereign Tsunami: Foreign Institutional Investors Pump Record ₹12,500 Cr in Single Day",
    description:
      "Record Liquidity Influx: Global emerging market index upgrades trigger massive institutional capital re-allocation into Indian equities. Frontline bluechip heavyweights aggressively cornered.",
    affectedAsset: "ALL",
    affectedSector: "Broad Market Index (All 10 Bluechips)",
    affectedCompanies: [
      "RELIANCE",
      "TATAMOTORS",
      "TCS",
      "HDFCBANK",
      "INFY",
      "ITC",
      "ZOMATO",
      "ADANIENT",
      "SBIN",
      "MARUTI",
    ],
    sentiment: "strongly_bullish",
    priceImpact: 0.08, // +8% Market-Wide
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "institutional_fii",
      rumorText:
        "Custody desks executing non-discretionary index tracking basket buys across all 10 index heavyweights.",
    },
    voiceNarration: {
      pitch: 1.0,
      rate: 0.98,
      urgency: "authoritative",
    },
    timestamp: 0,
  },

  // ==========================================
  // ROUND 5: Historic Demergers & Mega Deals Squeeze
  // ==========================================
  {
    id: "r5-itc-hotels-demerger-dividend",
    round: 5,
    title: "ITC Board Approves Historic 1:1 Hotel Demerger & Declares Record ₹15/Share Special Cash Dividend",
    description:
      "Value Unlocking Squeeze: Decades-long hotel demerger finalized with independent luxury listing. ITC returns ₹18,500 Crore cash surplus to shareholders, igniting ferocious short covering.",
    affectedAsset: "ITC",
    affectedSector: "Fast-Moving Consumer Goods & Hospitality",
    affectedCompanies: ["ITC"],
    sentiment: "strongly_bullish",
    priceImpact: 0.24, // +24%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "fmcg_consumer",
      rumorText:
        "Ex-dividend date set for next session; high-yield mutual funds cornering every available offer on the book.",
    },
    voiceNarration: {
      pitch: 1.06,
      rate: 1.05,
      urgency: "bullish",
    },
    timestamp: 0,
  },
  {
    id: "r5-tcs-mega-ai-contract",
    round: 5,
    title: "TCS Seals Historic $1 Billion Generative AI Enterprise Contract with European Retail Giant",
    description:
      "Landmark Tech Contract: Asia's largest IT company signs its biggest deal of the decade to build proprietary sovereign AI foundations for 40,000 enterprise retail outlets.",
    affectedAsset: "TCS",
    affectedSector: "Information Technology & Enterprise AI",
    affectedCompanies: ["TCS", "INFY"],
    sentiment: "strongly_bullish",
    priceImpact: 0.18, // +18%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "tech_analyst",
      rumorText:
        "CEO live television broadcast confirmed; revenue guidance upgraded to double digits for the coming fiscal year.",
    },
    voiceNarration: {
      pitch: 1.04,
      rate: 1.02,
      urgency: "authoritative",
    },
    timestamp: 0,
  },
];
