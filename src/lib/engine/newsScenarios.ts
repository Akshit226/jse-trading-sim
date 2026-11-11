import { NewsEvent } from "@/types/trading";

export const PRESET_NEWS_SCENARIOS: NewsEvent[] = [
  // ==========================================
  // ROUND 1: Company Financial Performance & EV Growth
  // ==========================================
  {
    id: "r1-tatamotors-ev-surge",
    round: 1,
    title: "Tata Motors Q3 Net Profit Surges +74% on Record EV Sales & JLR Margins",
    description:
      "Tata Motors declared Q3 net profit of ₹7,025 Cr (+74% YoY), driven by strong Range Rover deliveries at Jaguar Land Rover and a dominant 73% share in India's passenger EV market.",
    newspaperBody: [
      "MUMBAI — Tata Motors reported quarterly revenues of ₹1,10,500 Cr (+25% YoY) and EBITDA margins of 14.3%. High-margin Range Rover order books exceed 148,000 units while Nexon and Punch EVs dominated domestic sales.",
      "Trader Mission: Analyze the impact of +74% net profit and debt reduction on TATAMOTORS. Will price surge or face profit-taking?"
    ],
    financialMetrics: {
      revenue: "₹1,10,500 Cr (+25% YoY)",
      operatingProfit: "₹15,800 Cr (EBITDA Margin: 14.3%, +280 bps)",
      netProfit: "₹7,025 Cr (+74% PAT)",
      cashFlowOrDebt: "Free Cash Flow: £620M; Net Debt nearing zero",
      keyAccountingConcept: "Operating Leverage & Net Debt Reduction",
      accountingExplanation:
        "When revenue grows faster than fixed factory costs, operating profit multiplies rapidly. Positive cash flow lets the firm pay down debt and eliminate interest expense.",
    },
    predictionPrompt: "Will +74% PAT growth and EV market dominance push TATAMOTORS higher?",
    affectedAsset: "TATAMOTORS",
    affectedSector: "Automobile & Electric Vehicles",
    affectedCompanies: ["TATAMOTORS"],
    sentiment: "strongly_bullish",
    priceImpact: 0.22, // +22% Reference
    soundCue: "bullish_alert",
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
    title: "Blinkit Achieves Operating Breakeven: Zomato Quick Commerce Topline Doubles",
    description:
      "Zomato announced that subsidiary Blinkit crossed operational breakeven for the first time with order volume doubling to ₹15,300 Cr and operating EBITDA turning positive at +₹125 Cr.",
    newspaperBody: [
      "GURUGRAM — Blinkit order values surged +115% YoY as dark store density reduced fulfillment costs. Zomato generated positive quarterly net profit of ₹253 Cr with zero long-term borrowings.",
      "Trader Mission: Analyze Blinkit crossing breakeven with a negative working capital cycle. How will ZOMATO shares react?"
    ],
    financialMetrics: {
      revenue: "₹15,300 Cr Gross Order Value (+115% YoY)",
      operatingProfit: "Operating EBITDA +₹125 Cr (vs -₹280 Cr loss YoY)",
      netProfit: "Net Profit (PAT): ₹253 Cr",
      cashFlowOrDebt: "Negative Working Capital Float; Zero Debt",
      keyAccountingConcept: "Breakeven Analysis & Working Capital Float",
      accountingExplanation:
        "Crossing breakeven turns every additional delivery into operating profit. Negative working capital means collecting cash from consumers via UPI before paying vendors.",
    },
    predictionPrompt: "Will quick commerce turning profitable trigger a bull run in ZOMATO?",
    affectedAsset: "ZOMATO",
    affectedSector: "Consumer Tech & Quick Commerce",
    affectedCompanies: ["ZOMATO"],
    sentiment: "strongly_bullish",
    priceImpact: 0.19, // +19% Reference
    soundCue: "breaking_news",
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
    title: "RBI Delivers Surprise 50 bps Repo Rate Hike; Bank Margins Under Pressure",
    description:
      "The Reserve Bank of India raised the benchmark Repo Rate by 50 bps to 7.00% to curb persistent inflation, while hiking risk weights on unsecured consumer loans.",
    newspaperBody: [
      "MUMBAI — In an unscheduled policy move, Governor Shaktikanta Das raised repo rates to a 5-year high of 7.00%. Major lenders HDFC Bank and SBI face deposit cost pressures as Fixed Deposit rates reach 7.75%.",
      "Trader Mission: Net Interest Margins (NIM) are projected to compress by 25-35 bps. Predict whether BANKING shares will slump."
    ],
    financialMetrics: {
      revenue: "Net Interest Income (NII) growth slowed to +6.2% YoY",
      operatingProfit: "Net Interest Margin (NIM) compressed from 4.10% to 3.75%",
      netProfit: "Loan loss provisions increased by ₹2,400 Cr across banks",
      cashFlowOrDebt: "Cost of funds jumped +65 bps; CASA ratio dipping",
      keyAccountingConcept: "Net Interest Margin (NIM) Compression",
      accountingExplanation:
        "Net Interest Margin (NIM) is the spread between interest earned on loans and interest paid to depositors. When deposit expenses rise faster than loan yields, NIM and net profit contract.",
    },
    predictionPrompt: "Will rising deposit costs and compressed NIM drag HDFCBANK and SBIN lower?",
    affectedAsset: "BANKING",
    affectedSector: "Banking & Financial Services",
    affectedCompanies: ["HDFCBANK", "SBIN"],
    sentiment: "strongly_bearish",
    priceImpact: -0.14, // -14% Reference
    soundCue: "fed_bell",
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
    title: "Global Enterprise Clients Freeze IT CapEx: Infosys & TCS Trim Guidance",
    description:
      "US and European banking clients froze discretionary IT spending, prompting Infosys and TCS to trim full-year constant-currency revenue growth guidance to 1.5%–3.0%.",
    newspaperBody: [
      "BENGALURU — Discretionary tech consulting and non-essential cloud pilots faced deferrals across North American client boardrooms. Large salaried engineering benches are causing operating margins to slip.",
      "Trader Mission: Analyze the guidance downgrade and margin contraction. Will IT heavyweights INFY and TCS fall?"
    ],
    financialMetrics: {
      revenue: "Full-Year Revenue Guidance lowered to +1.5% to +3.0%",
      operatingProfit: "EBIT Operating Margin contracted -120 bps to 20.8%",
      netProfit: "Quarterly PAT flat at ₹6,106 Cr for Infosys",
      cashFlowOrDebt: "Liquid reserves solid at ₹38,000 Cr; Attrition down",
      keyAccountingConcept: "Discretionary CapEx & Forward Revenue Guidance",
      accountingExplanation:
        "When corporate clients freeze discretionary software projects, IT firms cannot immediately reduce fixed employee costs, lowering capacity utilization and operating margins.",
    },
    predictionPrompt: "Will revenue guidance cuts and bench expenses cause an IT selloff in INFY and TCS?",
    affectedAsset: "IT",
    affectedSector: "Information Technology",
    affectedCompanies: ["INFY", "TCS"],
    sentiment: "bearish",
    priceImpact: -0.12, // -12% Reference
    soundCue: "crash_alert",
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
    title: "US Short-Seller Report Alleges High Debt Leverage in Adani Enterprises",
    description:
      "A forensic research report raised concerns over Adani Enterprises' ₹2,20,000 Cr consolidated debt and interest coverage ratio of 1.8x, triggering heavy market volatility.",
    newspaperBody: [
      "NEW YORK / AHMEDABAD — The report questions debt servicing capacity across ports, power, and airports in a high interest rate environment. Clearing desks raised margin requirements on group equity derivatives.",
      "Trader Mission: Evaluate debt leverage and interest coverage risks. Will ADANIENT withstand the shock or plunge?"
    ],
    financialMetrics: {
      revenue: "Consolidated Turnover: ₹1,38,000 Cr",
      operatingProfit: "EBITDA: ₹14,200 Cr; Interest Coverage at 1.8x",
      netProfit: "PAT impacted by ₹9,500 Cr annual interest bill",
      cashFlowOrDebt: "Gross Debt: ₹2,20,000 Cr; Debt-to-Equity at 2.1x",
      keyAccountingConcept: "Debt-to-Equity Leverage & Interest Coverage",
      accountingExplanation:
        "High leverage magnifies returns in boom times but amplifies solvency risk when borrowing costs rise. Interest Coverage (EBITDA ÷ Interest) under 2.0x indicates potential cash strain.",
    },
    predictionPrompt: "Will balance sheet leverage concerns trigger aggressive selling in ADANIENT?",
    affectedAsset: "ADANIENT",
    affectedSector: "Infrastructure & Energy Transition",
    affectedCompanies: ["ADANIENT"],
    sentiment: "strongly_bearish",
    priceImpact: -0.28, // -28% Reference
    soundCue: "crash_alert",
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
    title: "Reliance Unveils ₹75,000 Cr Green CapEx & Sells 4.8% Jio Stake for ₹42,000 Cr",
    description:
      "Reliance commissioned its Jamnagar solar gigafactory and raised ₹42,000 Cr in debt-free equity by selling a minority stake in Jio Platforms to sovereign wealth funds at $110B valuation.",
    newspaperBody: [
      "MUMBAI — Reliance Industries announced an aggressive ₹75,000 Cr clean energy roadmap. Management funded the capital expenditure entirely through external equity dilution without raising new debt.",
      "Trader Mission: Analyze debt-free CapEx funding and asset monetization. Will RELIANCE rally to fresh highs?"
    ],
    financialMetrics: {
      revenue: "Consolidated Revenue: ₹2,55,000 Cr (All-time high)",
      operatingProfit: "Consolidated EBITDA: ₹44,800 Cr (+17% YoY)",
      netProfit: "Net Profit (PAT): ₹19,870 Cr (+11% YoY)",
      cashFlowOrDebt: "Fresh Equity: ₹42,000 Cr; Net Debt/EBITDA < 0.5x",
      keyAccountingConcept: "Capital Expenditure (CapEx) & Asset Monetization",
      accountingExplanation:
        "CapEx creates productive long-term assets that generate future revenue. Monetizing mature digital subsidiaries funds new ventures without taking expensive bank debt.",
    },
    predictionPrompt: "Will debt-free green energy funding propel RELIANCE upward?",
    affectedAsset: "RELIANCE",
    affectedSector: "Energy, Telecom & Retail",
    affectedCompanies: ["RELIANCE"],
    sentiment: "strongly_bullish",
    priceImpact: 0.18, // +18% Reference
    soundCue: "bullish_alert",
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
    title: "GST Council Proposes Slashing Tax on Hybrid Cars from 28% to 12%",
    description:
      "The GST Council reached consensus to cut GST on strong hybrid vehicles to 12%, directly lowering retail prices by up to ₹2.5 Lakh for Maruti Suzuki's Grand Vitara and Invicto.",
    newspaperBody: [
      "NEW DELHI — The 16 percentage-point tax cut makes hybrid cars significantly cheaper for consumers while protecting manufacturer profit margins. Dealer waiting lists for Maruti hybrids expanded past 150,000 units.",
      "Trader Mission: Maruti has ₹14,000 Cr in cash reserves and zero debt. Predict the stock impact on MARUTI."
    ],
    financialMetrics: {
      revenue: "Quarterly Revenue projected +18% YoY to ₹38,200 Cr",
      operatingProfit: "EBITDA Margin expanding +180 bps to 13.5%",
      netProfit: "Quarterly PAT forecast upgraded to ₹4,200 Cr",
      cashFlowOrDebt: "Zero Debt; Cash Reserves of ₹14,000 Cr",
      keyAccountingConcept: "Indirect Tax Elasticity & Inventory Velocity",
      accountingExplanation:
        "Lower indirect taxes (GST) reduce retail prices for buyers without reducing factory revenue. Faster inventory turnover accelerates Return on Capital Employed (ROCE).",
    },
    predictionPrompt: "Will the 16% GST tax cut ignite heavy buying demand for MARUTI?",
    affectedAsset: "MARUTI",
    affectedSector: "Automobile & Mobility",
    affectedCompanies: ["MARUTI"],
    sentiment: "strongly_bullish",
    priceImpact: 0.21, // +21% Reference
    soundCue: "breaking_news",
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
    title: "FII Tsunami: Foreign Investors Pour Record ₹12,500 Cr as India GDP Hits 7.8%",
    description:
      "Foreign institutional investors injected ₹12,500 Cr in single-day net purchases into bluechip equities following blowout official data showing India's GDP grew by 7.8%.",
    newspaperBody: [
      "MUMBAI — Global asset allocators placed massive non-discretionary basket buy orders across Reliance, HDFC Bank, TCS, Tata Motors, and ITC as sovereign credit rating outlooks improved.",
      "Trader Mission: Massive liquidity is lifting index valuations. Will ALL 10 bluechips surge together?"
    ],
    financialMetrics: {
      revenue: "Broad corporate topline growing +14.2% YoY",
      operatingProfit: "Corporate operating margins at 3-year highs (17.8%)",
      netProfit: "Nifty 50 forward EPS upgraded to ₹980",
      cashFlowOrDebt: "FII Single-Day Inflow: ₹12,500 Cr; Forex: $650B+",
      keyAccountingConcept: "P/E Multiple Expansion (Market Re-rating)",
      accountingExplanation:
        "When massive foreign capital buys into a fast-growing economy, demand outstrips floating share supply, causing stock prices to rise faster than current earnings (P/E multiple expansion).",
    },
    predictionPrompt: "Will record foreign institutional buying lift all 10 bluechips across the board?",
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
    priceImpact: 0.08, // +8% Market-Wide Reference
    soundCue: "bullish_alert",
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
    title: "ITC Approves 1:1 Hotel Demerger & Declares ₹15/Share Special Cash Dividend",
    description:
      "ITC secured final approval to demerge its capital-heavy hotel division (1:1 share ratio) and announced a historic ₹15/share special cash dividend funded entirely from accumulated reserves.",
    newspaperBody: [
      "KOLKATA — Carving out hotels removes 20% of ITC's capital expenditure while retaining 95% of operating profit. ITC's core Return on Capital Employed (ROCE) is projected to jump from 38% to over 54%.",
      "Trader Mission: Evaluate the ₹18,600 Cr dividend payout and ROCE expansion. Will ITC stock surge?"
    ],
    financialMetrics: {
      revenue: "FMCG Core Turnover: ₹72,500 Cr annual run-rate",
      operatingProfit: "Core Operating EBITDA Margin expanding to 36.5%",
      netProfit: "Annual Net Profit (PAT) exceeding ₹20,400 Cr",
      cashFlowOrDebt: "Special Cash Dividend: ₹18,600 Cr from Retained Cash",
      keyAccountingConcept: "Corporate Demerger & ROCE Elevation",
      accountingExplanation:
        "A demerger separates a capital-heavy business into a standalone entity. Freeing the parent company from heavy hotel building costs dramatically raises its Return on Capital Employed (ROCE).",
    },
    predictionPrompt: "Will ROCE jumping to 54% and a ₹15 cash dividend trigger an aggressive rally in ITC?",
    affectedAsset: "ITC",
    affectedSector: "Fast-Moving Consumer Goods & Hospitality",
    affectedCompanies: ["ITC"],
    sentiment: "strongly_bullish",
    priceImpact: 0.24, // +24% Reference
    soundCue: "bullish_alert",
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
    title: "TCS Signs Historic $1.0 Billion Generative AI Deal with European Retailer",
    description:
      "TCS signed a 7-year, $1.0 Billion (₹8,350 Cr) Generative AI transformation contract to deploy proprietary language models across 40,000 smart stores at premium 27.2% EBIT margins.",
    newspaperBody: [
      "MUMBAI — The agreement is the tech industry's largest commercial AI contract to date, providing multi-year revenue visibility and commanding premium hourly billing margins above commoditized IT services.",
      "Trader Mission: Analyze the $1B contract size and premium 27% margins. How will TCS and tech shares trade?"
    ],
    financialMetrics: {
      revenue: "Total Contract Value (TCV): $1.0 Billion (₹8,350 Cr)",
      operatingProfit: "Contract EBIT Margin at 27.2% (Premium rate)",
      netProfit: "Annual EPS contribution estimated at +₹18.50 per share",
      cashFlowOrDebt: "High Cash Flow Conversion; Total Q3 TCV at $11.2B",
      keyAccountingConcept: "Total Contract Value (TCV) & Multi-Year Visibility",
      accountingExplanation:
        "Total Contract Value (TCV) represents aggregate guaranteed revenue over the contract life. High multi-year visibility insulates the firm from economic downturns and supports premium valuations.",
    },
    predictionPrompt: "Will the $1.0 Billion AI transformation deal boost TCS earnings and share price?",
    affectedAsset: "TCS",
    affectedSector: "Information Technology & Enterprise AI",
    affectedCompanies: ["TCS", "INFY"],
    sentiment: "strongly_bullish",
    priceImpact: 0.18, // +18% Reference
    soundCue: "bullish_alert",
    voiceNarration: {
      pitch: 1.04,
      rate: 1.02,
      urgency: "authoritative",
    },
    timestamp: 0,
  },
];
