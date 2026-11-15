import { create } from "zustand";
import {
  deriveCallsignFromAuthUser,
  deriveUsernameFromAuthUser,
  getAuthErrorMessage,
  getDisplayNameFromAuthUser,
  signInWithGoogle,
  signOutGoogle,
  type AuthUserInfo,
} from "./firebase-auth";
import type { FirestoreUserProfile } from "./firestore-profile";
import { getUserLinksPath, sortLinksByCreatedAtDesc } from "./firestore-links";
import {
  AnalyticsSummary,
  LinkItem,
  ThemeId,
  UserProfile,
} from "../types";
import { DUMMY_ANALYTICS } from "./dummy-links";

export { DUMMY_ANALYTICS };

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
export type FirestoreSyncStatus = "idle" | "syncing" | "connected" | "error";

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateDailyHistory(
  analytics: AnalyticsSummary | undefined,
  deltaViews: number,
  deltaClicks: number
): AnalyticsSummary {
  const base = analytics ?? DUMMY_ANALYTICS;
  const today = getTodayDateString();
  const history = [...(base.dailyHistory ?? [])];
  const existingIdx = history.findIndex((entry) => entry.date === today);

  if (existingIdx >= 0) {
    const current = history[existingIdx];
    history[existingIdx] = {
      ...current,
      views: current.views + deltaViews,
      clicks: current.clicks + deltaClicks,
    };
  } else {
    history.push({
      date: today,
      views: deltaViews,
      clicks: deltaClicks,
    });
  }

  // 최근 14일 데이터만 유지
  const trimmedHistory = history.slice(-14);

  return {
    totalViews: (base.totalViews ?? 0) + deltaViews,
    totalClicks: (base.totalClicks ?? 0) + deltaClicks,
    dailyHistory: trimmedHistory,
  };
}

export const DEFAULT_PROFILE: UserProfile = {
  username: "guest",
  name: "MyLink 마이페이지",
  callsign: "@guest",
  discipline: "Personalized Links",
  status: "Login Required",
  headline:
    "Google 계정으로 로그인하면 개인화된 Firestore 경로(users/{user.uid}/links)에 나만의 링크를 저장하고 관리할 수 있습니다.",
  statementLead: "로그인 후 개인화된 마이링크 프로필을 시작하세요.",
  statementBody:
    "상단 헤더 또는 페이지 내 로그인 버튼을 통해 Google 계정을 연동하면 사용자 고유 UID 기반의 링크 디렉토리가 즉시 활성화됩니다.",
  avatarUrl: "/avatar.png",
  bio: "",
  email: "",
  theme: "xai",
  capabilities: [
    {
      category: "CORE ARCHITECTURE",
      headline: "Full-Stack Web Systems",
      desc: "Next.js 16 (App Router), React 19, TypeScript. Engineered for performance and type-safe clarity.",
    },
    {
      category: "AUTHENTICATION",
      headline: "Google Social Sign-In",
      desc: "Firebase Authentication OAuth 2.0 session management with instant header login and account switching.",
    },
    {
      category: "DATA ISOLATION",
      headline: "UID-Scoped Firestore Path",
      desc: "Every link document is stored under users/{user.uid}/links for personalized persistence.",
    },
    {
      category: "DESIGN & INTERACTION",
      headline: "xAI Minimal Dark System",
      desc: "Sparse monochrome aesthetics, geometric typography, pill controls, and hairline borders.",
    },
  ],
  links: [],
  analytics: DUMMY_ANALYTICS,
};

/**
 * 로그인된 Google 사용자 정보, Firestore 프로필, 링크 목록을 바탕으로 화면 표시용 프로필 객체를 구성합니다.
 */
export function buildProfileForAuthUser(
  user: AuthUserInfo | null,
  links: LinkItem[] = [],
  currentAnalytics?: AnalyticsSummary,
  customProfile?: FirestoreUserProfile | null
): UserProfile {
  if (!user) {
    return {
      ...DEFAULT_PROFILE,
      links: [],
      analytics: currentAnalytics ?? DUMMY_ANALYTICS,
    };
  }

  const displayName =
    customProfile?.displayName?.trim() || getDisplayNameFromAuthUser(user);
  const username = deriveUsernameFromAuthUser(user);
  const callsign = deriveCallsignFromAuthUser(user);
  const linksPath = getUserLinksPath(user.uid);
  const bio = customProfile?.bio?.trim() ?? "";
  const avatarUrl =
    customProfile?.avatarUrl?.trim() || user.photoURL || "/avatar.png";

  return {
    ...DEFAULT_PROFILE,
    username,
    name: displayName,
    callsign,
    discipline: "Google Account",
    status: "Authenticated · Active",
    headline: user.email
      ? `${user.email} · Firestore 경로(${linksPath})에 연결된 개인화 마이페이지입니다.`
      : `Firestore 경로(${linksPath})에 연결된 개인화 마이페이지입니다.`,
    statementLead: `${displayName}님의 개인화된 마이페이지입니다.`,
    statementBody: `Google 소셜 로그인 계정(${user.email ?? user.uid})으로 인증되었으며, 모든 링크와 클릭 통계는 Cloud Firestore(${linksPath}) 경로에 안전하게 분리 저장됩니다.`,
    avatarUrl,
    bio,
    email: user.email ?? "",
    links: sortLinksByCreatedAtDesc(links),
    analytics: currentAnalytics ?? DUMMY_ANALYTICS,
  };
}

interface ProfileStore {
  authStatus: AuthStatus;
  authUser: AuthUserInfo | null;
  isAuthSubmitting: boolean;
  authError: string | null;
  theme: ThemeId;
  analytics: AnalyticsSummary;
  updatingLinkIds: string[];
  firestoreMutationError: string | null;
  profileMutationError: string | null;
  // 인증 액션
  setAuthState: (status: AuthStatus, user: AuthUserInfo | null) => void;
  setAuthDisplayName: (displayName: string | null) => void;
  signInWithGoogleAction: () => Promise<AuthUserInfo | null>;
  signOutAction: () => Promise<void>;
  clearAuthError: () => void;
  // UI 상태 및 로컬 애널리틱스 액션
  setTheme: (theme: ThemeId) => void;
  addUpdatingLinkId: (id: string) => void;
  removeUpdatingLinkId: (id: string) => void;
  setFirestoreMutationError: (error: string | null) => void;
  setProfileMutationError: (error: string | null) => void;
  recordPageView: () => void;
  recordClickAnalytics: () => void;
  resetAnalytics: () => void;
}

export const useProfileStore = create<ProfileStore>()((set, get) => ({
  authStatus: "loading",
  authUser: null,
  isAuthSubmitting: false,
  authError: null,
  theme: "xai",
  analytics: DUMMY_ANALYTICS,
  updatingLinkIds: [],
  firestoreMutationError: null,
  profileMutationError: null,

  setAuthState: (status, user) => {
    set((state) => {
      if (status === "unauthenticated" || !user) {
        return {
          authStatus: status,
          authUser: null,
          updatingLinkIds: [],
          firestoreMutationError: null,
          profileMutationError: null,
        };
      }

      const isSameUser = state.authUser?.uid === user.uid;
      return {
        authStatus: status,
        authUser: user,
        authError: null,
        updatingLinkIds: isSameUser ? state.updatingLinkIds : [],
        firestoreMutationError: isSameUser
          ? state.firestoreMutationError
          : null,
        profileMutationError: isSameUser
          ? state.profileMutationError
          : null,
      };
    });
  },

  setAuthDisplayName: (displayName) => {
    set((state) => ({
      authUser: state.authUser
        ? { ...state.authUser, displayName }
        : null,
    }));
  },

  signInWithGoogleAction: async () => {
    if (get().isAuthSubmitting) return null;

    set({
      isAuthSubmitting: true,
      authError: null,
    });

    try {
      const user = await signInWithGoogle();
      set({
        authStatus: "authenticated",
        authUser: user,
        isAuthSubmitting: false,
        authError: null,
      });
      return user;
    } catch (error) {
      set({
        isAuthSubmitting: false,
        authError: getAuthErrorMessage(error),
      });
      return null;
    }
  },

  signOutAction: async () => {
    if (get().isAuthSubmitting) return;

    set({
      isAuthSubmitting: true,
      authError: null,
    });

    try {
      await signOutGoogle();
      set({
        authStatus: "unauthenticated",
        authUser: null,
        isAuthSubmitting: false,
        authError: null,
        updatingLinkIds: [],
        firestoreMutationError: null,
        profileMutationError: null,
      });
    } catch (error) {
      set({
        isAuthSubmitting: false,
        authError: getAuthErrorMessage(error),
      });
    }
  },

  clearAuthError: () => set({ authError: null }),

  setTheme: (theme) => set({ theme }),

  addUpdatingLinkId: (id) =>
    set((state) => ({
      updatingLinkIds: state.updatingLinkIds.includes(id)
        ? state.updatingLinkIds
        : [...state.updatingLinkIds, id],
    })),

  removeUpdatingLinkId: (id) =>
    set((state) => ({
      updatingLinkIds: state.updatingLinkIds.filter((itemId) => itemId !== id),
    })),

  setFirestoreMutationError: (error) => set({ firestoreMutationError: error }),

  setProfileMutationError: (error) => set({ profileMutationError: error }),

  recordPageView: () =>
    set((state) => ({
      analytics: updateDailyHistory(state.analytics, 1, 0),
    })),

  recordClickAnalytics: () =>
    set((state) => ({
      analytics: updateDailyHistory(state.analytics, 0, 1),
    })),

  resetAnalytics: () =>
    set((state) => ({
      analytics: {
        totalViews: 0,
        totalClicks: 0,
        dailyHistory: (state.analytics.dailyHistory ?? []).map((entry) => ({
          ...entry,
          views: 0,
          clicks: 0,
        })),
      },
    })),
}));
