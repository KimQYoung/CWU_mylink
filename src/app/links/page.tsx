import { redirect } from "next/navigation";

/**
 * 기존 `/links` 경로 접근 시 링크 관리·통계 통합 페이지(`/stats`)로 리다이렉트합니다.
 */
export default function LinksRedirectPage() {
  redirect("/stats");
}
