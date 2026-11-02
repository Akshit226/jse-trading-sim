import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database, connectDatabaseEmulator, ref, onValue } from "firebase/database";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from "firebase/auth";

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
export let auth: Auth | null = null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

if (typeof window !== "undefined" && (isFirebaseConfigured || isEmulator)) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);

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

export interface FirebaseConnectionStatus {
  connected: boolean;
  permissionGranted: boolean;
  permissionDenied: boolean;
  error?: string;
}

export async function loginWithGoogle(): Promise<{
  name: string;
  email: string;
  uid: string;
  photoURL?: string;
}> {
  if (!auth) {
    throw new Error("Firebase Authentication is not ready. Please check connection.");
  }

  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Extract legitimate name from Google account:
  // 1. user.displayName (e.g. "Akshit Singh")
  // 2. Parse from verified email address (e.g. "akshit.singh@jainuniversity.ac.in" -> "Akshit Singh")
  let verifiedName = user.displayName;
  if (!verifiedName && user.email) {
    const localPart = user.email.split("@")[0];
    verifiedName = localPart
      .replace(/[._\-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return {
    name: verifiedName || "Verified Student",
    email: user.email || "",
    uid: user.uid,
    photoURL: user.photoURL || undefined,
  };
}

export async function logoutGoogle(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

export function subscribeToFirebaseConnection(
  onStatusChange: (status: FirebaseConnectionStatus) => void
): () => void {
  if (typeof window !== "undefined" && database) {
    try {
      const connectedRef = ref(database, ".info/connected");
      const probeRef = ref(database, "rooms/WALLST/status");

      let isConnected = false;
      let hasPermission = false;
      let isDenied = false;

      const unsubConnected = onValue(
        connectedRef,
        (snap) => {
          isConnected = Boolean(snap.val());
          onStatusChange({
            connected: isConnected,
            permissionGranted: hasPermission,
            permissionDenied: isDenied,
          });
        },
        () => {
          onStatusChange({
            connected: false,
            permissionGranted: false,
            permissionDenied: true,
          });
        }
      );

      // Actively probe /rooms permission to verify if Google Cloud security rules permit read/write
      const unsubProbe = onValue(
        probeRef,
        () => {
          hasPermission = true;
          isDenied = false;
          onStatusChange({
            connected: isConnected,
            permissionGranted: true,
            permissionDenied: false,
          });
        },
        (err) => {
          hasPermission = false;
          isDenied = true;
          onStatusChange({
            connected: isConnected,
            permissionGranted: false,
            permissionDenied: true,
            error: err.message,
          });
        }
      );

      return () => {
        unsubConnected();
        unsubProbe();
      };
    } catch {
      onStatusChange({ connected: false, permissionGranted: false, permissionDenied: true });
      return () => {};
    }
  }
  onStatusChange({ connected: false, permissionGranted: false, permissionDenied: false });
  return () => {};
}

export function getFirebaseConnectionStatus(): {
  isConfigured: boolean;
  isEmulator: boolean;
  databaseUrl: string;
  projectId: string;
} {
  return {
    isConfigured: isFirebaseConfigured,
    isEmulator,
    databaseUrl: firebaseConfig.databaseURL || "",
    projectId,
  };
}

export { app, database, analytics, firebaseConfig };
