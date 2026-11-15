import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  getAnalytics,
  isSupported,
  type Analytics,
} from "firebase/analytics";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase 웹 앱 설정 (환경 변수로 관리)
 * Next.js 클라이언트 번들에서 접근할 수 있도록 NEXT_PUBLIC_ 접두사를 사용합니다.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Next.js SSR 및 HMR 환경에서 중복 초기화를 방지하는 싱글톤 Firebase 앱 인스턴스
const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let analyticsInstance: Analytics | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

/**
 * Firebase 환경 변수 설정 여부를 반환합니다.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/**
 * Firebase Authentication 싱글톤 인스턴스를 반환합니다.
 * 브라우저 환경이 아니거나 환경 변수가 설정되지 않은 경우 null을 반환합니다.
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined" || !isFirebaseConfigured()) {
    return null;
  }

  if (!authInstance) {
    authInstance = getAuth(app);
  }

  return authInstance;
}

/**
 * Google 소셜 로그인용 AuthProvider 인스턴스를 생성합니다.
 */
export function createGoogleAuthProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return provider;
}

/**
 * Cloud Firestore 싱글톤 인스턴스를 반환합니다.
 * 환경 변수가 설정되지 않은 경우 null을 반환합니다.
 */
export function getFirestoreDb(): Firestore | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!firestoreInstance) {
    firestoreInstance = getFirestore(app);
  }

  return firestoreInstance;
}

/**
 * 브라우저 환경이며 Analytics 지원이 가능한 경우에만 Analytics 인스턴스를 반환합니다.
 * 서버 사이드 렌더링(SSR) 환경에서는 null을 반환합니다.
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (
    typeof window === "undefined" ||
    !firebaseConfig.apiKey ||
    !firebaseConfig.appId
  ) {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  if (await isSupported()) {
    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  }

  return null;
}

export { app, firebaseConfig };
