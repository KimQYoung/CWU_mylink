import { cache } from "react";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchUserLinks, sortLinksByCreatedAtDesc } from "@/lib/firestore-links";
import { findUserByDisplayName } from "@/lib/firestore-profile";
import {
  normalizeDisplayNameKey,
  parseProfileAvatarUrl,
  sanitizeDisplayName,
} from "@/lib/schemas/profile";
import type { LinkItem } from "@/types";

/**
 * OG 이미지 규격 (1200x630)
 */
export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

/**
 * DESIGN.md 및 globals.css 기반 xAI Minimal Dark 디자인 토큰
 */
export const OG_COLORS = {
  canvas: "#0a0a0a",
  canvasSoft: "#1a1c20",
  canvasCard: "#191919",
  canvasFooter: "#141518",
  canvasMid: "#363a3f",
  hairline: "#212327",
  pillBorder: "rgba(255, 255, 255, 0.25)",
  ink: "#ffffff",
  body: "#dadbdf",
  bodyMid: "#7d8187",
  sunset: "#ff7a17",
  breeze: "#a0c3ec",
  twilight: "#c4b5fd",
  emerald: "#34d399",
  emeraldBg: "rgba(16, 185, 129, 0.12)",
  emeraldBorder: "rgba(52, 211, 153, 0.35)",
} as const;

export interface OgPreviewEndpoint {
  endpointLabel: string;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
}

export interface OgPublicProfileData {
  displayName: string;
  handle: string;
  bio: string;
  avatarDataUri: string | null;
  activeLinks: LinkItem[];
  previewLinks: OgPreviewEndpoint[];
  totalActiveCount: number;
  extraCount: number;
  totalClicks: number;
  isVerifiedUser: boolean;
}

const ACCENT_ROTATION = [
  OG_COLORS.sunset,
  OG_COLORS.breeze,
  OG_COLORS.twilight,
] as const;

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/svg+xml",
]);

const EXTENSION_TO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/**
 * URL 파라미터 문자열을 안전하게 디코딩합니다.
 */
export function safeDecodeParam(rawValue: string): string {
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

/**
 * 연속 공백을 정리하고 최대 길이를 초과하면 말줄임표(...)를 붙여 반환합니다.
 */
export function truncateText(value: string, maxLength: number): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || maxLength <= 0) {
    return "";
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  if (maxLength <= 3) {
    return normalized.slice(0, maxLength);
  }
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

/**
 * 비동기 작업이 지정 시간(ms)을 초과하면 안전하게 폴백 값을 반환합니다.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<T>((resolvePromise) => {
    timerId = setTimeout(() => {
      resolvePromise(fallback);
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch {
    return fallback;
  } finally {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
  }
}

/**
 * 로컬 정적 경로 또는 원격 아바타 URL을 Satori 호환 Base64 Data URI로 변환합니다.
 * 미지원 포맷(WebP 등)이나 네트워크/파일 오류 시 null을 반환하여 이니셜 폴백을 유도합니다.
 */
export async function resolveAvatarDataUri(
  avatarUrl?: string | null
): Promise<string | null> {
  const raw = avatarUrl?.trim() ?? "";
  if (!raw) {
    return null;
  }

  const parsed = parseProfileAvatarUrl(raw);
  if (!parsed.valid || !parsed.url) {
    return null;
  }

  const safeUrl = parsed.url;

  // 1) public/ 디렉토리 내 정적 이미지 파일 처리
  if (safeUrl.startsWith("/")) {
    try {
      const publicRoot = resolve(process.cwd(), "public");
      const relativePath = safeUrl.slice(1).split("?")[0] ?? "";
      const targetPath = resolve(join(publicRoot, relativePath));
      if (!targetPath.startsWith(publicRoot)) {
        return null;
      }

      const ext = extname(targetPath).toLowerCase();
      const mimeType = EXTENSION_TO_MIME[ext];
      if (!mimeType) {
        return null;
      }

      const fileBuffer = await readFile(targetPath);
      if (fileBuffer.byteLength === 0 || fileBuffer.byteLength > MAX_AVATAR_BYTES) {
        return null;
      }

      return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    } catch {
      return null;
    }
  }

  // 2) 원격 HTTP/HTTPS 이미지 fetch 처리
  if (safeUrl.startsWith("http://") || safeUrl.startsWith("https://")) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(safeUrl, {
        signal: controller.signal,
        headers: {
          Accept: "image/png,image/jpeg,image/gif;q=0.9,*/*;q=0.5",
        },
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        return null;
      }

      const contentTypeHeader = response.headers.get("content-type") ?? "";
      const mimeType = contentTypeHeader.split(";")[0]?.trim().toLowerCase();
      if (!mimeType || !SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      if (
        arrayBuffer.byteLength === 0 ||
        arrayBuffer.byteLength > MAX_AVATAR_BYTES
      ) {
        return null;
      }

      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return `data:${mimeType};base64,${base64}`;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

/**
 * URL 문자열에서 표시용 호스트/경로 문자열을 추출합니다.
 */
function formatEndpointSubtitle(link: LinkItem): string {
  if (link.isAction && link.actionType === "copy-email") {
    return "One-click Email Copy Action";
  }

  const candidate = link.displayUrl?.trim() || link.url?.trim() || "";
  if (!candidate) {
    return "Public Endpoint";
  }

  const stripped = candidate
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");

  return truncateText(stripped, 34);
}

/**
 * 활성 링크가 없는 경우 표시할 기본 프리뷰 엔드포인트 목록을 생성합니다.
 */
function buildFallbackPreviewEndpoints(displayName: string): OgPreviewEndpoint[] {
  const safeHandle = truncateText(displayName.toLowerCase(), 18) || "mylink";
  return [
    {
      endpointLabel: "ENDPOINT 01",
      title: "GitHub Repository",
      subtitle: `github.com/${safeHandle}`,
      icon: "github",
      accentColor: OG_COLORS.sunset,
    },
    {
      endpointLabel: "ENDPOINT 02",
      title: "Tech Blog & Notes",
      subtitle: "Engineering Log · Articles",
      icon: "book-open",
      accentColor: OG_COLORS.breeze,
    },
    {
      endpointLabel: "ENDPOINT 03",
      title: "Portfolio & Contact",
      subtitle: "Projects · Direct Email Copy",
      icon: "mail",
      accentColor: OG_COLORS.twilight,
    },
  ];
}

/**
 * 동적 경로(/[displayName])의 OG 이미지 및 메타데이터 생성을 위해
 * Firestore 사용자 프로필과 공개 링크 목록을 안전하게 조회합니다.
 */
export const resolvePublicProfileForOg = cache(
  async (rawDisplayName: string): Promise<OgPublicProfileData> => {
    const decoded = safeDecodeParam(rawDisplayName);
    const cleaned = sanitizeDisplayName(decoded);
    const normalizedKey = normalizeDisplayNameKey(cleaned);
    const fallbackName = cleaned || "MyLink User";

    const defaultBio = `${fallbackName}님의 개발자 링크 허브입니다. GitHub, 기술 블로그, 포트폴리오 및 주요 엔드포인트를 한곳에서 확인하세요.`;

    if (!normalizedKey || !isFirebaseConfigured()) {
      const previewLinks = buildFallbackPreviewEndpoints(fallbackName);
      return {
        displayName: fallbackName,
        handle: `@${fallbackName}`,
        bio: defaultBio,
        avatarDataUri: null,
        activeLinks: [],
        previewLinks,
        totalActiveCount: previewLinks.length,
        extraCount: 0,
        totalClicks: 0,
        isVerifiedUser: false,
      };
    }

    const resolvedUser = await withTimeout(
      findUserByDisplayName(cleaned),
      2500,
      null
    );

    if (!resolvedUser) {
      const previewLinks = buildFallbackPreviewEndpoints(fallbackName);
      return {
        displayName: fallbackName,
        handle: `@${fallbackName}`,
        bio: defaultBio,
        avatarDataUri: null,
        activeLinks: [],
        previewLinks,
        totalActiveCount: previewLinks.length,
        extraCount: 0,
        totalClicks: 0,
        isVerifiedUser: false,
      };
    }

    const [links, avatarDataUri] = await Promise.all([
      withTimeout(fetchUserLinks(resolvedUser.uid), 2500, []),
      withTimeout(
        resolveAvatarDataUri(resolvedUser.profile.avatarUrl),
        2000,
        null
      ),
    ]);

    const sortedActiveLinks = sortLinksByCreatedAtDesc(links).filter(
      (link) => link.isActive
    );
    const totalClicks = sortedActiveLinks.reduce(
      (sum, item) => sum + (item.clicks ?? 0),
      0
    );

    const effectiveName = resolvedUser.profile.displayName || fallbackName;
    const effectiveBio =
      resolvedUser.profile.bio?.trim() ||
      `${effectiveName}님의 개발자 링크 허브입니다. GitHub, 기술 블로그, 포트폴리오 및 주요 엔드포인트를 한곳에서 확인하세요.`;

    const previewLinks: OgPreviewEndpoint[] =
      sortedActiveLinks.length > 0
        ? sortedActiveLinks.slice(0, 3).map((link, index) => ({
            endpointLabel:
              link.endpointLabel?.trim() ||
              `ENDPOINT ${String(link.order || index + 1).padStart(2, "0")}`,
            title: truncateText(link.title, 26) || "Untitled Endpoint",
            subtitle: formatEndpointSubtitle(link),
            icon: link.icon || "globe",
            accentColor: ACCENT_ROTATION[index % ACCENT_ROTATION.length],
          }))
        : buildFallbackPreviewEndpoints(effectiveName);

    return {
      displayName: effectiveName,
      handle: `@${effectiveName}`,
      bio: effectiveBio,
      avatarDataUri,
      activeLinks: sortedActiveLinks,
      previewLinks,
      totalActiveCount:
        sortedActiveLinks.length > 0
          ? sortedActiveLinks.length
          : previewLinks.length,
      extraCount: Math.max(0, sortedActiveLinks.length - 3),
      totalClicks,
      isVerifiedUser: true,
    };
  }
);

interface OgLinkIconProps {
  icon?: string;
  color?: string;
  size?: number;
}

/**
 * Satori(next/og) 호환 인라인 SVG 아이콘 렌더러
 */
export function OgLinkIcon({
  icon,
  color = OG_COLORS.ink,
  size = 18,
}: OgLinkIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "1.7",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "github":
      return (
        <svg {...commonProps}>
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    case "code-2":
      return (
        <svg {...commonProps}>
          <path d="m18 16 4-4-4-4" />
          <path d="m6 8-4 4 4 4" />
          <path d="m14.5 4-5 16" />
        </svg>
      );
    case "book-open":
      return (
        <svg {...commonProps}>
          <path d="M12 7v14" />
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </svg>
      );
    case "layers":
      return (
        <svg {...commonProps}>
          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
          <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
          <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...commonProps}>
          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
      );
    case "mail":
      return (
        <svg {...commonProps}>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "archive":
      return (
        <svg {...commonProps}>
          <rect width="20" height="5" x="2" y="3" rx="1" />
          <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
          <path d="M10 12h4" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      );
  }
}

/**
 * Satori 호환 우상단 화살표(↗) SVG 아이콘
 */
export function OgArrowUpRightIcon({
  color = OG_COLORS.ink,
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}
