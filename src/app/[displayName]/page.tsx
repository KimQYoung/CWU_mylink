import type { Metadata } from "next";
import { resolvePublicProfileForOg, truncateText } from "@/lib/og-utils";
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
  const title = `${profileData.displayName} (@${profileData.displayName}) | 마이링크`;
  const description = truncateText(profileData.bio, 155);

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      locale: "ko_KR",
      siteName: "MyLink",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicDisplayNamePage({
  params,
}: PageProps<"/[displayName]">) {
  const { displayName } = await params;
  return <PublicProfileClient rawDisplayName={displayName} />;
}
