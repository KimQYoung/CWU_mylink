import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AnalyticsSummary,
  LinkItem,
  ThemeId,
  UserProfile,
} from "../types";
import { DUMMY_ANALYTICS, DUMMY_LINKS } from "./dummy-links";

export { DUMMY_ANALYTICS, DUMMY_LINKS };

const LEGACY_DEFAULT_LINK_IDS = ["link-github", "link-project", "link-contact"];

function isLegacyDefaultLinks(links: LinkItem[] | undefined): boolean {
  if (!Array.isArray(links) || links.length !== LEGACY_DEFAULT_LINK_IDS.length) {
    return false;
  }
  return links.every((link, index) => link.id === LEGACY_DEFAULT_LINK_IDS[index]);
}

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

  // Keep up to the most recent 14 days
  const trimmedHistory = history.slice(-14);

  return {
    totalViews: (base.totalViews ?? 0) + deltaViews,
    totalClicks: (base.totalClicks ?? 0) + deltaClicks,
    dailyHistory: trimmedHistory,
  };
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
  links: DUMMY_LINKS,
  analytics: DUMMY_ANALYTICS,
};

interface ProfileStore {
  profile: UserProfile;
  // 프로필 & 테마 액션
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setTheme: (theme: ThemeId) => void;
  // 링크 CRUD 및 정렬 액션
  updateLink: (id: string, partial: Partial<LinkItem>) => void;
  addLink: (link: Omit<LinkItem, "id" | "order">) => void;
  deleteLink: (id: string) => void;
  toggleLink: (id: string) => void;
  toggleLinkActive: (id: string) => void;
  reorderLinks: (sourceIndex: number, destinationIndex: number) => void;
  // 애널리틱스 트래킹 액션
  recordPageView: () => void;
  recordLinkClick: (linkId: string) => void;
  resetAnalytics: () => void;
  resetToDefault: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,

      setProfile: (newProfile) => set({ profile: newProfile }),

      updateProfile: (partial) =>
        set((state) => ({
          profile: { ...state.profile, ...partial },
        })),

      setTheme: (theme) =>
        set((state) => ({
          profile: { ...state.profile, theme },
        })),

      updateLink: (id, partial) =>
        set((state) => ({
          profile: {
            ...state.profile,
            links: state.profile.links.map((link) =>
              link.id === id ? { ...link, ...partial } : link
            ),
          },
        })),

      addLink: (newLink) =>
        set((state) => {
          const nextOrder = state.profile.links.length + 1;
          const id = `link-${Date.now()}`;
          return {
            profile: {
              ...state.profile,
              links: [
                ...state.profile.links,
                {
                  ...newLink,
                  id,
                  order: nextOrder,
                  clicks: newLink.clicks ?? 0,
                },
              ],
            },
          };
        }),

      deleteLink: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            links: state.profile.links
              .filter((link) => link.id !== id)
              .map((link, index) => ({ ...link, order: index + 1 })),
          },
        })),

      toggleLink: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            links: state.profile.links.map((link) =>
              link.id === id ? { ...link, isActive: !link.isActive } : link
            ),
          },
        })),

      toggleLinkActive: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            links: state.profile.links.map((link) =>
              link.id === id ? { ...link, isActive: !link.isActive } : link
            ),
          },
        })),

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

      recordLinkClick: (linkId) =>
        set((state) => ({
          profile: {
            ...state.profile,
            links: state.profile.links.map((link) =>
              link.id === linkId
                ? { ...link, clicks: (link.clicks ?? 0) + 1 }
                : link
            ),
            analytics: updateDailyHistory(state.profile.analytics, 0, 1),
          },
        })),

      resetAnalytics: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            links: state.profile.links.map((link) => ({ ...link, clicks: 0 })),
            analytics: {
              totalViews: 0,
              totalClicks: 0,
              dailyHistory: (state.profile.analytics?.dailyHistory ?? []).map(
                (entry) => ({ ...entry, views: 0, clicks: 0 })
              ),
            },
          },
        })),

      resetToDefault: () => set({ profile: DEFAULT_PROFILE }),
    }),
    {
      name: "mylink_profile_storage", // LocalStorage 키 이름
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown, version: number): ProfileStore => {
        const persisted = persistedState as
          | Partial<ProfileStore>
          | null
          | undefined;
        if (!persisted?.profile) {
          return { profile: DEFAULT_PROFILE } as ProfileStore;
        }

        if (version < 2) {
          const existingProfile = persisted.profile;
          const useNewDummyLinks =
            !Array.isArray(existingProfile.links) ||
            existingProfile.links.length === 0 ||
            isLegacyDefaultLinks(existingProfile.links);

          return {
            ...persisted,
            profile: {
              ...DEFAULT_PROFILE,
              ...existingProfile,
              links: useNewDummyLinks
                ? DUMMY_LINKS
                : existingProfile.links.map((link) => ({
                    ...link,
                    clicks: link.clicks ?? 0,
                  })),
              analytics: existingProfile.analytics ?? DUMMY_ANALYTICS,
            },
          } as ProfileStore;
        }

        return persisted as ProfileStore;
      },
    }
  )
);
