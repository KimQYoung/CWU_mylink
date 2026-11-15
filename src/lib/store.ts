import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile, LinkItem } from "../types";
import { DUMMY_ANALYTICS, DUMMY_LINKS } from "./dummy-links";

export { DUMMY_ANALYTICS, DUMMY_LINKS };

const LEGACY_DEFAULT_LINK_IDS = ["link-github", "link-project", "link-contact"];

function isLegacyDefaultLinks(links: LinkItem[] | undefined): boolean {
  if (!Array.isArray(links) || links.length !== LEGACY_DEFAULT_LINK_IDS.length) {
    return false;
  }
  return links.every((link, index) => link.id === LEGACY_DEFAULT_LINK_IDS[index]);
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
  // 액션
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  updateLink: (id: string, partial: Partial<LinkItem>) => void;
  addLink: (link: Omit<LinkItem, "id" | "order">) => void;
  deleteLink: (id: string) => void;
  toggleLink: (id: string) => void;
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
            links: state.profile.links.filter((link) => link.id !== id),
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

      resetToDefault: () => set({ profile: DEFAULT_PROFILE }),
    }),
    {
      name: "mylink_profile_storage", // LocalStorage 키 이름
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown, version: number): ProfileStore => {
        const persisted = persistedState as Partial<ProfileStore> | null | undefined;
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
