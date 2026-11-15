import { create } from "zustand";
import {
  createAnonymousLink,
  deleteAnonymousLink,
  fetchAnonymousLinks,
  getFirestoreErrorMessage,
  incrementAnonymousLinkClicks,
  sortLinksByCreatedAtDesc,
  updateAnonymousLink,
  updateAnonymousLinkActive,
  type UpdateAnonymousLinkInput,
} from "./firestore-links";
import {
  AnalyticsSummary,
  LinkItem,
  ThemeId,
  UserProfile,
} from "../types";
import { DUMMY_ANALYTICS } from "./dummy-links";

export { DUMMY_ANALYTICS };

export type FirestoreSyncStatus = "idle" | "syncing" | "connected" | "error";

let latestLoadRequestId = 0;

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
  set: StoreSet,
  mergeRefreshedLinks: (refreshedLinks: LinkItem[]) => LinkItem[],
  applyLocalFallback: (currentLinks: LinkItem[]) => LinkItem[]
) {
  const requestId = ++latestLoadRequestId;
  try {
    const refreshedLinks = await fetchAnonymousLinks();
    if (requestId !== latestLoadRequestId) return;

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
    if (requestId !== latestLoadRequestId) return;

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

export const DEFAULT_PROFILE: UserProfile = {
  username: "KimQYoung",
  name: "Kim Kyu Young",
  callsign: "@KimQYoung",
  discipline: "Software Eng",
  status: "Deploying Vibe Code",
  headline:
    "Junior software engineer exploring frontier web architectures, AI workflows, and rapid system engineering.",
  statementLead: "아이디어를 코드로 실현하는 개발자 김규영입니다.",
  statementBody:
    "복잡한 문제를 단순하고 직관적인 코드로 풀어내는 과정을 지향합니다. 새로운 도구와 기술을 신속하게 습득하고, 실험을 통해 검증하며 함께 성장하는 엔지니어링 문화를 추구합니다.",
  avatarUrl: "/avatar.png",
  email: "103734455+KimQYoung@users.noreply.github.com",
  theme: "xai",
  capabilities: [
    {
      category: "CORE ARCHITECTURE",
      headline: "Full-Stack Web Systems",
      desc: "Next.js 16 (App Router), React 19, TypeScript. Engineered for performance and type-safe clarity.",
    },
    {
      category: "DESIGN & INTERACTION",
      headline: "Minimalist Interface Craft",
      desc: "Tailwind CSS, PostCSS. Sparse monochrome aesthetics, geometric typography, and hairline precision.",
    },
    {
      category: "ENGINEERING TOOLS",
      headline: "Version & Scripting Protocols",
      desc: "Git workflow, Python scripting, automated task pipelines, and agentic pair programming.",
    },
    {
      category: "EXPLORATION DOMAIN",
      headline: "Vibe Coding & AI Systems",
      desc: "Rapid generative iteration, AI-native workflows, and prototype acceleration.",
    },
  ],
  links: [],
  analytics: DUMMY_ANALYTICS,
};

interface ProfileStore {
  profile: UserProfile;
  firestoreLinks: LinkItem[];
  firestoreStatus: FirestoreSyncStatus;
  firestoreError: string | null;
  isRefreshingLinks: boolean;
  updatingLinkIds: string[];
  // Firestore 조회 및 상태 액션
  loadFirestoreLinks: () => Promise<void>;
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
  updateLink: (id: string, input: UpdateAnonymousLinkInput) => Promise<LinkItem>;
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

function toggleLinkState(
  set: (
    partial:
      | Partial<ProfileStore>
      | ((state: ProfileStore) => Partial<ProfileStore> | ProfileStore)
  ) => void,
  get: () => ProfileStore,
  id: string
) {
  const state = get();
  if (state.updatingLinkIds.includes(id)) return;

  const target = state.firestoreLinks.find((link) => link.id === id);
  if (!target) return;

  const nextIsActive = !target.isActive;

  set((current) => {
    const nextFirestoreLinks = current.firestoreLinks.map((link) =>
      link.id === id ? { ...link, isActive: nextIsActive } : link
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

  void updateAnonymousLinkActive(id, nextIsActive)
    .catch((error) => {
      // Firestore 업데이트 실패 시 상태를 원복합니다.
      set((current) => {
        const revertedFirestoreLinks = current.firestoreLinks.map((link) =>
          link.id === id ? { ...link, isActive: !nextIsActive } : link
        );
        return {
          firestoreLinks: revertedFirestoreLinks,
          firestoreStatus: "error",
          firestoreError: getFirestoreErrorMessage(error),
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
  profile: DEFAULT_PROFILE,
  firestoreLinks: [],
  firestoreStatus: "idle",
  firestoreError: null,
  isRefreshingLinks: false,
  updatingLinkIds: [],

  loadFirestoreLinks: async () => {
    const requestId = ++latestLoadRequestId;
    set({
      firestoreStatus: "syncing",
      firestoreError: null,
      isRefreshingLinks: true,
    });

    try {
      const links = await fetchAnonymousLinks();
      if (requestId !== latestLoadRequestId) return;

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
      if (requestId !== latestLoadRequestId) return;

      set({
        firestoreStatus: "error",
        firestoreError: getFirestoreErrorMessage(error),
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
    };

    try {
      await updateAnonymousLink(id, {
        ...input,
        buttonText,
        icon,
      });
    } catch (error) {
      set((current) => ({
        firestoreStatus: "error",
        firestoreError: getFirestoreErrorMessage(error),
        isRefreshingLinks: false,
        updatingLinkIds: current.updatingLinkIds.filter(
          (itemId) => itemId !== id
        ),
      }));
      throw error;
    }

    try {
      await refreshLinksAfterMutation(
        set,
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
      created = await createAnonymousLink({
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
        firestoreError: getFirestoreErrorMessage(error),
        isRefreshingLinks: false,
      });
      throw error;
    }

    await refreshLinksAfterMutation(
      set,
      (refreshedLinks) =>
        refreshedLinks.some((item) => item.id === created.id)
          ? refreshedLinks
          : [created, ...refreshedLinks],
      (currentLinks) => upsertLinkById(currentLinks, created)
    );

    return created;
  },

  deleteLink: async (id) => {
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
      await deleteAnonymousLink(id);
    } catch (error) {
      set((current) => ({
        firestoreStatus: "error",
        firestoreError: getFirestoreErrorMessage(error),
        isRefreshingLinks: false,
        updatingLinkIds: current.updatingLinkIds.filter(
          (itemId) => itemId !== id
        ),
      }));
      throw error;
    }

    try {
      await refreshLinksAfterMutation(
        set,
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
    const isFirestoreDoc = get().firestoreLinks.some(
      (link) => link.id === linkId
    );
    if (!isFirestoreDoc) return;

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

    void incrementAnonymousLinkClicks(linkId).catch((error) => {
      set({
        firestoreError: getFirestoreErrorMessage(error),
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
      profile: {
        ...DEFAULT_PROFILE,
        links: sortLinksByCreatedAtDesc(state.firestoreLinks),
      },
    })),
}));
