import { NewsEvent } from "@/types/trading";

export const PRESET_NEWS_SCENARIOS: NewsEvent[] = [
  // ==========================================
  // ROUND 1: Company Financial Performance & Demand/Supply
  // ==========================================
  {
    id: "r1-tataelxsi-earnings",
    round: 1,
    title: "Tata Elxsi Q3 Net Profit Surges +38% on Major Autonomous EV Design Wins",
    description:
      "Company Financial Performance: Automotive engineering deal pipeline accelerates. Tata Elxsi crushes Street estimates with record operating EBITDA margins of 29.5%.",
    affectedAsset: "TATAELXSI",
    sentiment: "strongly_bullish",
    priceImpact: 0.18, // +18%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "tech_analyst",
      rumorText: "Channel checks in Munich confirm Tata Elxsi signed a confidential 5-year software-defined vehicle architecture deal with a German auto major.",
    },
    voiceNarration: {
      pitch: 1.05,
      rate: 1.05,
      urgency: "bullish",
    },
    timestamp: 0,
  },
  {
    id: "r1-fmcg-festive-demand",
    round: 1,
    title: "Festive Demand Surge Triggers Record Supply Shipments for Colpal & Radico Khaitan",
    description:
      "Demand & Supply Shock: Rural off-take and festive consumer spending beat expectations. Premium spirit shipments jump 22% while oral care volumes hit 3-year highs.",
    affectedAsset: "RADICO",
    sentiment: "bullish",
    priceImpact: 0.14, // +14%
    soundCue: "breaking_news",
    deskWhisper: {
      desk: "fmcg_consumer",
      rumorText: "Distributor inventory checks show Magic Moments vodka and premium single malts facing stockouts across northern state warehouses.",
    },
    voiceNarration: {
      pitch: 1.0,
      rate: 1.0,
      urgency: "bullish",
    },
    timestamp: 0,
  },

  // ==========================================
  // ROUND 2: Macro Inflation & Central Bank Interest Rates
  // ==========================================
  {
    id: "r2-inflation-fmcg",
    round: 2,
    title: "Inflation Alert: Palm Oil & Packaging Spikes Compress FMCG Gross Margins",
    description:
      "Inflation Shock: Global agricultural disruptions drive raw material and crude packaging derivatives up 18%. FMCG firms signal near-term gross margin contraction.",
    affectedAsset: "PGHH",
    sentiment: "strongly_bearish",
    priceImpact: -0.14, // -14%
    soundCue: "crash_alert",
    deskWhisper: {
      desk: "fmcg_consumer",
      rumorText: "Management at Procter & Gamble India privately preparing an emergency 6% product price hike to protect EBITDA margins.",
    },
    voiceNarration: {
      pitch: 1.15,
      rate: 1.12,
      urgency: "emergency",
    },
    timestamp: 0,
  },
  {
    id: "r2-rbi-rate-hike",
    round: 2,
    title: "RBI Delivers Surprise 50 bps Repo Rate Hike; High-Growth Tech Valuations Compressed",
    description:
      "Interest Rates & Investor Sentiment: Persistent headline inflation compels the Monetary Policy Committee into aggressive tightening. High-PE midcap IT multiples derate.",
    affectedAsset: "COFORGE",
    sentiment: "strongly_bearish",
    priceImpact: -0.16, // -16%
    soundCue: "fed_bell",
    deskWhisper: {
      desk: "institutional_fii",
      rumorText: "Foreign bond yields spiking; institutional algorithmic desks initiating basket sell orders across midcap IT growth names.",
    },
    voiceNarration: {
      pitch: 1.1,
      rate: 1.08,
      urgency: "emergency",
    },
    timestamp: 0,
  },

  // ==========================================
  // ROUND 3: Global Economic Shocks & Company Management Decisions
  // ==========================================
  {
    id: "r3-global-slowdown",
    round: 3,
    title: "Global Economic Fears: Western Banking Turmoil Freezes Offshore Discretionary IT Spend",
    description:
      "Global Economic Shock: US and European tier-1 investment banks pause discretionary consulting budgets. Capital expenditure delays impact cloud transition providers.",
    affectedAsset: "MPHASIS",
    sentiment: "bearish",
    priceImpact: -0.18, // -18%
    soundCue: "crash_alert",
    deskWhisper: {
      desk: "institutional_fii",
      rumorText: "Top 3 US mortgage client accounts for Mphasis slashing tech subcontracting spend by 25% for upcoming quarters.",
    },
    voiceNarration: {
      pitch: 1.12,
      rate: 1.1,
      urgency: "emergency",
    },
    timestamp: 0,
  },
  {
    id: "r3-coforge-ai-deal",
    round: 3,
    title: "Coforge Seals $400 Million Multi-Year Generative AI Transformation Contract",
    description:
      "Company News & Management Decisions: Coforge announces its largest-ever client win in the travel and hospitality vertical. Order book reaches lifetime high of $1.1 Billion.",
    affectedAsset: "COFORGE",
    sentiment: "strongly_bullish",
    priceImpact: 0.22, // +22%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "tech_analyst",
      rumorText: "CEO interview scheduled for national business television at market close confirming revenue guidance upgrade to +16% CC.",
    },
    voiceNarration: {
      pitch: 1.05,
      rate: 1.05,
      urgency: "bullish",
    },
    timestamp: 0,
  },

  // ==========================================
  // ROUND 4: Government Regulations & Institutional/Foreign Capital Flows
  // ==========================================
  {
    id: "r4-excise-policy",
    round: 4,
    title: "Government Eases State Alco-Bev Excise Duties & Simplifies Retail Licensing",
    description:
      "Government Policies & Regulations: Favorable state excise council decision lowers export surcharges and permits extended micro-brewery retail operating hours.",
    affectedAsset: "UBL",
    sentiment: "strongly_bullish",
    priceImpact: 0.20, // +20%
    soundCue: "breaking_news",
    deskWhisper: {
      desk: "retail_momentum",
      rumorText: "State excise notification gazette leaked early; United Breweries and Radico Khaitan set for immediate direct-to-consumer margin expansion.",
    },
    voiceNarration: {
      pitch: 1.02,
      rate: 1.02,
      urgency: "bullish",
    },
    timestamp: 0,
  },
  {
    id: "r4-fii-mega-inflow",
    round: 4,
    title: "Institutional Inflows: FIIs Pump Record ₹8,200 Crores into Indian Equities in Single Day",
    description:
      "Foreign Capital Flows & Market Liquidity: Massive global allocation rotation into India. Strong sovereign rupee stability prompts foreign funds to aggressively accumulate.",
    affectedAsset: "ALL",
    sentiment: "bullish",
    priceImpact: 0.09, // +9% across board
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "institutional_fii",
      rumorText: "Custody bank flows confirm sovereign wealth funds clearing large block accumulation orders across Nifty IT and FMCG index constituents.",
    },
    voiceNarration: {
      pitch: 1.0,
      rate: 0.98,
      urgency: "authoritative",
    },
    timestamp: 0,
  },

  // ==========================================
  // ROUND 5: Dividend Announcements, Company Valuations & Final Squeeze
  // ==========================================
  {
    id: "r5-ofss-mega-dividend",
    round: 5,
    title: "Oracle Financial Services (OFSS) Declares Record ₹220/Share Special Interim Dividend",
    description:
      "Dividend Announcement: Cash-rich OFSS returns massive surplus treasury cash to shareholders. Dividend yield approaches 8%, sparking ferocious institutional buying.",
    affectedAsset: "OFSS",
    sentiment: "strongly_bullish",
    priceImpact: 0.24, // +24%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "retail_momentum",
      rumorText: "Ex-dividend date set for next week; high-yield income funds cornering all available floating liquidity in OFSS.",
    },
    voiceNarration: {
      pitch: 1.06,
      rate: 1.05,
      urgency: "bullish",
    },
    timestamp: 0,
  },
  {
    id: "r5-brokerage-upgrade",
    round: 5,
    title: "Global Investment Banks Upgrade Gillette & Tata Elxsi on Superior Return on Equity",
    description:
      "Company Valuations & Market Psychology: Analysts cite pricing dominance and debt-free balance sheets. Target prices raised by 30% amidst heavy short covering.",
    affectedAsset: "GILLETTE",
    sentiment: "bullish",
    priceImpact: 0.16, // +16%
    soundCue: "breaking_news",
    deskWhisper: {
      desk: "tech_analyst",
      rumorText: "Institutional research desk upgrading Gillette to 'Conviction Buy' citing complete pass-through of cost pressures.",
    },
    voiceNarration: {
      pitch: 1.0,
      rate: 1.0,
      urgency: "authoritative",
    },
    timestamp: 0,
  },
];
