import type { Metadata } from "next";
import {
  createPageMetadata,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_KEYWORDS,
} from "@/lib/seo";
import { HomeClient } from "./home-client";

export const metadata: Metadata = createPageMetadata({
  title: { absolute: SITE_DEFAULT_TITLE },
  socialTitle: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
  path: "/",
  keywords: [
    ...SITE_KEYWORDS,
    "개발자 포트폴리오",
    "개인 프로필 URL",
    "Google 로그인",
  ],
});

/**
 * 루트(`/`) 메인 페이지 엔트리포인트
 */
export default function HomePage() {
  return <HomeClient />;
}
