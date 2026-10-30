# Vercel Deployment & Multi-Device Setup Guide 🚀

This guide explains how to deploy the **Classroom Trading Floor Simulator** to **Vercel** and configure real-time synchronization so 30–35 students can trade seamlessly on their smartphones while the teacher projects the live trading floor on the big screen.

---

## 🌟 Why Deploy to Vercel?
- **Zero Install for Students**: Students simply scan the QR code on the classroom projector with their phone camera and enter their name.
- **Fast Global CDN**: Sub-second initial page load on cellular or school Wi-Fi.
- **100% Free**: Operates entirely within the free tiers of Vercel and Firebase.

---

## ⚡ 1. Fast Deploy to Vercel (Under 5 Minutes)

### Step 1: Push your Code to GitHub
Open your terminal in `classroom-trading-sim`:
```bash
git init
git add .
git commit -m "Classroom Trading Floor Platform Revamp"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/classroom-trading-sim.git
git push -u origin main
```

### Step 2: Import Project on Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Select your `classroom-trading-sim` repository and click **"Import"**.
4. Framework Preset: **Next.js** (auto-detected).
5. Root Directory: `./` (or leave default).
6. Click **Deploy**.

Vercel will build and assign you a production URL (e.g. `https://classroom-trading-sim.vercel.app`).

---

## 🔄 2. Setting Up Real-Time Multi-Device Sync

### Understanding Vercel Serverless Architecture
Vercel executes API routes using **stateless Serverless Functions**.
- When testing locally on your laptop, state lives in server memory across tabs.
- When 35 students connect on their individual mobile networks in a real classroom, each request might route through different serverless instances.
- To ensure **zero-lag instantaneous order updates**, the app includes built-in support for **Firebase Realtime Database** (free tier supports up to 100 simultaneous connections and 1 GB data, more than enough for 20+ classroom sessions!).

---

### Step 3: Create a Free Firebase Realtime Database
1. Go to the [Firebase Console](https://console.firebase.google.com) and click **"Add Project"** (name it `classroom-trading`).
2. In the left sidebar, click **"Build"** -> **"Realtime Database"**.
3. Click **"Create Database"**, choose your nearest region (e.g., `asia-southeast1` or `us-central1`).
4. Under Security Rules, select **"Start in test mode"** (allows reads and writes during your classroom simulation).
5. In Project Settings (⚙️ icon at the top left) -> **"General"**, scroll down to **"Your apps"**, click the Web icon (`</>`), and register your web app.
6. Firebase will display your config object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "classroom-trading-xxx.firebaseapp.com",
     databaseURL: "https://classroom-trading-xxx-default-rtdb.firebaseio.com",
     projectId: "classroom-trading-xxx",
     storageBucket: "classroom-trading-xxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

---

### Step 4: Add Environment Variables to Vercel
1. Open your project on the [Vercel Dashboard](https://vercel.com).
2. Go to **Settings** -> **Environment Variables**.
3. Add the following 6 keys from your Firebase config:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `classroom-trading-xxx.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | `https://classroom-trading-xxx-default-rtdb.firebaseio.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `classroom-trading-xxx` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `classroom-trading-xxx.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789:web:abcdef` |

4. Go to the **Deployments** tab and click **Redeploy** on the latest deployment so the environment variables take effect.

---

## 🎯 3. Running Your Classroom Trading Session

1. **Teacher Big Screen**:
   - Open your projector browser to: `https://your-app.vercel.app/projector/WALLST`
   - Make the browser full-screen (press `F11`).
   - The large dynamic QR code on the top-right automatically encodes your public URL!
2. **Teacher Command Center**:
   - On your teacher laptop or iPad, open: `https://your-app.vercel.app/host`
3. **Student Joining**:
   - Students scan the projector QR code on their phones.
   - They enter their name and select their syndicate desk.
   - They receive their starting stock holdings and ₹10,00,000 net worth!
4. **Ring the Opening Bell**:
   - On `/host`, click **"Start Market"** (rings the brass bell and enables buy/sell buttons on all student screens).
   - Trigger the curated round news shocks (e.g., Tata Elxsi earnings, RBI rate hikes, OFSS dividend).
   - Watch the live execution ticker and student rankings update in real time!
