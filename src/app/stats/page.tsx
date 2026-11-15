import type { Metadata } from "next";
import { createPageMetadata, SITE_KEYWORDS } from "@/lib/seo";
import { StatsClient } from "./stats-client";

export const metadata: Metadata = createPageMetadata({
  title: "링크 관리 및 클릭 통계",
  socialTitle: "링크 관리 및 클릭 통계 | 마이링크",
  description:
    "등록된 링크 엔드포인트 관리, 공개 상태 전환, 검색·필터 및 링크별 클릭 통계를 한곳에서 확인하세요.",
  path: "/stats",
  keywords: [
    ...SITE_KEYWORDS,
    "링크 관리",
    "클릭 통계 대시보드",
    "링크 분석",
  ],
  noIndex: true,
  useDefaultOgImage: true,
});

/**
 * 링크 관리 및 클릭 통계 통합 대시보드(`/stats`) 페이지 엔트리포인트
 */
export default function StatsPage() {
  return <StatsClient />;
}
