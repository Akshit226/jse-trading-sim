import sys
import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# 16:9 Widescreen dimensions
SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)

# Color Palette
BG_COLOR = RGBColor(11, 15, 25)         # Very dark slate #0B0F19
CARD_BG = RGBColor(24, 32, 47)          # Surface slate #18202F
CARD_BORDER = RGBColor(51, 65, 85)      # Slate border #334155
ACCENT_GREEN = RGBColor(16, 185, 129)   # Emerald #10B981
ACCENT_CYAN = RGBColor(56, 189, 248)    # Sky blue #38BDF8
ACCENT_AMBER = RGBColor(245, 158, 11)   # Gold/Amber #F59E0B
ACCENT_ROSE = RGBColor(244, 63, 94)     # Rose/Red #F43F5E
TEXT_WHITE = RGBColor(255, 255, 255)
TEXT_MUTED = RGBColor(148, 163, 184)    # Slate 400 #94A3B8

def create_presentation():
    prs = pptx.Presentation()
    prs.slide_width = SLIDE_WIDTH
    prs.slide_height = SLIDE_HEIGHT
    blank_layout = prs.slide_layouts[6]

    def add_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_header(slide, category_tag, title_text, subtitle_text=""):
        # Category Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.35))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        tf_tag.margin_left = tf_tag.margin_right = tf_tag.margin_top = tf_tag.margin_bottom = 0
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = category_tag.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = ACCENT_CYAN

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.65))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_right = tf_title.margin_top = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

        if subtitle_text:
            p_sub = tf_title.add_paragraph()
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = TEXT_MUTED
            p_sub.space_before = Pt(4)

    def add_card(slide, left, top, width, height, border_color=CARD_BORDER, bg_color=CARD_BG):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)
        return card

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide1)

    # Accent decorative bar
    bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(0.1), Inches(4.5))
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT_GREEN
    bar.line.fill.background()

    # Main Title Box
    t_box = slide1.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(11), Inches(4.5))
    tf1 = t_box.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "JSE CLASSROOM TRADING FLOOR SIMULATOR"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_CYAN

    p1 = tf1.add_paragraph()
    p1.text = "The Mechanics of Price Movement"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.space_before = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "How Order Flow, Liquidity Depth, News Catalysts & Multi-Agent Activity Drive Real-Time Asset Prices"
    p2.font.size = Pt(16)
    p2.font.color.rgb = TEXT_MUTED
    p2.space_before = Pt(8)

    # Key highlights pill box
    p3 = tf1.add_paragraph()
    p3.text = "• Order Flow Pricing Engine    • Asset Liquidity Depth Matrix    • Dynamic Breaking News Shocks    • Inter-Round Continuity"
    p3.font.size = Pt(12)
    p3.font.bold = True
    p3.font.color.rgb = ACCENT_GREEN
    p3.space_before = Pt(36)

    p4 = tf1.add_paragraph()
    p4.text = "Classroom Trading Architecture Guide • Dalal Street Bluechips & Financial Analytics Curriculum"
    p4.font.size = Pt(11)
    p4.font.color.rgb = TEXT_MUTED
    p4.space_before = Pt(12)

    # =========================================================================
    # SLIDE 2: The 4 Driving Forces
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide2)
    add_header(slide2, "Core Market Engine Architecture", "The Four Forces That Dictate Stock Prices", "Prices are not randomized: they are discovered dynamically through supply, demand, and news flow.")

    pillars = [
        ("01", "Order Flow Dynamics", "Every BUY order pushes prices up; every SELL order pushes prices down in real time. Larger share volumes create proportionally higher price momentum.", ACCENT_GREEN),
        ("02", "Liquidity Depth Matrix", "Each stock has a unique capital depth. Heavyweights like Reliance take immense volume to move, while high-beta stocks like Zomato move rapidly.", ACCENT_CYAN),
        ("03", "News & AI Catalyst Flow", "Breaking news triggers sentiment shifts. 30 AI student bots and real classmates react to financial earnings and macro interest rate announcements.", ACCENT_AMBER),
        ("04", "Inter-Round Continuity", "The opening price of a new round is strictly determined by the previous round's closing price—preserving real market price continuity.", ACCENT_ROSE),
    ]

    card_width = Inches(2.75)
    card_height = Inches(4.5)
    start_left = Inches(0.8)
    spacing = Inches(0.24)

    for i, (num, title, desc, color) in enumerate(pillars):
        left = start_left + i * (card_width + spacing)
        add_card(slide2, left, Inches(1.8), card_width, card_height, border_color=color)

        c_box = slide2.shapes.add_textbox(left + Inches(0.2), Inches(2.0), card_width - Inches(0.4), card_height - Inches(0.4))
        ctf = c_box.text_frame
        ctf.word_wrap = True

        cp0 = ctf.paragraphs[0]
        cp0.text = num
        cp0.font.size = Pt(28)
        cp0.font.bold = True
        cp0.font.color.rgb = color

        cp1 = ctf.add_paragraph()
        cp1.text = title
        cp1.font.size = Pt(16)
        cp1.font.bold = True
        cp1.font.color.rgb = TEXT_WHITE
        cp1.space_before = Pt(8)

        cp2 = ctf.add_paragraph()
        cp2.text = desc
        cp2.font.size = Pt(12)
        cp2.font.color.rgb = TEXT_MUTED
        cp2.space_before = Pt(12)

    # =========================================================================
    # SLIDE 3: Pillar 1 - Order Flow Formula
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide3)
    add_header(slide3, "Force 1: Mathematical Engine", "Order Flow & Price Impact Formula", "How individual student buy and sell decisions move market quotes.")

    # Left Card: Formula
    add_card(slide3, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), border_color=ACCENT_CYAN)
    f_box = slide3.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.1), Inches(4.4))
    ftf = f_box.text_frame
    ftf.word_wrap = True

    fp0 = ftf.paragraphs[0]
    fp0.text = "Mathematical Formulation"
    fp0.font.size = Pt(18)
    fp0.font.bold = True
    fp0.font.color.rgb = ACCENT_CYAN

    formulas = [
        ("1. Order Value", "Order Value = Quantity × Current Stock Price"),
        ("2. Raw Market Impact", "Raw Impact = Order Value ÷ Asset Liquidity Depth"),
        ("3. Whale Protection Cap", "Capped Impact = min(Raw Impact, 0.08)  [Max 8% per trade]"),
        ("4. Price Execution Multiplier", "• BUY:  New Price = Current Price × (1 + Capped Impact)\n• SELL: New Price = Current Price × (1 - Capped Impact)"),
        ("5. Percentage Return Tracking", "Change% = ((New Price - Round Open Price) ÷ Round Open) × 100"),
    ]

    for title, formula in formulas:
        p_t = ftf.add_paragraph()
        p_t.text = title
        p_t.font.size = Pt(12)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.space_before = Pt(10)

        p_f = ftf.add_paragraph()
        p_f.text = formula
        p_f.font.size = Pt(11)
        p_f.font.color.rgb = ACCENT_GREEN
        p_f.space_before = Pt(2)

    # Right Card: Concrete Example
    add_card(slide3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), border_color=ACCENT_GREEN)
    e_box = slide3.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.4))
    etf = e_box.text_frame
    etf.word_wrap = True

    ep0 = etf.paragraphs[0]
    ep0.text = "Worked Example: Buying 100 Shares of Tata Motors"
    ep0.font.size = Pt(18)
    ep0.font.bold = True
    ep0.font.color.rgb = ACCENT_GREEN

    steps = [
        ("Current Price & Depth", "Current Price: ₹980.00 | Liquidity Depth: ₹45,00,000"),
        ("Step 1: Calculate Order Value", "100 shares × ₹980.00 = ₹98,000.00"),
        ("Step 2: Calculate Raw Price Impact", "₹98,000 ÷ ₹45,00,000 = 0.0218  (+2.18%)"),
        ("Step 3: Check Whale Cap (8%)", "2.18% < 8.00%  →  Full impact applied"),
        ("Step 4: Compute New Stock Price", "₹980.00 × (1 + 0.0218) = ₹1,001.36 (+₹21.36 surge)"),
        ("Takeaway for Students", "Collective aggressive buying bids the price up. Sellers pushing volume into the market drive prices down."),
    ]

    for s_title, s_desc in steps:
        p_st = etf.add_paragraph()
        p_st.text = s_title
        p_st.font.size = Pt(12)
        p_st.font.bold = True
        p_st.font.color.rgb = TEXT_WHITE
        p_st.space_before = Pt(10)

        p_sd = etf.add_paragraph()
        p_sd.text = s_desc
        p_sd.font.size = Pt(11)
        p_sd.font.color.rgb = TEXT_MUTED if "Takeaway" not in s_title else ACCENT_AMBER
        p_sd.space_before = Pt(2)

    # =========================================================================
    # SLIDE 4: Pillar 2 - Liquidity Depth Matrix
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide4)
    add_header(slide4, "Force 2: Market Capitalization & Depth", "Liquidity Depth Matrix Across All 10 Bluechips", "Why ₹3,00,000 moves Zomato dramatically, but barely budges Reliance.")

    # Table on Left
    table_shape = slide4.shapes.add_table(11, 4, Inches(0.8), Inches(1.8), Inches(7.5), Inches(4.8))
    table = table_shape.table
    table.columns[0].width = Inches(1.8)
    table.columns[1].width = Inches(2.3)
    table.columns[2].width = Inches(1.7)
    table.columns[3].width = Inches(1.7)

    headers = ["Stock Ticker", "Company Name", "Liquidity Depth", "Price Sensitivity"]
    for col_idx, h in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = CARD_BG
        for p in cell.text_frame.paragraphs:
            p.font.size = Pt(11)
            p.font.bold = True
            p.font.color.rgb = ACCENT_CYAN

    stocks_data = [
        ("RELIANCE", "Reliance Industries", "₹80,00,000", "Lowest (Giant)"),
        ("TCS", "Tata Consultancy Services", "₹75,00,000", "Low"),
        ("HDFCBANK", "HDFC Bank Limited", "₹70,00,000", "Low"),
        ("INFY", "Infosys Limited", "₹65,00,000", "Medium-Low"),
        ("MARUTI", "Maruti Suzuki Limited", "₹60,00,000", "Medium"),
        ("ITC", "ITC Limited", "₹55,00,000", "Medium"),
        ("SBIN", "State Bank of India", "₹50,00,000", "Medium"),
        ("TATAMOTORS", "Tata Motors Limited", "₹45,00,000", "High (Momentum)"),
        ("ADANIENT", "Adani Enterprises", "₹40,00,000", "Very High (Beta)"),
        ("ZOMATO", "Zomato Limited", "₹32,00,000", "Fastest Velocity"),
    ]

    for row_idx, row_data in enumerate(stocks_data, start=1):
        for col_idx, val in enumerate(row_data):
            cell = table.cell(row_idx, col_idx)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG if row_idx % 2 == 0 else RGBColor(18, 25, 38)
            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(10)
                if col_idx == 0:
                    p.font.bold = True
                    p.font.color.rgb = TEXT_WHITE
                elif col_idx == 2:
                    p.font.color.rgb = ACCENT_GREEN
                elif col_idx == 3:
                    p.font.color.rgb = ACCENT_AMBER if "High" in val or "Fast" in val else TEXT_MUTED
                else:
                    p.font.color.rgb = TEXT_MUTED

    # Right Card: Concept Explanation
    add_card(slide4, Inches(8.6), Inches(1.8), Inches(3.9), Inches(4.8), border_color=CARD_BORDER)
    r_box = slide4.shapes.add_textbox(Inches(8.8), Inches(2.0), Inches(3.5), Inches(4.4))
    rtf = r_box.text_frame
    rtf.word_wrap = True

    rp0 = rtf.paragraphs[0]
    rp0.text = "Financial Insight for Traders"
    rp0.font.size = Pt(16)
    rp0.font.bold = True
    rp0.font.color.rgb = ACCENT_CYAN

    insights = [
        ("High-Beta Growth Equities", "Zomato (₹32L) and Adani (₹40L) have smaller liquidity pools. A rapid surge of student buying creates explosive percentage breakouts."),
        ("Defensive Capital Giants", "Reliance (₹80L) and TCS (₹75L) absorb massive order volumes without large price swings—making them ideal defensive stores of value."),
        ("Trading Floor Strategy", "Traders hunting top rank must balance explosive high-beta momentum stocks with resilient defensive compounders."),
    ]

    for i_title, i_text in insights:
        pt = rtf.add_paragraph()
        pt.text = i_title
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE
        pt.space_before = Pt(14)

        px = rtf.add_paragraph()
        px.text = i_text
        px.font.size = Pt(11)
        px.font.color.rgb = TEXT_MUTED
        px.space_before = Pt(3)

    # =========================================================================
    # SLIDE 5: Pillar 3 - News & AI Catalyst Engine
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide5)
    add_header(slide5, "Force 3: Information Asymmetry & Shocks", "Breaking News & AI Sentiment Engine", "How financial wire headlines transform into order flow and price discovery.")

    # Card 1: Market-Driven Mode (Default)
    add_card(slide5, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), border_color=ACCENT_AMBER)
    n1_box = slide5.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.1), Inches(4.4))
    n1tf = n1_box.text_frame
    n1tf.word_wrap = True

    np0 = n1tf.paragraphs[0]
    np0.text = "Mode A: Market-Driven Discovery (Default)"
    np0.font.size = Pt(17)
    np0.font.bold = True
    np0.font.color.rgb = ACCENT_AMBER

    points1 = [
        ("1. Unscheduled Headline Broadcast", "The teacher triggers a catalyst (e.g. 'Tata Motors Q3 Net Profit +74% on Record EV Sales')."),
        ("2. No Artificial Price Jumping", "Stock price does NOT instantly teleport. It remains at current market value until orders enter the book."),
        ("3. 30 AI Classmates React Immediately", "The 30 simulated classmates detect sentiment: 75% bias toward BUY on bullish news, or 75% bias toward SELL on bearish news."),
        ("4. Student Predictive Trading", "Students must analyze the financial metrics (P&L, Margins, Debt) and trade BEFORE the crowd bids up the price!"),
    ]

    for p_t, p_d in points1:
        pt = n1tf.add_paragraph()
        pt.text = p_t
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE
        pt.space_before = Pt(12)

        pd = n1tf.add_paragraph()
        pd.text = p_d
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_MUTED
        pd.space_before = Pt(2)

    # Card 2: Instant Shock Mode
    add_card(slide5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), border_color=ACCENT_ROSE)
    n2_box = slide5.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.4))
    n2tf = n2_box.text_frame
    n2tf.word_wrap = True

    np2 = n2tf.paragraphs[0]
    np2.text = "Mode B: Instant Macro Shock (Teacher Override)"
    np2.font.size = Pt(17)
    np2.font.bold = True
    np2.font.color.rgb = ACCENT_ROSE

    points2 = [
        ("1. Forced Structural Gap", "Used when simulating sudden overnight macro shocks (e.g., RBI surprise 50 bps repo hike, emergency GST tax cut)."),
        ("2. Instant Percentage Re-Rating", "The engine immediately applies the scenario reference impact: New Price = Current Price × (1 + Impact)."),
        ("3. Asset Scope Targeting", "News can target a single stock (e.g., MARUTI +21%), an entire sector (BANKING -14%), or the whole market (ALL Bluechips +8%)."),
        ("4. Real-World Portfolio Impact", "Every student's portfolio net worth and rankings instantly recalculate based on their exposure to the affected assets."),
    ]

    for p_t, p_d in points2:
        pt = n2tf.add_paragraph()
        pt.text = p_t
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE
        pt.space_before = Pt(12)

        pd = n2tf.add_paragraph()
        pd.text = p_d
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_MUTED
        pd.space_before = Pt(2)

    # =========================================================================
    # SLIDE 6: Pillar 4 - Inter-Round Price Continuity
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide6)
    add_header(slide6, "Force 4: Session Continuity", "The Golden Rule: Previous Close Becomes Next Open", "Preserving realism across all 5 classroom trading rounds.")

    # Full width comparison card
    add_card(slide6, Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.8), border_color=ACCENT_GREEN)
    c_box = slide6.shapes.add_textbox(Inches(1.2), Inches(2.0), Inches(11), Inches(4.4))
    ctf = c_box.text_frame
    ctf.word_wrap = True

    cp0 = ctf.paragraphs[0]
    cp0.text = "\"THE OPENING PRICE IS DECIDED BY THE PREVIOUS CLOSING PRICE\""
    cp0.font.size = Pt(18)
    cp0.font.bold = True
    cp0.font.color.rgb = ACCENT_GREEN

    c_steps = [
        ("No Artificial Price Resets Between Rounds", "When Round 1 ends and Round 2 begins, stocks do NOT reset to their day-start baseline. If Reliance climbed from ₹2,950 to ₹3,120 in Round 1, Round 2 starts exactly at ₹3,120."),
        ("Locking the Reference Benchmark", "At the instant a new round starts, `previousClosePrice` and `roundOpenPrice` are locked to the last traded price. This ensures fair, uninterrupted price progression throughout the entire classroom lecture."),
        ("Round Intraday Percentage Tracking", "While historical prices are preserved, each stock's displayed `changePercent` metric measures gains or losses relative to the current round's opening price. Students can instantly see which equities are winning in the current session."),
        ("Faculty Freedom: Jump to Any Round (1–5)", "The faculty dashboard allows jumping straight to any round via the dropdown selector. Opening prices always carry over smoothly, recalculating all 35 student portfolios in real time."),
    ]

    for t, d in c_steps:
        pt = ctf.add_paragraph()
        pt.text = t
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE
        pt.space_before = Pt(12)

        pd = ctf.add_paragraph()
        pd.text = d
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_MUTED
        pd.space_before = Pt(2)

    # =========================================================================
    # SLIDE 7: Safety Guardrails & Micro-Ticks
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide7)
    add_header(slide7, "Stability & Realism Guardrails", "Micro-Volatility & Circuit Floor Mechanics", "Ensuring live visual realism while preventing mathematical breakdown.")

    guards = [
        ("Organic Micro-Tick Jitter", "±0.2% Idle Drift", "When no student trades are firing, an organic random float (±0.2%) animates the real-time SVG candlestick and area charts. This mirrors realistic Dalal Street tick-by-tick micro-volatility.", ACCENT_CYAN),
        ("Absolute Safety Price Floor", "MIN_PRICE = ₹10.00", "No catastrophic selloff can ever drive a stock to ₹0 or negative values. A hardcoded minimum price floor of ₹10.00 prevents zero-division errors in student portfolio valuations.", ACCENT_ROSE),
        ("Instant Mark-to-Market P&L", "0ms Rank Updates", "Whenever any asset price changes, the server instantly recalculates Net Worth = Cash + Σ(Shares × Current Price) for all 35 students and ranks them on the big-screen leaderboard.", ACCENT_GREEN),
    ]

    for i, (g_title, g_badge, g_desc, g_color) in enumerate(guards):
        left = Inches(0.8) + i * (Inches(3.75) + Inches(0.24))
        add_card(slide7, left, Inches(1.8), Inches(3.75), Inches(4.8), border_color=g_color)

        gb_box = slide7.shapes.add_textbox(left + Inches(0.25), Inches(2.0), Inches(3.25), Inches(4.4))
        gtf = gb_box.text_frame
        gtf.word_wrap = True

        gp0 = gtf.paragraphs[0]
        gp0.text = g_badge
        gp0.font.size = Pt(12)
        gp0.font.bold = True
        gp0.font.color.rgb = g_color

        gp1 = gtf.add_paragraph()
        gp1.text = g_title
        gp1.font.size = Pt(16)
        gp1.font.bold = True
        gp1.font.color.rgb = TEXT_WHITE
        gp1.space_before = Pt(6)

        gp2 = gtf.add_paragraph()
        gp2.text = g_desc
        gp2.font.size = Pt(11)
        gp2.font.color.rgb = TEXT_MUTED
        gp2.space_before = Pt(12)

    # =========================================================================
    # SLIDE 8: Student Trading Playbook
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_slide_background(slide8)
    add_header(slide8, "Pedagogical Takeaway for Students", "The Winning Trader's Playbook", "How students turn market mechanics into profitable portfolio strategies.")

    strategies = [
        ("1. Fast Catalyst Execution", "Read the news first! When Tata Motors reports +74% PAT, enter your BUY order before the 30 AI classmates flood the order book and raise the price."),
        ("2. Understand Market Impact & Slippage", "Buying 500 shares in one shot pushes the price against you. Splitting large orders across multiple price ticks reduces slippage costs."),
        ("3. Liquidity-Aware Asset Allocation", "Use Zomato and Adani for aggressive short-term momentum gains; hold Reliance and TCS for stable wealth defense against market volatility."),
        ("4. Cash Flow & Risk Management", "Never exhaust 100% of your liquid cash. Keep cash buffer available to buy dips when central bank rate hike news triggers temporary market selloffs."),
    ]

    add_card(slide8, Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.8), border_color=ACCENT_CYAN)
    s_box = slide8.shapes.add_textbox(Inches(1.2), Inches(2.0), Inches(11), Inches(4.4))
    stf = s_box.text_frame
    stf.word_wrap = True

    sp0 = stf.paragraphs[0]
    sp0.text = "FOUR GOLDEN RULES FOR DALAL STREET SUCCESS"
    sp0.font.size = Pt(18)
    sp0.font.bold = True
    sp0.font.color.rgb = ACCENT_CYAN

    for st_title, st_desc in strategies:
        pt = stf.add_paragraph()
        pt.text = st_title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE
        pt.space_before = Pt(12)

        pd = stf.add_paragraph()
        pd.text = st_desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_MUTED
        pd.space_before = Pt(2)

    # Output path
    output_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "Price_Movement_Engine_Guide.pptx")
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    create_presentation()
