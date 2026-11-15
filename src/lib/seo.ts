import type { Metadata } from "next";

export const SITE_NAME = "MyLink";
export const SITE_BRAND_KR = "마이링크";
export const SITE_DEFAULT_TITLE =
  "마이링크 (MyLink) — 개발자를 위한 개인 링크 허브";
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_BRAND_KR}`;
export const SITE_DEFAULT_DESCRIPTION =
  "GitHub, 기술 블로그, 포트폴리오, 이메일 복사까지. 흩어진 개발자의 링크를 단 하나의 엔드포인트로 연결하고 클릭 통계를 확인하세요.";
export const SITE_KEYWORDS = [
  "마이링크",
  "MyLink",
  "개발자 링크 허브",
  "포트폴리오 링크",
  "링크 모음",
  "링크트리",
  "프로필 링크",
  "클릭 통계",
];

/**
 * 배포 환경 변수로부터 Next.js metadataBase URL을 안전하게 생성합니다.
 */
export function resolveMetadataBase(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;

    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    try {
      return new URL(normalized);
    } catch {
      continue;
    }
  }

  return new URL("http://localhost:3000");
}

/**
 * canonical URL 및 robots/sitemap 생성에 사용할 기준 사이트 Origin을 반환합니다.
 */
export function getSiteUrl(): string {
  return resolveMetadataBase().origin;
}

export interface CreatePageMetadataOptions {
  /** 페이지 문서 `<title>` 값 (템플릿 무시 시 `{ absolute: ... }` 전달) */
  title: NonNullable<Metadata["title"]>;
  /** Open Graph 및 Twitter 카드에 표시할 전체 제목 */
  socialTitle?: string;
  /** 검색 엔진 및 소셜 미리보기용 페이지 설명 */
  description: string;
  /** 현재 페이지 경로 (Open Graph URL 및 기본 canonical 경로로 사용) */
  path: string;
  /** 별도의 canonical 경로를 지정할 때 사용 (리다이렉트 페이지 등) */
  canonicalPath?: string;
  /** 페이지별 SEO 키워드 목록 */
  keywords?: string[];
  /** Open Graph 타입 (`website` 또는 공개 프로필용 `profile`) */
  openGraphType?: "website" | "profile";
  /** `openGraphType`이 `profile`일 때 포함할 사용자 핸들 */
  username?: string;
  /** 인증 전용·리다이렉트 등 검색 노출에서 제외할 페이지 여부 */
  noIndex?: boolean;
  /** 세그먼트 전용 opengraph-image가 없을 때 루트 기본 OG 이미지를 명시적으로 연결할지 여부 */
  useDefaultOgImage?: boolean;
}

const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "MyLink — Development in One Link",
} as const;

/**
 * 각 페이지별 SEO 메타데이터(title, description, canonical, robots, Open Graph, Twitter)를
 * 일관된 형식으로 생성하는 공용 헬퍼입니다.
 * - 세그먼트 자체 `opengraph-image.tsx`가 있는 경로(`/`, `/[displayName]`)는 `useDefaultOgImage`를 비활성화해 자동 바인딩을 유지합니다.
 */
export function createPageMetadata({
  title,
  socialTitle,
  description,
  path,
  canonicalPath,
  keywords,
  openGraphType = "website",
  username,
  noIndex = false,
  useDefaultOgImage = false,
}: CreatePageMetadataOptions): Metadata {
  const resolvedSocialTitle =
    socialTitle ??
    (typeof title === "string" ? `${title} | ${SITE_BRAND_KR}` : SITE_DEFAULT_TITLE);

  const sharedImages = useDefaultOgImage ? [DEFAULT_OG_IMAGE] : undefined;

  const openGraph: Metadata["openGraph"] =
    openGraphType === "profile"
      ? {
          type: "profile",
          locale: "ko_KR",
          siteName: SITE_NAME,
          url: path,
          title: resolvedSocialTitle,
          description,
          ...(username ? { username } : {}),
          ...(sharedImages ? { images: sharedImages } : {}),
        }
      : {
          type: "website",
          locale: "ko_KR",
          siteName: SITE_NAME,
          url: path,
          title: resolvedSocialTitle,
          description,
          ...(sharedImages ? { images: sharedImages } : {}),
        };

  return {
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: canonicalPath ?? path,
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: resolvedSocialTitle,
      description,
      ...(sharedImages ? { images: sharedImages } : {}),
    },
  };
}
