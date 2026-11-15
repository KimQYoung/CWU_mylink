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
import {
  fetchUserProfile,
  getProfileFirestoreErrorMessage,
  getUserProfilePath,
  saveUserProfile,
  type FirestoreUserProfile,
  type SaveUserProfileInput,
} from "./firestore-profile";
import { sanitizeDisplayName } from "./schemas/profile";
import {
  createUserLink,
  deleteUserLink,
  fetchUserLinks,
  getFirestoreErrorMessage,
  getUserLinksPath,
  incrementUserLinkClicks,
  sortLinksByCreatedAtDesc,
  updateUserLink,
  updateUserLinkActive,
  type UpdateUserLinkInput,
} from "./firestore-links";
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

let latestLoadRequestId = 0;
let latestProfileRequestId = 0;

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

function upsertLinkById(links: LinkItem[], target: LinkItem): LinkItem[] {
  const exists = links.some((link) => link.id === target.id);
  if (exists) {
    return links.map((link) => (link.id === target.id ? target : link));
  }
  return [target, ...links];
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
 * 로그인된 Google 사용자 정보와 링크 목록을 바탕으로 화면 표시용 프로필 객체를 구성합니다.
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

type StoreSet = (
  partial:
    | Partial<ProfileStore>
    | ((state: ProfileStore) => Partial<ProfileStore> | ProfileStore)
) => void;

/**
 * 비실시간(갱신형) 모드에서 링크 추가/수정/삭제 후 Firestore 최신 목록을 다시 조회하여 반영합니다.
 * 목록 재조회에만 실패한 경우 로컬 폴백 함수를 통해 일관된 UI 상태를 유지합니다.
 */
async function refreshLinksAfterMutation(
  uid: string,
  set: StoreSet,
  get: () => ProfileStore,
  mergeRefreshedLinks: (refreshedLinks: LinkItem[]) => LinkItem[],
  applyLocalFallback: (currentLinks: LinkItem[]) => LinkItem[]
) {
  const requestId = ++latestLoadRequestId;
  try {
    const refreshedLinks = await fetchUserLinks(uid);
    if (requestId !== latestLoadRequestId || get().authUser?.uid !== uid) {
      return;
    }

    const nextFirestoreLinks = sortLinksByCreatedAtDesc(
      mergeRefreshedLinks(refreshedLinks)
    );
    set((state) => ({
      firestoreLinks: nextFirestoreLinks,
      firestoreStatus: "connected",
      firestoreError: null,
      isRefreshingLinks: false,
      profile: {
        ...state.profile,
        links: nextFirestoreLinks,
      },
    }));
  } catch {
    if (requestId !== latestLoadRequestId || get().authUser?.uid !== uid) {
      return;
    }

    set((state) => {
      const nextFirestoreLinks = sortLinksByCreatedAtDesc(
        applyLocalFallback(state.firestoreLinks)
      );
      return {
        firestoreLinks: nextFirestoreLinks,
        firestoreStatus: "connected",
        firestoreError: null,
        isRefreshingLinks: false,
        profile: {
          ...state.profile,
          links: nextFirestoreLinks,
        },
      };
    });
  }
}

interface ProfileStore {
  authStatus: AuthStatus;
  authUser: AuthUserInfo | null;
  isAuthSubmitting: boolean;
  authError: string | null;
  profile: UserProfile;
  customProfile: FirestoreUserProfile | null;
  isProfileLoading: boolean;
  profileError: string | null;
  firestoreLinks: LinkItem[];
  firestoreStatus: FirestoreSyncStatus;
  firestoreError: string | null;
  isRefreshingLinks: boolean;
  updatingLinkIds: string[];
  // 인증 액션
  setAuthState: (status: AuthStatus, user: AuthUserInfo | null) => void;
  signInWithGoogleAction: () => Promise<AuthUserInfo | null>;
  signOutAction: () => Promise<void>;
  clearAuthError: () => void;
  // Firestore 조회 및 상태 액션
  loadFirestoreProfile: (uid?: string) => Promise<void>;
  saveProfile: (
    input: Omit<SaveUserProfileInput, "email">
  ) => Promise<FirestoreUserProfile>;
  loadFirestoreLinks: (uid?: string) => Promise<void>;
  setFirestoreLinks: (links: LinkItem[]) => void;
  setFirestoreSyncState: (
    status: FirestoreSyncStatus,
    error?: string | null
  ) => void;
  // 프로필 & 테마 액션
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setTheme: (theme: ThemeId) => void;
  // 링크 CRUD 및 정렬 액션
  updateLink: (id: string, input: UpdateUserLinkInput) => Promise<LinkItem>;
  addLink: (link: Omit<LinkItem, "id" | "order">) => Promise<LinkItem>;
  deleteLink: (id: string) => Promise<void>;
  toggleLink: (id: string) => void;
  toggleLinkActive: (id: string) => void;
  reorderLinks: (sourceIndex: number, destinationIndex: number) => void;
  // 애널리틱스 트래킹 액션
  recordPageView: () => void;
  recordLinkClick: (linkId: string) => void;
  resetAnalytics: () => void;
  resetToDefault: () => void;
}

function requireAuthenticatedUid(get: () => ProfileStore): string {
  const uid = get().authUser?.uid;
  if (!uid) {
    throw new Error("로그인이 필요합니다. Google 계정으로 먼저 로그인해 주세요.");
  }
  return uid;
}

function toggleLinkState(
  set: StoreSet,
  get: () => ProfileStore,
  id: string
) {
  const state = get();
  const uid = state.authUser?.uid;
  if (!uid || state.updatingLinkIds.includes(id)) return;

  const target = state.firestoreLinks.find((link) => link.id === id);
  if (!target) return;

  const nextIsActive = !target.isActive;
  const previousUpdatedAt = target.updatedAt;
  const optimisticUpdatedAt = Date.now();
  const linksPath = getUserLinksPath(uid);

  set((current) => {
    const nextFirestoreLinks = current.firestoreLinks.map((link) =>
      link.id === id
        ? { ...link, isActive: nextIsActive, updatedAt: optimisticUpdatedAt }
        : link
    );
    return {
      firestoreLinks: nextFirestoreLinks,
      updatingLinkIds: [...current.updatingLinkIds, id],
      profile: {
        ...current.profile,
        links: sortLinksByCreatedAtDesc(nextFirestoreLinks),
      },
    };
  });

  void updateUserLinkActive(uid, id, nextIsActive)
    .catch((error) => {
      if (get().authUser?.uid !== uid) return;

      // Firestore 업데이트 실패 시 상태를 원복합니다.
      set((current) => {
        const revertedFirestoreLinks = current.firestoreLinks.map((link) =>
          link.id === id
            ? { ...link, isActive: !nextIsActive, updatedAt: previousUpdatedAt }
            : link
        );
        return {
          firestoreLinks: revertedFirestoreLinks,
          firestoreStatus: "error",
          firestoreError: getFirestoreErrorMessage(error, linksPath),
          profile: {
            ...current.profile,
            links: sortLinksByCreatedAtDesc(revertedFirestoreLinks),
          },
        };
      });
    })
    .finally(() => {
      set((current) => ({
        updatingLinkIds: current.updatingLinkIds.filter(
          (itemId) => itemId !== id
        ),
      }));
    });
}

export const useProfileStore = create<ProfileStore>()((set, get) => ({
  authStatus: "loading",
  authUser: null,
  isAuthSubmitting: false,
  authError: null,
  profile: DEFAULT_PROFILE,
  customProfile: null,
  isProfileLoading: false,
  profileError: null,
  firestoreLinks: [],
  firestoreStatus: "idle",
  firestoreError: null,
  isRefreshingLinks: false,
  updatingLinkIds: [],

  setAuthState: (status, user) => {
    set((state) => {
      if (status === "unauthenticated" || !user) {
        latestLoadRequestId += 1;
        latestProfileRequestId += 1;
        return {
          authStatus: status,
          authUser: null,
          customProfile: null,
          isProfileLoading: false,
          profileError: null,
          firestoreLinks: [],
          firestoreStatus: "idle",
          firestoreError: null,
          isRefreshingLinks: false,
          updatingLinkIds: [],
          profile: buildProfileForAuthUser(null, [], state.profile.analytics),
        };
      }

      const isSameUser = state.authUser?.uid === user.uid;
      const nextLinks = isSameUser ? state.firestoreLinks : [];
      const nextCustomProfile = isSameUser ? state.customProfile : null;
      if (!isSameUser) {
        latestLoadRequestId += 1;
        latestProfileRequestId += 1;
      }

      return {
        authStatus: status,
        authUser: user,
        authError: null,
        customProfile: nextCustomProfile,
        isProfileLoading: isSameUser ? state.isProfileLoading : false,
        profileError: isSameUser ? state.profileError : null,
        firestoreLinks: nextLinks,
        firestoreStatus: isSameUser ? state.firestoreStatus : "idle",
        firestoreError: isSameUser ? state.firestoreError : null,
        updatingLinkIds: isSameUser ? state.updatingLinkIds : [],
        profile: buildProfileForAuthUser(
          user,
          nextLinks,
          state.profile.analytics,
          nextCustomProfile
        ),
      };
    });
  },

  signInWithGoogleAction: async () => {
    if (get().isAuthSubmitting) return null;

    set({
      isAuthSubmitting: true,
      authError: null,
    });

    try {
      const user = await signInWithGoogle();
      set((state) => {
        const isSameUser = state.authUser?.uid === user.uid;
        const nextLinks = isSameUser ? state.firestoreLinks : [];
        const nextCustomProfile = isSameUser ? state.customProfile : null;
        return {
          authStatus: "authenticated",
          authUser: user,
          isAuthSubmitting: false,
          authError: null,
          customProfile: nextCustomProfile,
          profile: buildProfileForAuthUser(
            user,
            nextLinks,
            state.profile.analytics,
            nextCustomProfile
          ),
        };
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
      latestLoadRequestId += 1;
      latestProfileRequestId += 1;
      set((state) => ({
        authStatus: "unauthenticated",
        authUser: null,
        isAuthSubmitting: false,
        authError: null,
        customProfile: null,
        isProfileLoading: false,
        profileError: null,
        firestoreLinks: [],
        firestoreStatus: "idle",
        firestoreError: null,
        isRefreshingLinks: false,
        updatingLinkIds: [],
        profile: buildProfileForAuthUser(null, [], state.profile.analytics),
      }));
    } catch (error) {
      set({
        isAuthSubmitting: false,
        authError: getAuthErrorMessage(error),
      });
    }
  },

  clearAuthError: () => set({ authError: null }),

  loadFirestoreProfile: async (uid) => {
    const targetUid = uid ?? get().authUser?.uid;
    if (!targetUid) {
      latestProfileRequestId += 1;
      set((state) => ({
        customProfile: null,
        isProfileLoading: false,
        profileError: null,
        profile: buildProfileForAuthUser(
          state.authUser,
          state.firestoreLinks,
          state.profile.analytics,
          null
        ),
      }));
      return;
    }

    const requestId = ++latestProfileRequestId;
    const profilePath = getUserProfilePath(targetUid);
    set({
      isProfileLoading: true,
      profileError: null,
    });

    try {
      const fetchedProfile = await fetchUserProfile(targetUid);
      if (
        requestId !== latestProfileRequestId ||
        get().authUser?.uid !== targetUid
      ) {
        return;
      }

      set((state) => ({
        customProfile: fetchedProfile,
        isProfileLoading: false,
        profileError: null,
        profile: buildProfileForAuthUser(
          state.authUser,
          state.firestoreLinks,
          state.profile.analytics,
          fetchedProfile
        ),
      }));
    } catch (error) {
      if (
        requestId !== latestProfileRequestId ||
        get().authUser?.uid !== targetUid
      ) {
        return;
      }

      set({
        isProfileLoading: false,
        profileError: getProfileFirestoreErrorMessage(error, profilePath),
      });
    }
  },

  saveProfile: async (input) => {
    const uid = requireAuthenticatedUid(get);
    const currentState = get();
    const currentAuthUser = currentState.authUser;
    const currentCustomProfile = currentState.customProfile;

    const cleanedDisplayName = sanitizeDisplayName(input.displayName);
    const cleanedBio = input.bio.trim();
    const cleanedAvatarUrl = input.avatarUrl.trim();

    if (
      currentCustomProfile &&
      currentCustomProfile.displayName === cleanedDisplayName &&
      currentCustomProfile.bio === cleanedBio &&
      currentCustomProfile.avatarUrl === cleanedAvatarUrl
    ) {
      return currentCustomProfile;
    }

    const saved = await saveUserProfile(uid, {
      ...input,
      email: currentAuthUser?.email ?? null,
    });

    set((state) => {
      const nextAuthUser = state.authUser
        ? { ...state.authUser, displayName: saved.displayName }
        : null;
      return {
        authUser: nextAuthUser,
        customProfile: saved,
        profileError: null,
        profile: buildProfileForAuthUser(
          nextAuthUser,
          state.firestoreLinks,
          state.profile.analytics,
          saved
        ),
      };
    });

    return saved;
  },

  loadFirestoreLinks: async (uid) => {
    const targetUid = uid ?? get().authUser?.uid;
    if (!targetUid) {
      latestLoadRequestId += 1;
      set((state) => ({
        firestoreLinks: [],
        firestoreStatus: "idle",
        firestoreError: null,
        isRefreshingLinks: false,
        profile: {
          ...state.profile,
          links: [],
        },
      }));
      return;
    }

    const requestId = ++latestLoadRequestId;
    const linksPath = getUserLinksPath(targetUid);
    set({
      firestoreStatus: "syncing",
      firestoreError: null,
      isRefreshingLinks: true,
    });

    try {
      const links = await fetchUserLinks(targetUid);
      if (
        requestId !== latestLoadRequestId ||
        get().authUser?.uid !== targetUid
      ) {
        return;
      }

      const sortedLinks = sortLinksByCreatedAtDesc(links);
      set((state) => ({
        firestoreLinks: sortedLinks,
        firestoreStatus: "connected",
        firestoreError: null,
        isRefreshingLinks: false,
        profile: {
          ...state.profile,
          links: sortedLinks,
        },
      }));
    } catch (error) {
      if (
        requestId !== latestLoadRequestId ||
        get().authUser?.uid !== targetUid
      ) {
        return;
      }

      set({
        firestoreStatus: "error",
        firestoreError: getFirestoreErrorMessage(error, linksPath),
        isRefreshingLinks: false,
      });
    }
  },

  setFirestoreLinks: (links) => {
    const sortedLinks = sortLinksByCreatedAtDesc(links);
    set((state) => ({
      firestoreLinks: sortedLinks,
      firestoreStatus: "connected",
      firestoreError: null,
      profile: {
        ...state.profile,
        links: sortedLinks,
      },
    }));
  },

  setFirestoreSyncState: (status, error = null) =>
    set({
      firestoreStatus: status,
      firestoreError: error,
    }),

  setProfile: (newProfile) => set({ profile: newProfile }),

  updateProfile: (partial) =>
    set((state) => ({
      profile: { ...state.profile, ...partial },
    })),

  setTheme: (theme) =>
    set((state) => ({
      profile: { ...state.profile, theme },
    })),

  updateLink: async (id, input) => {
    const uid = requireAuthenticatedUid(get);
    const linksPath = getUserLinksPath(uid);
    const state = get();
    const target = state.firestoreLinks.find((link) => link.id === id);
    if (!target) {
      throw new Error("수정할 Firestore 링크 문서를 찾을 수 없습니다.");
    }

    set((current) => ({
      firestoreStatus: "syncing",
      firestoreError: null,
      isRefreshingLinks: true,
      updatingLinkIds: current.updatingLinkIds.includes(id)
        ? current.updatingLinkIds
        : [...current.updatingLinkIds, id],
    }));

    const buttonText = input.buttonText.trim() || "Open Link";
    const icon = input.icon || "globe";

    const updatedLink: LinkItem = {
      ...target,
      title: input.title,
      url: input.url,
      displayUrl: input.displayUrl,
      description: input.description,
      buttonText,
      icon,
      isActive: input.isActive,
      updatedAt: Date.now(),
    };

    try {
      await updateUserLink(uid, id, {
        ...input,
        buttonText,
        icon,
      });
    } catch (error) {
      set((current) => ({
        firestoreStatus: "error",
        firestoreError: getFirestoreErrorMessage(error, linksPath),
        isRefreshingLinks: false,
        updatingLinkIds: current.updatingLinkIds.filter(
          (itemId) => itemId !== id
        ),
      }));
      throw error;
    }

    try {
      await refreshLinksAfterMutation(
        uid,
        set,
        get,
        (refreshedLinks) =>
          refreshedLinks.some((item) => item.id === id)
            ? refreshedLinks
            : upsertLinkById(refreshedLinks, updatedLink),
        (currentLinks) =>
          currentLinks.map((link) => (link.id === id ? updatedLink : link))
      );
    } finally {
      set((current) => ({
        updatingLinkIds: current.updatingLinkIds.filter(
          (itemId) => itemId !== id
        ),
      }));
    }

    return updatedLink;
  },

  addLink: async (newLink) => {
    const uid = requireAuthenticatedUid(get);
    const linksPath = getUserLinksPath(uid);
    const currentLinks = get().profile.links;
    const nextOrder =
      currentLinks.reduce((max, item) => Math.max(max, item.order), 0) + 1;
    const endpointLabel =
      newLink.endpointLabel ??
      `ENDPOINT ${String(nextOrder).padStart(2, "0")}`;

    set({
      firestoreStatus: "syncing",
      firestoreError: null,
      isRefreshingLinks: true,
    });

    let created: LinkItem;
    try {
      created = await createUserLink(uid, {
        title: newLink.title,
        url: newLink.url ?? "",
        displayUrl: newLink.displayUrl ?? "",
        endpointLabel,
        description: newLink.description,
        buttonText: newLink.buttonText,
        icon: newLink.icon ?? "globe",
        isActive: newLink.isActive,
        order: nextOrder,
        clicks: newLink.clicks ?? 0,
      });
    } catch (error) {
      set({
        firestoreStatus: "error",
        firestoreError: getFirestoreErrorMessage(error, linksPath),
        isRefreshingLinks: false,
      });
      throw error;
    }

    await refreshLinksAfterMutation(
      uid,
      set,
      get,
      (refreshedLinks) =>
        refreshedLinks.some((item) => item.id === created.id)
          ? refreshedLinks
          : [created, ...refreshedLinks],
      (currentLinks) => upsertLinkById(currentLinks, created)
    );

    return created;
  },

  deleteLink: async (id) => {
    const uid = requireAuthenticatedUid(get);
    const linksPath = getUserLinksPath(uid);
    const state = get();
    if (state.updatingLinkIds.includes(id)) return;

    const isFirestoreDoc = state.firestoreLinks.some((link) => link.id === id);
    if (!isFirestoreDoc) {
      throw new Error("삭제할 Firestore 링크 문서를 찾을 수 없습니다.");
    }

    set((current) => ({
      firestoreStatus: "syncing",
      firestoreError: null,
      isRefreshingLinks: true,
      updatingLinkIds: [...current.updatingLinkIds, id],
    }));

    try {
      await deleteUserLink(uid, id);
    } catch (error) {
      set((current) => ({
        firestoreStatus: "error",
        firestoreError: getFirestoreErrorMessage(error, linksPath),
        isRefreshingLinks: false,
        updatingLinkIds: current.updatingLinkIds.filter(
          (itemId) => itemId !== id
        ),
      }));
      throw error;
    }

    try {
      await refreshLinksAfterMutation(
        uid,
        set,
        get,
        (refreshedLinks) => refreshedLinks.filter((link) => link.id !== id),
        (currentLinks) => currentLinks.filter((link) => link.id !== id)
      );
    } finally {
      set((current) => ({
        updatingLinkIds: current.updatingLinkIds.filter(
          (itemId) => itemId !== id
        ),
      }));
    }
  },

  toggleLink: (id) => toggleLinkState(set, get, id),

  toggleLinkActive: (id) => toggleLinkState(set, get, id),

  reorderLinks: (sourceIndex, destinationIndex) =>
    set((state) => {
      const ordered = [...state.profile.links].sort(
        (a, b) => a.order - b.order
      );
      if (
        sourceIndex < 0 ||
        destinationIndex < 0 ||
        sourceIndex >= ordered.length ||
        destinationIndex >= ordered.length ||
        sourceIndex === destinationIndex
      ) {
        return state;
      }
      const [moved] = ordered.splice(sourceIndex, 1);
      ordered.splice(destinationIndex, 0, moved);
      const reindexed = ordered.map((link, index) => ({
        ...link,
        order: index + 1,
      }));
      return {
        profile: {
          ...state.profile,
          links: reindexed,
        },
      };
    }),

  recordPageView: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        analytics: updateDailyHistory(state.profile.analytics, 1, 0),
      },
    })),

  recordLinkClick: (linkId) => {
    const uid = get().authUser?.uid;
    if (!uid) return;

    const isFirestoreDoc = get().firestoreLinks.some(
      (link) => link.id === linkId
    );
    if (!isFirestoreDoc) return;

    const linksPath = getUserLinksPath(uid);

    set((state) => {
      const nextFirestoreLinks = sortLinksByCreatedAtDesc(
        state.firestoreLinks.map((link) =>
          link.id === linkId
            ? { ...link, clicks: (link.clicks ?? 0) + 1 }
            : link
        )
      );
      return {
        firestoreLinks: nextFirestoreLinks,
        profile: {
          ...state.profile,
          links: nextFirestoreLinks,
          analytics: updateDailyHistory(state.profile.analytics, 0, 1),
        },
      };
    });

    void incrementUserLinkClicks(uid, linkId).catch((error) => {
      if (get().authUser?.uid !== uid) return;
      set({
        firestoreError: getFirestoreErrorMessage(error, linksPath),
      });
    });
  },

  resetAnalytics: () =>
    set((state) => {
      const nextFirestoreLinks = state.firestoreLinks.map((link) => ({
        ...link,
        clicks: 0,
      }));
      return {
        firestoreLinks: nextFirestoreLinks,
        profile: {
          ...state.profile,
          links: sortLinksByCreatedAtDesc(nextFirestoreLinks),
          analytics: {
            totalViews: 0,
            totalClicks: 0,
            dailyHistory: (state.profile.analytics?.dailyHistory ?? []).map(
              (entry) => ({ ...entry, views: 0, clicks: 0 })
            ),
          },
        },
      };
    }),

  resetToDefault: () =>
    set((state) => ({
      profile: buildProfileForAuthUser(
        state.authUser,
        state.firestoreLinks,
        state.profile.analytics,
        state.customProfile
      ),
    })),
}));
