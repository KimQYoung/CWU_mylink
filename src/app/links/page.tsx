import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "링크 관리 디렉토리",
  socialTitle: "링크 관리 디렉토리 | 마이링크",
  description:
    "링크 관리 및 클릭 통계 통합 대시보드(/stats)로 이동합니다.",
  path: "/links",
  canonicalPath: "/stats",
  keywords: [...SITE_KEYWORDS, "링크 목록", "링크 디렉토리"],
  noIndex: true,
  useDefaultOgImage: true,
});

/**
 * 기존 `/links` 경로 접근 시 링크 관리·통계 통합 페이지(`/stats`)로 리다이렉트합니다.
 */
export default function LinksRedirectPage() {
  redirect("/stats");
}
