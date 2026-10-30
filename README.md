# Classroom Trading Floor Simulator 📈

An interactive, high-energy multiplayer trading simulation designed specifically for **30–35 students in a classroom**, built with Next.js and Tailwind CSS, deployable on **Vercel** in 1 click.

---

## 🌟 Key Features

1. **Breaking News & Market Sentiment Engine**:
   - 5 fast-paced rounds (4 mins each).
   - Dynamic breaking news shocks (e.g. *NovaTech AI earnings beat*, *Geopolitical oil shipping crisis*, *Surprise Fed 75 bps rate hike*, *Antitrust probe*).
   - News shifts market fair value while collective student buy/sell order flow moves prices dynamically.

2. **Information Asymmetry & Trading Desks**:
   - Students join 1 of 4 syndicates:
     - 📡 **Tech & Silicon Analysts** (receive confidential hardware leaks & earnings previews)
     - 🛢️ **Energy & Commodities Desk** (receive early OPEC signals & pipeline alerts)
     - 🏛️ **Macro / Fed Watchers** (receive inflation prints & interest rate predictions)
     - ⚡ **Retail Momentum Traders** (meme sentiment & liquidity squeeze trackers)

3. **Dual-Screen Experience**:
   - **Teacher Projector Big-Screen (`/projector/WALLST`)**: Designed for 1080p/4K classroom projectors. Live interactive area charts, real-time scrolling trade ticker, audio cues (NYSE opening/closing bell, crash alarms), sentiment meter, and dynamic top-10 leaderboard.
   - **Student Mobile Pad (`/play/WALLST`)**: Zero install required! Students scan the QR code on the projector, enter their name, and immediately start trading with $100,000 virtual cash. Quick 1-click buy/sell buttons (`10`, `50`, `100`, `Max`, `50%`, `All`).
   - **Teacher Host Dashboard (`/host`)**: Control rounds, trigger preset news shocks or broadcast custom headlines on the fly, ring the opening bell, and export final grades to CSV.

4. **30 AI Classmates Simulation**:
   - Includes a **"Spawn 30 Classmates"** button and live AI trading engine so you can test and showcase a packed classroom with live trading activity out of the box!

---

## 🚀 Quick Start (Local Development)

```bash
cd classroom-trading-sim
npm install
npm run dev
```

Open three browser tabs to experience the multiplayer simulation:
1. **Teacher Dashboard**: [http://localhost:3000/host](http://localhost:3000/host)
2. **Classroom Projector**: [http://localhost:3000/projector/WALLST](http://localhost:3000/projector/WALLST)
3. **Student Trader**: [http://localhost:3000/play/WALLST](http://localhost:3000/play/WALLST)

Click **"Spawn 30 Classmates"** and **"AI Traders: ACTIVE"** on the Teacher Dashboard to watch all 30 students start trading in real time!

---

## ☁️ Deploying to Vercel

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Classroom Trading Floor Simulator"
   git remote add origin https://github.com/your-username/classroom-trading-sim.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository and click **Deploy**.

### Optional: Firebase Realtime Database Setup (For cross-device internet sync)
For seamless cross-device synchronization between students on different mobile networks and the teacher's projector:
1. Create a free project at [Firebase Console](https://console.firebase.google.com).
2. Click **Build** -> **Realtime Database** -> **Create Database** (Select "Start in test mode").
3. Add the following environment variables in Vercel (or in `.env.local` locally):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

*(Note: Even without Firebase credentials, the game runs locally across tabs using BroadcastChannel!)*

---

## 🧪 Testing

Run unit tests for pricing engine, portfolio calculation, and news shocks:
```bash
npm test
```
