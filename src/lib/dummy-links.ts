import { AnalyticsSummary } from "../types";

/**
 * 최근 7일간의 프로필 조회수 및 링크 클릭수 기본 통계 데이터
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
