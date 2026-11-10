import { NewsEvent } from "@/types/trading";

export const PRESET_NEWS_SCENARIOS: NewsEvent[] = [
  // ==========================================
  // ROUND 1: Company Financial Performance & EV Growth
  // ==========================================
  {
    id: "r1-tatamotors-ev-surge",
    round: 1,
    title: "Tata Motors Q3 Net Profit Surges +74% on Record EV Deliveries & JLR Margin Expansion",
    description:
      "MUMBAI FINANCIAL BUREAU — Automobile giant Tata Motors declared exceptional third-quarter financial results today, reporting a consolidated Net Profit (Profit After Tax) of ₹7,025 Crore, representing a blistering +74% year-on-year surge. The robust performance was propelled by aggressive expansion in operating profit margins at luxury arm Jaguar Land Rover (JLR) and dominant 73% market share in India's passenger Electric Vehicle (EV) segment. Free cash flow generation reached a historic £620 Million, prompting management to announce the company is on track to eliminate net automotive debt ahead of schedule.",
    newspaperBody: [
      "MUMBAI — In a landmark filing to stock exchanges on Dalal Street, Tata Motors reported quarterly consolidated revenues (topline turnover) of ₹1,10,500 Crore, an increase of 25% over the corresponding quarter last year. Operating profit (EBITDA) reached ₹15,800 Crore, with EBITDA margins expanding by 280 basis points to 14.3%, signaling strong operational cost control.",
      "The stellar performance was driven by dual growth engines: Jaguar Land Rover reported record deliveries of high-margin Range Rover models with an order book exceeding 148,000 units, while domestic passenger EV sales (Nexon EV and Punch EV) captured 73% of the Indian electric mobility market. Free cash flow for the quarter stood at £620 Million (approx. ₹6,500 Crore), allowing the group to pare down long-term borrowings significantly.",
      "Equity research analysts at institutional brokerages noted that Tata Motors is demonstrating classic operating leverage—where rising vehicle volumes spread fixed factory depreciation costs across more units, directly expanding the bottom-line net profit margin."
    ],
    financialMetrics: {
      revenue: "₹1,10,500 Cr (+25% YoY Topline)",
      operatingProfit: "₹15,800 Cr (EBITDA Margin: 14.3%, +280 bps)",
      netProfit: "₹7,025 Cr (+74% YoY Profit After Tax)",
      cashFlowOrDebt: "Free Cash Flow: £620M; Net Automotive Debt nearing zero",
      keyAccountingConcept: "Operating Leverage & Net Debt Reduction",
      accountingExplanation:
        "Operating Leverage occurs when revenue grows faster than fixed operating overheads (such as factory rent and equipment depreciation), causing operating profit to multiply. Positive Free Cash Flow provides liquid funds to retire bank debt, reducing interest expenses on future Profit & Loss statements.",
    },
    affectedAsset: "TATAMOTORS",
    affectedSector: "Automobile & Electric Vehicles",
    affectedCompanies: ["TATAMOTORS"],
    sentiment: "strongly_bullish",
    priceImpact: 0.22, // +22%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "tech_analyst",
      rumorText:
        "Channel checks in Coventry & Pune confirm JLR order book at 148,000 units with supply bottlenecks completely resolved. Institutional brokers upgrading target price by +25%.",
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
    title: "Blinkit Achieves Operating Breakeven: Zomato Quick Commerce Topline Doubles with Positive Cash Flow",
    description:
      "GURUGRAM FINANCIAL WIRE — Online consumer platform Zomato Limited stunned equity markets today by announcing that its quick commerce subsidiary, Blinkit, has crossed operational breakeven for the first time. Consolidated Gross Order Value (GOV) leaped +115% year-on-year to ₹15,300 Crore as dark store fulfillment efficiency surged. Operating EBITDA turned positive at +₹125 Crore, reversing a loss of ₹280 Crore in the previous fiscal year, powered by negative working capital cycle float and increasing advertising monetization from consumer brands.",
    newspaperBody: [
      "GURUGRAM — Quick commerce has officially transitioned from a cash-burning experiment to an earnings-generating powerhouse. Zomato's Q2 earnings release revealed that Blinkit's operational contribution margin flipped to +4.2% of order value, driven by high dark store density in tier-1 metro hubs.",
      "The company's working capital dynamics remain exceptionally favorable: because end consumers pay instantly via UPI while suppliers are settled on 30 to 45-day credit terms, Zomato generates a structural negative working capital float. This structural cash float allows the company to fund 100 new automated micro-warehouses entirely out of operational cash flows without raising fresh debt or equity capital.",
      "With traditional food delivery generating ₹900 Crore in steady annual operating profits and quick commerce turning cash-flow positive, analysts are revising their enterprise discounted cash flow (DCF) models, predicting sustained bottom-line profitability for the full fiscal year."
    ],
    financialMetrics: {
      revenue: "₹15,300 Cr Gross Order Value (+115% YoY)",
      operatingProfit: "Operating EBITDA +₹125 Cr (vs -₹280 Cr loss YoY)",
      netProfit: "Net Profit (PAT): ₹253 Cr (Sustained positive bottomline)",
      cashFlowOrDebt: "Negative Working Capital Float; Zero Long-Term Debt",
      keyAccountingConcept: "Breakeven Analysis & Negative Working Capital Float",
      accountingExplanation:
        "The Breakeven Point is the volume of sales where Total Revenue exactly covers Total Costs (Fixed + Variable). Crossing breakeven transforms every additional delivery into pure operating profit. Negative working capital means the firm collects cash from customers before paying its suppliers, providing interest-free operating liquidity.",
    },
    affectedAsset: "ZOMATO",
    affectedSector: "Consumer Tech & Quick Commerce",
    affectedCompanies: ["ZOMATO"],
    sentiment: "strongly_bullish",
    priceImpact: 0.19, // +19%
    soundCue: "breaking_news",
    deskWhisper: {
      desk: "retail_momentum",
      rumorText:
        "Blinkit opening 100 new dark stores this quarter; institutional analysts doubling 12-month forward price-to-sales valuation multiples.",
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
    title: "RBI Delivers Surprise 50 bps Repo Rate Hike; Net Interest Margins Under Pressure as Deposit Costs Surge",
    description:
      "MUMBAI CENTRAL BANK DISPATCH — The Monetary Policy Committee (MPC) of the Reserve Bank of India announced an unscheduled 50-basis-point increase in the benchmark Repo Rate to 7.00% today, citing stubborn headline food and fuel inflation. The central bank also tightened capital reserve requirements on unsecured consumer lending. Banking analysts project immediate Net Interest Margin (NIM) compression for major commercial lenders as competition for retail deposits forces banks to hike term deposit interest expenses while loan growth moderates.",
    newspaperBody: [
      "MUMBAI — Governor Shaktikanta Das announced a hawkish tilt in monetary policy this morning, noting that persistent inflationary pressures require aggressive liquidity absorption. The repo rate now stands at a 5-year peak of 7.00%, raising borrowing benchmarks across the entire economy.",
      "For premier lenders like HDFC Bank and State Bank of India (SBI), the immediate accounting consequence is margin compression. While existing floating-rate loans will reprice upward, fierce inter-bank competition for retail deposits is forcing banks to offer 7.75% on Fixed Deposits (FDs). Because deposit rates rise faster than average lending yields, the banking sector's Net Interest Margin (NIM) is forecast to decline by 25 to 35 basis points over the coming two quarters.",
      "Additionally, the central bank ordered a 25% risk-weight increase on unsecured personal loans and credit cards. Commercial banks will be forced to allocate higher Tier-1 capital reserves against retail credit books, potentially slowing asset growth and elevating quarterly provisioning charges."
    ],
    financialMetrics: {
      revenue: "Net Interest Income (NII) growth slowed to +6.2% YoY",
      operatingProfit: "Net Interest Margin (NIM) compressed from 4.10% to 3.75%",
      netProfit: "Provisions for loan losses raised by ₹2,400 Cr across top lenders",
      cashFlowOrDebt: "Cost of Funds (Deposits) jumped +65 bps; CASA ratio dipping",
      keyAccountingConcept: "Net Interest Margin (NIM) & Credit Cost Provisioning",
      accountingExplanation:
        "Net Interest Margin (NIM) is the core profitability ratio of a commercial bank—measuring the spread between the interest income earned on loans and the interest expense paid to depositors. When deposit expenses rise faster than loan yields, NIM contracts, lowering net profit. Loan loss provisions are expenses set aside on the P&L to cover anticipated borrower defaults.",
    },
    affectedAsset: "BANKING",
    affectedSector: "Banking & Financial Services",
    affectedCompanies: ["HDFCBANK", "SBIN"],
    sentiment: "strongly_bearish",
    priceImpact: -0.14, // -14%
    soundCue: "fed_bell",
    deskWhisper: {
      desk: "institutional_fii",
      rumorText:
        "FII algorithmic baskets triggered heavy institutional liquidation across private and PSU bank constituents. Mutual fund managers re-allocating capital to defensive pharma and consumer staples.",
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
    title: "Global Enterprise Clients Freeze Discretionary IT CapEx: Infosys & TCS Trim Annual Revenue Guidance",
    description:
      "BENGALURU TECH DESK — India's premier Information Technology exporters Infosys and Tata Consultancy Services (TCS) updated their market guidance today, cautioning that top-tier US and European banking clients are freezing discretionary IT capital expenditures amid global macroeconomic headwinds. Management cited prolonged deal conversion cycles and reductions in non-essential consulting contracts. While long-term enterprise transformation pipelines remain steady, constant-currency annual revenue growth projections were trimmed to 1.5%–3.0%, down from previous 4.0%–7.0% targets.",
    newspaperBody: [
      "BENGALURU — Corporate boardrooms across North America and Western Europe are tightening purse strings. Discretionary enterprise technology projects—including custom software consulting, non-essential cloud migrations, and speculative digital experiments—are facing immediate deferral.",
      "The financial impact falls directly on employee utilization and operating margins. Because IT service firms maintain massive salaried engineering workforces (bench strength), any slowdown in client billing hours directly compresses EBIT margins. Infosys reported that operating margins slipped 120 basis points to 20.8%, while TCS reported that client contract signing delays extended average pipeline realization from 90 days to nearly 180 days.",
      "Brokerage downgrades flooded the wires this morning as institutional research desks cut one-year forward earnings-per-share (EPS) estimates by 6% to 9%, reflecting a classic cyclical downturn in corporate software procurement."
    ],
    financialMetrics: {
      revenue: "Full-Year Revenue Guidance revised down to +1.5% to +3.0% CC",
      operatingProfit: "EBIT Operating Margin contracted -120 bps to 20.8%",
      netProfit: "Quarterly Net Profit (PAT) flat at ₹6,106 Cr for Infosys",
      cashFlowOrDebt: "Cash & Liquid Investments robust at ₹38,000 Cr; Attrition down",
      keyAccountingConcept: "Discretionary CapEx vs Revenue Guidance & Capacity Utilization",
      accountingExplanation:
        "Discretionary Capital Expenditure refers to optional, non-urgent investments made by client firms. When clients freeze discretionary contracts, IT firms cannot immediately reduce fixed employee compensation expenses, leading to poor employee utilization and lower operating margins. Revenue Guidance is the official forward forecast of sales provided by corporate management.",
    },
    affectedAsset: "IT",
    affectedSector: "Information Technology",
    affectedCompanies: ["INFY", "TCS"],
    sentiment: "bearish",
    priceImpact: -0.12, // -12%
    soundCue: "crash_alert",
    deskWhisper: {
      desk: "tech_analyst",
      rumorText:
        "Infosys internal memo confirms North American BFSI pipeline conversion rate slowed to 3-year lows. Major US retail bank suspended a $150M cloud migration pilot.",
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
    title: "US Short-Seller Report Alleges Excessive Debt Leverage: Adani Enterprises Confronts Balance Sheet Scrutiny",
    description:
      "AHMEDABAD & NEW YORK — Shares of flagship conglomerate Adani Enterprises plummeted into emergency circuit limiters this morning following the release of an investigative report by a prominent US forensic financial research firm. The publication leveled serious allegations regarding the conglomerate's consolidated debt-to-equity leverage, offshore holding structures, and aggressive accounting valuations across its infrastructure and energy subsidiaries. The report sparked widespread debate among domestic institutional investors and international credit rating agencies concerning balance sheet solvency and debt servicing capacity.",
    newspaperBody: [
      "NEW YORK / AHMEDABAD — A 100-page dossier published before market hours by a Manhattan-based forensic short-seller triggered violent volatility across the Indian capital markets today. The report questions the group's consolidated net debt of approximately ₹2,20,000 Crore, arguing that operating cash flows from ports, airports, and power transmission may face strain under rising global interest rates.",
      "The primary focus of financial analysts centers on the Interest Coverage Ratio—a standard accounting test measuring how easily a company can pay interest on outstanding debt from its Operating Profit (EBITDA). With consolidated interest coverage hovering near 1.8x, any compression in operating earnings or increase in global bond yields could complicate refinancing of short-term commercial paper and foreign currency bonds.",
      "Adani Enterprises issued a vigorous denial, asserting that its operating assets are backed by tangible infrastructure generating steady cash flows, with Debt-to-EBITDA ratios improving from 7.6x to 3.2x over the past decade. Nonetheless, foreign custodian clearing desks raised margin collateral requirements on equity derivative contracts, sending shockwaves through market sentiment."
    ],
    financialMetrics: {
      revenue: "Consolidated Turnover: ₹1,38,000 Cr across diversified businesses",
      operatingProfit: "Consolidated EBITDA: ₹14,200 Cr; Interest Coverage at 1.8x",
      netProfit: "Net Profit (PAT) under pressure from ₹9,500 Cr annual interest expense",
      cashFlowOrDebt: "Consolidated Gross Debt: ₹2,20,000 Cr; Debt-to-Equity at 2.1x",
      keyAccountingConcept: "Debt-to-Equity Leverage & Interest Coverage Ratio",
      accountingExplanation:
        "Debt-to-Equity Ratio measures the degree to which a company finances operations through borrowed funds versus shareholder equity. High leverage magnifies shareholder returns during economic expansions, but heightens solvency risk during downturns. The Interest Coverage Ratio (EBITDA ÷ Interest Expense) reveals whether a company's operating profits are sufficient to cover annual debt interest payments.",
    },
    affectedAsset: "ADANIENT",
    affectedSector: "Infrastructure & Energy Transition",
    affectedCompanies: ["ADANIENT"],
    sentiment: "strongly_bearish",
    priceImpact: -0.28, // -28%
    soundCue: "crash_alert",
    deskWhisper: {
      desk: "institutional_fii",
      rumorText:
        "Global custodian clearing desks raising margin requirements to 100% on Adani Group equity derivatives. Offshore bond trading spreads widened by 450 basis points.",
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
    title: "Reliance Unveils ₹75,000 Cr Green Energy CapEx & Confirms Strategic Stake Sale in Jio at $110B Valuation",
    description:
      "MUMBAI FINANCIAL CAPITAL — India's largest market-capitalization corporate entity, Reliance Industries Limited (RIL), announced a transformative capital expenditure roadmap today. Chairman Mukesh Ambani confirmed commercial commissioning of the Dhirubhai Ambani Green Energy Giga-Complex in Jamnagar, backed by an aggressive ₹75,000 Crore investment in solar photovoltaic cells, green hydrogen electrolyzers, and energy storage batteries. Concurrently, sovereign wealth funds from Abu Dhabi and Singapore agreed to inject ₹42,000 Crore in fresh equity capital into telecom arm Jio Platforms at an equity valuation of $110 Billion ahead of its planned public listing.",
    newspaperBody: [
      "MUMBAI — Reliance Industries delivered a blockbuster twin-announcement that redefines its enterprise balance sheet. The conglomerate is allocating ₹75,000 Crore in capital expenditure (CapEx) toward clean energy transition over the next 24 months, projecting that new energy will match its petrochemicals operating cash flows within five years.",
      "On the financing side, management successfully engineered debt-free funding through asset monetization. By selling a combined 4.8% equity stake in Jio Platforms to global sovereign wealth funds at an enterprise valuation of $110 Billion (approx. ₹9,20,000 Crore), Reliance secured ₹42,000 Crore in upfront liquidity. This massive equity inflow insulates the parent balance sheet from taking on additional bank borrowings.",
      "Market strategists noted that Reliance is demonstrating textbook Balance Sheet Optimization—using external equity dilution in mature digital subsidiaries to finance long-term productive capital assets on the energy side, all while preserving an investment-grade net-cash balance sheet."
    ],
    financialMetrics: {
      revenue: "Consolidated Quarterly Revenue: ₹2,55,000 Cr (All-time high)",
      operatingProfit: "Consolidated EBITDA: ₹44,800 Cr (+17% YoY)",
      netProfit: "Net Profit (PAT): ₹19,870 Cr (+11% YoY)",
      cashFlowOrDebt: "Fresh Equity Inflow: ₹42,000 Cr; Net Debt-to-EBITDA below 0.5x",
      keyAccountingConcept: "Capital Expenditure (CapEx) & Sum-of-the-Parts (SOTP) Valuation",
      accountingExplanation:
        "Capital Expenditure (CapEx) represents funds used by an enterprise to acquire, upgrade, and maintain physical assets such as manufacturing plants and 5G spectrum. CapEx is capitalized on the Balance Sheet and depreciated over its useful life rather than expensed immediately. Sum-of-the-Parts (SOTP) valuation values each diversified subsidiary (Oil, Retail, Telecom, New Energy) independently before combining them.",
    },
    affectedAsset: "RELIANCE",
    affectedSector: "Energy, Telecom & Retail",
    affectedCompanies: ["RELIANCE"],
    sentiment: "strongly_bullish",
    priceImpact: 0.18, // +18%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "fmcg_consumer",
      rumorText:
        "Sovereign wealth fund allocations leaked early; expected institutional block accumulation order arriving at market bell. Retail digital ARPU projected to breach ₹200.",
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
    title: "GST Council Proposes 50% Tax Cut for Strong Hybrids: Maruti Operating Cash Flow & Margins Set to Surge",
    description:
      "NEW DELHI POLICY BUREAU — In a major policy shift announced during the 54th GST Council meeting in New Delhi, the Ministry of Heavy Industries and state finance ministers reached a consensus to slash Goods and Services Tax (GST) on strong hybrid passenger cars from 28% plus compensation cess to a concessional 12%. The landmark fiscal reform directly benefits market leader Maruti Suzuki, which derives a growing proportion of its vehicle order backlog from hybrid models (Grand Vitara and Invicto). Auto sector analysts calculate that the tax reduction will lower consumer sticker prices by ₹1.8 to ₹2.5 Lakh per vehicle while dramatically boosting manufacturer sales realizations and inventory turnover ratios.",
    newspaperBody: [
      "NEW DELHI — The Union Government's long-debated fiscal concession for self-charging hybrid technology has materialized. Under the proposed draft gazette, vehicles equipped with strong hybrid powertrains will enjoy a 16 percentage-point tax reduction, placing them on near-equal footing with pure electric vehicles.",
      "For Maruti Suzuki, the accounting benefits are manifold. The reduction in indirect taxes lowers the retail price for consumers without reducing the company's net ex-factory realization. Dealer booking cancellations have plummeted, with the national waiting list for Maruti's Grand Vitara hybrid expanding past 150,000 units.",
      "Furthermore, Maruti possesses an extraordinary treasury balance sheet—boasting over ₹14,000 Crore in surplus cash reserves and zero long-term debt. With dealership inventory turnover velocity accelerating from 42 days to under 18 days, Maruti's return on capital employed (ROCE) is projected to climb past 22% in the coming fiscal year."
    ],
    financialMetrics: {
      revenue: "Quarterly Revenue projected to expand +18% YoY to ₹38,200 Cr",
      operatingProfit: "EBITDA Margin expected to expand by +180 bps to 13.5%",
      netProfit: "Net Profit (PAT) forecast upgraded to ₹4,200 Cr per quarter",
      cashFlowOrDebt: "Zero Long-Term Debt; Surplus Cash & Liquid Reserves of ₹14,000 Cr",
      keyAccountingConcept: "Indirect Taxation (GST) Impact & Inventory Turnover Ratio",
      accountingExplanation:
        "Indirect Taxes (like GST) are collected by businesses on behalf of the government and do not form part of top-line revenue. When GST rates are cut, consumer retail prices fall while net factory revenues remain protected, boosting unit sales volume. Inventory Turnover Ratio measures how many times inventory is sold and replaced over a period—faster turnover frees up liquid working capital.",
    },
    affectedAsset: "MARUTI",
    affectedSector: "Automobile & Mobility",
    affectedCompanies: ["MARUTI"],
    sentiment: "strongly_bullish",
    priceImpact: 0.21, // +21%
    soundCue: "breaking_news",
    deskWhisper: {
      desk: "retail_momentum",
      rumorText:
        "GST council draft gazette confirmed; Maruti Suzuki dealer inventory cleared out with 6-month waiting lists. Commercial banks reducing car loan interest rates on hybrid models.",
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
    title: "Sovereign Tsunami: Foreign Institutional Investors Pump Record ₹12,500 Cr into Bluechips as GDP Hits 7.8%",
    description:
      "DALAL STREET / MUMBAI — The Indian equities market witnessed its largest single-day institutional liquidity injection on record today, as Foreign Institutional Investors (FIIs) and global sovereign wealth funds poured a net ₹12,500 Crore into frontline index constituents. The buying stampede was triggered by official government data confirming that India's quarterly Gross Domestic Product (GDP) accelerated at a world-beating 7.8%, combined with weightage increases for Indian equities in MSCI and FTSE global emerging market indices. Broad-market valuation multiples expanded sharply as global custody desks executed non-discretionary basket accumulation orders across all 10 bluechip equities.",
    newspaperBody: [
      "MUMBAI — Global asset allocators made an unmistakable statement of confidence on Dalal Street today. Institutional order books recorded massive block purchases across all benchmark constituents—from Reliance Industries and HDFC Bank to TCS, Tata Motors, and ITC.",
      "The macroeconomic catalyst was a blowout GDP reading from the National Statistical Office: Indian GDP expanded by 7.8% year-on-year in the latest quarter, driven by robust manufacturing output, public infrastructure spending, and resilient urban consumption. The sovereign credit rating outlook was concurrently revised upward to 'Positive' by major international rating agencies.",
      "This unprecedented capital influx illustrates the mechanics of Price-to-Earnings (P/E) Multiple Expansion. When vast international capital pools seek exposure to an economy growing at twice the rate of the developed world, institutional buying demand outstrips the supply of available floating shares, bidding up equity valuations across the entire market roster."
    ],
    financialMetrics: {
      revenue: "Market-wide Corporate Topline Growth averaging +14.2% YoY",
      operatingProfit: "Corporate India Operating Margins at 3-year highs of 17.8%",
      netProfit: "Benchmark Nifty 50 EPS expanded to ₹980 forward basis",
      cashFlowOrDebt: "FII Net Inflow: ₹12,500 Cr single-day; Forex Reserves at $650B+",
      keyAccountingConcept: "Price-to-Earnings (P/E) Multiple Expansion & Foreign Capital Flows",
      accountingExplanation:
        "Price-to-Earnings (P/E) Ratio reflects what the market is willing to pay today for each rupee of a company's annual earnings. When foreign institutional liquidity surges into an economy with strong GDP fundamentals, stocks experience 'P/E multiple re-rating'—meaning their market prices rise faster than immediate earnings, reflecting optimistic future cash flow expectations.",
    },
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
        "Custody desks executing non-discretionary index tracking basket buys across all 10 index heavyweights. Over $1.2B in passive ETF mandate inflows clearing by closing bell.",
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
    title: "ITC Finalizes 1:1 Hotel Demerger & Declares Record ₹15/Share Special Cash Dividend from Reserves",
    description:
      "KOLKATA CORPORATE HEADQUARTERS — Consumer goods conglomerate ITC Limited announced formal National Company Law Tribunal (NCLT) approval for the demerger of its luxury hospitality business today. Under the final scheme of arrangement, existing ITC shareholders will receive 1 direct share of ITC Hotels for every 1 share of ITC held. Additionally, the Board of Directors declared a historic Special Cash Dividend of ₹15 per equity share from accumulated retained earnings, representing an extraordinary cash payout of ₹18,600 Crore. Financial analysts noted that removing the capital-intensive hotel division will immediately elevate ITC's Return on Capital Employed (ROCE) from 38% to over 54%.",
    newspaperBody: [
      "KOLKATA — The long-awaited corporate restructuring of FMCG giant ITC has reached its final milestone. By carving out its luxury hotel chain into a separate publicly traded entity, ITC resolves a multi-decade concern among institutional investors regarding capital allocation.",
      "The financial implications for ITC's core business are profoundly positive. The hotel segment accounted for over 20% of ITC's annual capital expenditures but contributed less than 5% of consolidated operating profit (EBITDA). With the hotel balance sheet separated, ITC's core FMCG, tobacco, and agri-business will operate with significantly higher Return on Capital Employed (ROCE) and Return on Equity (ROE).",
      "Furthermore, the ₹15 per share special dividend demonstrates immense balance sheet health. Funded entirely out of accumulated retained earnings and liquid treasury reserves without a single rupee of bank borrowings, the dividend payout offers an attractive cash yield that triggered widespread institutional accumulation and short-covering across market trading desks."
    ],
    financialMetrics: {
      revenue: "Core FMCG & Consumer Turnover: ₹72,500 Cr annual run-rate",
      operatingProfit: "Core Operating EBITDA Margin expanding to 36.5% post-demerger",
      netProfit: "Consolidated Annual Net Profit (PAT) exceeding ₹20,400 Cr",
      cashFlowOrDebt: "Special Cash Dividend Payout: ₹18,600 Cr from Retained Reserves",
      keyAccountingConcept: "Corporate Demerger & Return on Capital Employed (ROCE)",
      accountingExplanation:
        "A Corporate Demerger separates a specific business division into an independent entity, allowing each company to be valued according to its unique industry peers. Return on Capital Employed (ROCE = Operating Profit ÷ Capital Employed) measures how efficiently a company utilizes its total capital to generate profits. Removing asset-heavy, low-margin hotel properties substantially raises ITC's core ROCE.",
    },
    affectedAsset: "ITC",
    affectedSector: "Fast-Moving Consumer Goods & Hospitality",
    affectedCompanies: ["ITC"],
    sentiment: "strongly_bullish",
    priceImpact: 0.24, // +24%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "fmcg_consumer",
      rumorText:
        "Ex-dividend date set for next session; high-yield mutual funds and insurance companies cornering every available offer on the order book. Record date announced.",
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
    title: "TCS Seals Historic $1.0 Billion Generative AI Transformation Contract with European Retail Giant",
    description:
      "MUMBAI / LONDON — Asia's largest technology services corporation, Tata Consultancy Services (TCS), concluded the biggest commercial contract in its corporate history today, signing a landmark 7-year, $1.0 Billion (approx. ₹8,350 Crore) digital foundation and enterprise Generative AI agreement with a European retail conglomerate. The contract encompasses deploying proprietary sovereign AI language models across 40,000 smart store locations, automating supply chain inventory forecasting, and modernizing cloud computing infrastructure. Management guided that the engagement carries premium billing margins, providing exceptional multi-year revenue visibility and boosting full-year operating earnings targets.",
    newspaperBody: [
      "MUMBAI — Defying global macroeconomic slowdown concerns, TCS confirmed the execution of a mega-deal of unprecedented scale. The $1.0 Billion agreement with an unnamed European retail leader represents the single largest enterprise contract awarded for Generative AI implementation in the technology industry to date.",
      "In corporate IT accounting, such contracts are classified as Total Contract Value (TCV). Because the revenue is recognized over a multi-year term under strict service-level agreements (SLAs), it provides high revenue visibility—insulating TCS's earnings forecast from quarterly economic fluctuations.",
      "Moreover, because Generative AI solutions require specialized consulting and proprietary algorithmic architecture rather than commoditized IT maintenance, TCS negotiated premium hourly billing rates. Operating margins for the contract are pegged at 27.2%, well above the company's average EBIT margin of 24.5%, prompting institutional research analysts to issue immediate earnings upgrades."
    ],
    financialMetrics: {
      revenue: "Total Contract Value (TCV): $1.0 Billion (approx. ₹8,350 Cr)",
      operatingProfit: "Contract EBIT Margin at 27.2% (Premium above corporate average)",
      netProfit: "Annual EPS contribution estimated at +₹18.50 per share",
      cashFlowOrDebt: "High Cash Flow Conversion; Total Order Book TCV at $11.2B for the quarter",
      keyAccountingConcept: "Total Contract Value (TCV) & Multi-Year Revenue Visibility",
      accountingExplanation:
        "Total Contract Value (TCV) represents the aggregate revenue an IT services provider expects to earn over the entire duration of a signed client contract. High TCV delivers 'Revenue Visibility', meaning management and investors can reliably predict future cash inflows and operating earnings years in advance, reducing business risk and supporting a premium valuation.",
    },
    affectedAsset: "TCS",
    affectedSector: "Information Technology & Enterprise AI",
    affectedCompanies: ["TCS", "INFY"],
    sentiment: "strongly_bullish",
    priceImpact: 0.18, // +18%
    soundCue: "bullish_alert",
    deskWhisper: {
      desk: "tech_analyst",
      rumorText:
        "CEO live television broadcast confirmed; annual revenue guidance upgraded to double digits for the coming fiscal year. Subcontractor hiring initiated across European delivery centers.",
    },
    voiceNarration: {
      pitch: 1.04,
      rate: 1.02,
      urgency: "authoritative",
    },
    timestamp: 0,
  },
];
