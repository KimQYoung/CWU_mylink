import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

/**
 * 검색 엔진 크롤러 정책 및 사이트맵 경로를 정의하는 `/robots.txt` 생성기
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/stats", "/links"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
