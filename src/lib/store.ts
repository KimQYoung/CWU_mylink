import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile, LinkItem } from "../types";

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
  links: [
    {
      id: "link-github",
      endpointLabel: "ENDPOINT 01",
      displayUrl: "github.com/KimQYoung",
      title: "GitHub Repository & Telemetry",
      description: "Open-source contributions, public repositories, and commit activity logs.",
      url: "https://github.com/KimQYoung",
      buttonText: "Open GitHub ↗",
      isActive: true,
      order: 1,
    },
    {
      id: "link-project",
      endpointLabel: "ENDPOINT 02",
      displayUrl: "CWU_mylink",
      title: "CWU_mylink Source Protocol",
      description: "Next.js 16 full-stack profile implementation engineered according to xAI design language specifications.",
      url: "https://github.com/KimQYoung/CWU_mylink",
      buttonText: "View Source ↗",
      isActive: true,
      order: 2,
    },
    {
      id: "link-contact",
      endpointLabel: "ENDPOINT 03",
      displayUrl: "Direct Communication",
      title: "Direct Communication",
      description: "For technical queries, architecture discussions, or collaboration inquiries.",
      buttonText: "Copy Address",
      isAction: true,
      actionType: "copy-email",
      isActive: true,
      order: 3,
    },
  ],
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
                { ...newLink, id, order: nextOrder },
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
      storage: createJSONStorage(() => localStorage),
    }
  )
);
