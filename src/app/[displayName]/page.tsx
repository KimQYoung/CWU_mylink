import type { Metadata } from "next";
import { buildPublicProfileHref } from "@/lib/firestore-profile";
import { resolvePublicProfileForOg, truncateText } from "@/lib/og-utils";
import { createPageMetadata } from "@/lib/seo";
import { PublicProfileClient } from "./public-profile-client";

/**
 * 동적 공개 프로필 경로(/[displayName])의 SEO 및 소셜 공유 메타데이터를 생성합니다.
 * openGraph.images는 동일 세그먼트의 opengraph-image.tsx가 자동 바인딩되도록 비워 둡니다.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[displayName]">): Promise<Metadata> {
  const { displayName } = await params;
  const profileData = await resolvePublicProfileForOg(displayName);
  const pageTitle = `${profileData.displayName} (@${profileData.displayName})`;
  const socialTitle = `${pageTitle} | 마이링크`;
  const description = truncateText(profileData.bio, 155);
  const profilePath = buildPublicProfileHref(profileData.displayName);

  return createPageMetadata({
    title: pageTitle,
    socialTitle,
    description,
    path: profilePath,
    keywords: [
      profileData.displayName,
      `@${profileData.displayName}`,
      "마이링크",
      "MyLink",
      "개발자 프로필",
      "링크 허브",
    ],
    openGraphType: "profile",
    username: profileData.displayName,
  });
}

export default async function PublicDisplayNamePage({
  params,
}: PageProps<"/[displayName]">) {
  const { displayName } = await params;
  return <PublicProfileClient rawDisplayName={displayName} />;
}
