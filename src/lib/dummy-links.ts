import { AnalyticsSummary, LinkItem } from "../types";

/**
 * 마이링크(MyLink) 기본 링크 목록 더미 데이터
 * - PRD v1.2.0 사용자 시나리오(개발자 포트폴리오, 클릭 성과 분석, 링크 활성화 토글) 및
 *   DESIGN.md(xAI Minimal Dark) 톤앤매너를 반영한 목업 데이터입니다.
 */
export const DUMMY_LINKS: LinkItem[] = [
  {
    id: "link-github",
    endpointLabel: "ENDPOINT 01",
    displayUrl: "github.com/KimQYoung",
    title: "GitHub Repository & Telemetry",
    description:
      "Open-source contributions, public repositories, and real-time engineering commit logs.",
    url: "https://github.com/KimQYoung",
    buttonText: "Open GitHub ↗",
    icon: "github",
    isActive: true,
    order: 1,
    clicks: 214,
  },
  {
    id: "link-project-mylink",
    endpointLabel: "ENDPOINT 02",
    displayUrl: "github.com/KimQYoung/CWU_mylink",
    title: "CWU_mylink Source Protocol",
    description:
      "Next.js 16 & Zustand profile builder engineered with xAI Minimal Dark design specifications.",
    url: "https://github.com/KimQYoung/CWU_mylink",
    buttonText: "View Source ↗",
    icon: "code-2",
    isActive: true,
    order: 2,
    clicks: 168,
  },
  {
    id: "link-portfolio",
    endpointLabel: "ENDPOINT 03",
    displayUrl: "notion.so/kimqyoung-portfolio",
    title: "System Architecture & Portfolio",
    description:
      "Full-stack web architecture case studies, troubleshooting notes, and system design docs.",
    url: "https://notion.so/kimqyoung-portfolio",
    buttonText: "Read Dossier ↗",
    icon: "layers",
    isActive: true,
    order: 3,
    clicks: 132,
  },
  {
    id: "link-blog",
    endpointLabel: "ENDPOINT 04",
    displayUrl: "velog.io/@kimqyoung",
    title: "Engineering Log & Vibe Coding Notes",
    description:
      "Technical essays on Next.js App Router, AI agent workflows, and rapid prototyping experiments.",
    url: "https://velog.io/@kimqyoung",
    buttonText: "Read Articles ↗",
    icon: "book-open",
    isActive: true,
    order: 4,
    clicks: 95,
  },
  {
    id: "link-linkedin",
    endpointLabel: "ENDPOINT 05",
    displayUrl: "linkedin.com/in/kimqyoung",
    title: "LinkedIn Professional Profile",
    description:
      "Engineering background, project milestones, and technical networking channel.",
    url: "https://www.linkedin.com/in/kimqyoung",
    buttonText: "Connect ↗",
    icon: "briefcase",
    isActive: true,
    order: 5,
    clicks: 54,
  },
  {
    id: "link-contact",
    endpointLabel: "ENDPOINT 06",
    displayUrl: "Direct Communication",
    title: "Direct Communication",
    description:
      "For technical queries, architecture discussions, or collaboration inquiries.",
    buttonText: "Copy Address",
    icon: "mail",
    isAction: true,
    actionType: "copy-email",
    isActive: true,
    order: 6,
    clicks: 41,
  },
  {
    id: "link-archive-hackathon",
    endpointLabel: "ENDPOINT 07",
    displayUrl: "vibe-hackathon-demo.vercel.app",
    title: "2026 AI Vibe Coding Hackathon Demo",
    description:
      "Archived prototype demo (hidden from public view — toggle active state in builder to preview).",
    url: "https://vibe-hackathon-demo.vercel.app",
    buttonText: "Launch Demo ↗",
    icon: "archive",
    isActive: false,
    order: 7,
    clicks: 76,
  },
];

/**
 * 최근 7일간의 프로필 조회수 및 링크 클릭수 더미 통계 데이터
 * (dailyHistory 클릭 합계 780 = DUMMY_LINKS clicks 총합 780)
 */
export const DUMMY_ANALYTICS: AnalyticsSummary = {
  totalViews: 1950,
  totalClicks: 780,
  dailyHistory: [
    { date: "2026-11-09", views: 195, clicks: 72 },
    { date: "2026-11-10", views: 230, clicks: 88 },
    { date: "2026-11-11", views: 385, clicks: 162 },
    { date: "2026-11-12", views: 310, clicks: 124 },
    { date: "2026-11-13", views: 255, clicks: 98 },
    { date: "2026-11-14", views: 270, clicks: 110 },
    { date: "2026-11-15", views: 305, clicks: 126 },
  ],
};
