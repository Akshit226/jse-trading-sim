import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database, connectDatabaseEmulator } from "firebase/database";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (isEmulator ? "demo-jse-trading" : "jse-trading-sim");
const defaultCloudDbUrl = projectId ? `https://${projectId}-default-rtdb.firebaseio.com` : "";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (isEmulator ? "demo-api-key" : "AIzaSyDwVMEaNdxgjzgCDZn2GtC6I9Y8upJlGO4"),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (isEmulator ? "demo-jse-trading.firebaseapp.com" : `${projectId}.firebaseapp.com`),
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    (isEmulator
      ? `http://${process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1"}:${process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PORT || "9000"}?ns=demo-jse-trading-default-rtdb`
      : defaultCloudDbUrl),
  projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "524553542072",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (isEmulator ? "demo-app-id" : "1:524553542072:web:51ac3afb0ec3849ea2574d"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-FZM9V9EJLY",
};

export const isFirebaseConfigured = Boolean(
  (firebaseConfig.databaseURL && firebaseConfig.databaseURL.length > 5) || isEmulator
);

let app: FirebaseApp | null = null;
let database: Database | null = null;
let analytics: Analytics | null = null;

if (typeof window !== "undefined" && (isFirebaseConfigured || isEmulator)) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    database = getDatabase(app);

    if (isEmulator) {
      const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1";
      const port = Number(process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PORT) || 9000;
      try {
        connectDatabaseEmulator(database, host, port);
        console.log(`[Firebase] Connected to local Realtime Database emulator at ${host}:${port}`);
      } catch {
        // Emulator already connected
      }
    } else {
      console.log(`[Firebase] Connected to Google Cloud Firebase (${projectId})`);
    }

    // Safely initialize Analytics in browser
    if (!isEmulator) {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
          console.log("[Firebase] Analytics initialized successfully");
        }
      });
    }
  } catch (err) {
    console.warn("Failed to initialize Firebase Realtime Database:", err);
  }
}

export { app, database, analytics, firebaseConfig };
