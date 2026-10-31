import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database, connectDatabaseEmulator } from "firebase/database";

const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (isEmulator ? "demo-api-key" : ""),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (isEmulator ? "demo-jse-trading.firebaseapp.com" : ""),
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    (isEmulator
      ? `http://${process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1"}:${process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PORT || "9000"}?ns=demo-jse-trading-default-rtdb`
      : ""),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (isEmulator ? "demo-jse-trading" : ""),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (isEmulator ? "demo-app-id" : ""),
};

export const isFirebaseConfigured = Boolean(
  (firebaseConfig.databaseURL && firebaseConfig.databaseURL.length > 5) || isEmulator
);

let app: FirebaseApp | null = null;
let database: Database | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
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
        // Emulator already connected in this tab session
      }
    }
  } catch (err) {
    console.warn("Failed to initialize Firebase Realtime Database:", err);
  }
}

export { app, database };
