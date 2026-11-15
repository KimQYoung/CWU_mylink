import { z } from "zod";
import type { LinkItem } from "@/types";

export const LINK_FIELD_LIMITS = {
  TITLE_MIN_LENGTH: 2,
  TITLE_MAX_LENGTH: 60,
  DESCRIPTION_MAX_LENGTH: 160,
  BUTTON_TEXT_MAX_LENGTH: 24,
} as const;

export const LINK_ICON_OPTIONS = [
  { id: "globe", label: "Web" },
  { id: "github", label: "GitHub" },
  { id: "code-2", label: "Code" },
  { id: "layers", label: "Portfolio" },
  { id: "book-open", label: "Blog" },
  { id: "briefcase", label: "Career" },
  { id: "mail", label: "Contact" },
  { id: "archive", label: "Archive" },
] as const;

export type LinkIconId = (typeof LINK_ICON_OPTIONS)[number]["id"];

const LINK_ICON_IDS = [
  "globe",
  "github",
  "code-2",
  "layers",
  "book-open",
  "briefcase",
  "mail",
  "archive",
] as const satisfies readonly [LinkIconId, ...LinkIconId[]];

export function inferIconFromUrl(rawUrl: string): LinkIconId {
  const value = rawUrl.toLowerCase();
  if (value.includes("github.com")) return "github";
  if (
    value.includes("velog.io") ||
    value.includes("medium.com") ||
    value.includes("tistory.com") ||
    value.includes("substack.com") ||
    value.includes("blog")
  ) {
    return "book-open";
  }
  if (value.includes("linkedin.com")) return "briefcase";
  if (value.includes("notion.so") || value.includes("figma.com")) return "layers";
  if (value.includes("vercel.app") || value.includes("netlify.app")) return "code-2";
  return "globe";
}

function isValidHostname(hostname: string): boolean {
  if (hostname === "localhost") return true;
  if (!hostname.includes(".") || hostname.startsWith(".") || hostname.endsWith(".")) {
    return false;
  }
  const labels = hostname.split(".");
  const tld = labels[labels.length - 1];
  return (
    labels.every(
      (label) => label.length > 0 && !label.startsWith("-") && !label.endsWith("-")
    ) && /^[a-zA-Z\d-]{2,}$/.test(tld)
  );
}

export function normalizeUrlComparisonKey(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${host}${path}${parsed.search}`.toLowerCase();
  } catch {
    return null;
  }
}

export type ParsedLinkUrlResult =
  | {
      valid: true;
      url: string;
      displayUrl: string;
    }
  | {
      valid: false;
      reason: "empty" | "whitespace" | "protocol" | "invalid";
    };

export function parseAndNormalizeLinkUrl(rawUrl: string): ParsedLinkUrlResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, reason: "empty" };
  }

  if (/\s/.test(trimmed)) {
    return { valid: false, reason: "whitespace" };
  }

  const protocolMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):/);
  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();
    if (protocol !== "http" && protocol !== "https") {
      return { valid: false, reason: "protocol" };
    }
  }

  const candidate = protocolMatch ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (
      (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
      !isValidHostname(parsed.hostname)
    ) {
      return { valid: false, reason: "invalid" };
    }

    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname === "/" ? "" : parsed.pathname;

    return {
      valid: true,
      url: parsed.toString(),
      displayUrl: `${host}${path}${parsed.search}`,
    };
  } catch {
    return { valid: false, reason: "invalid" };
  }
}

const URL_ERROR_MESSAGES: Record<
  Exclude<ParsedLinkUrlResult, { valid: true }>["reason"],
  string
> = {
  empty: "대상 URL을 입력해 주세요.",
  whitespace: "URL에는 공백을 포함할 수 없습니다.",
  protocol: "http:// 또는 https:// 프로토콜만 지원합니다.",
  invalid:
    "올바른 도메인 형식의 URL을 입력해 주세요. (예: https://github.com/username)",
};

export function createAddLinkSchema(existingLinks: LinkItem[]) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, "링크 제목을 입력해 주세요.")
      .min(
        LINK_FIELD_LIMITS.TITLE_MIN_LENGTH,
        `링크 제목은 최소 ${LINK_FIELD_LIMITS.TITLE_MIN_LENGTH}자 이상 입력해 주세요.`
      )
      .max(
        LINK_FIELD_LIMITS.TITLE_MAX_LENGTH,
        `링크 제목은 ${LINK_FIELD_LIMITS.TITLE_MAX_LENGTH}자 이하로 입력해 주세요.`
      ),
    url: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        const parsed = parseAndNormalizeLinkUrl(value);
        if (!parsed.valid) {
          ctx.addIssue({
            code: "custom",
            message: URL_ERROR_MESSAGES[parsed.reason],
          });
          return;
        }

        const targetKey = normalizeUrlComparisonKey(parsed.url);
        const isDuplicate =
          targetKey !== null &&
          existingLinks.some(
            (item) =>
              item.url && normalizeUrlComparisonKey(item.url) === targetKey
          );

        if (isDuplicate) {
          ctx.addIssue({
            code: "custom",
            message: "이미 등록된 URL입니다. 다른 주소를 입력해 주세요.",
          });
        }
      }),
    description: z
      .string()
      .trim()
      .max(
        LINK_FIELD_LIMITS.DESCRIPTION_MAX_LENGTH,
        `설명은 ${LINK_FIELD_LIMITS.DESCRIPTION_MAX_LENGTH}자 이하로 입력해 주세요.`
      ),
    buttonText: z
      .string()
      .trim()
      .max(
        LINK_FIELD_LIMITS.BUTTON_TEXT_MAX_LENGTH,
        `버튼 문구는 ${LINK_FIELD_LIMITS.BUTTON_TEXT_MAX_LENGTH}자 이하로 입력해 주세요.`
      ),
    icon: z.enum(LINK_ICON_IDS),
    isActive: z.boolean(),
  });
}

export type AddLinkFormValues = z.infer<ReturnType<typeof createAddLinkSchema>>;
