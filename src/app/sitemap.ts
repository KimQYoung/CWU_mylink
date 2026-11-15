import type { MetadataRoute } from "next";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  buildPublicProfileHref,
  fetchPublicDisplayNameEntries,
} from "@/lib/firestore-profile";
import { withTimeout } from "@/lib/og-utils";
import { getSiteUrl } from "@/lib/seo";

export const revalidate = 3600;

/**
 * 공개 페이지 및 등록된 사용자 공개 프로필 경로(`/[displayName]`)를 포함하는
 * `/sitemap.xml` 동적 생성기
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  if (!isFirebaseConfigured()) {
    return staticRoutes;
  }

  const publicUsers = await withTimeout(
    fetchPublicDisplayNameEntries(500),
    2500,
    []
  );

  const profileRoutes: MetadataRoute.Sitemap = [];
  for (const entry of publicUsers) {
    const profilePath = buildPublicProfileHref(entry.displayName);
    if (profilePath === "/") {
      continue;
    }

    profileRoutes.push({
      url: `${siteUrl}${profilePath}`,
      lastModified: entry.updatedAt ? new Date(entry.updatedAt) : now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  return [...staticRoutes, ...profileRoutes];
}
