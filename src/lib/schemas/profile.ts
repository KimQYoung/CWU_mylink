import { z } from "zod";

export const PROFILE_FIELD_LIMITS = {
  DISPLAY_NAME_MIN_LENGTH: 2,
  DISPLAY_NAME_MAX_LENGTH: 30,
  BIO_MAX_LENGTH: 160,
  AVATAR_URL_MAX_LENGTH: 500,
} as const;

/**
 * Display Name의 연속 공백을 정리합니다.
 */
export function sanitizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Display Name 중복 비교를 위한 정규화 키(소문자, 공백 정리)를 생성합니다.
 */
export function normalizeDisplayNameKey(value: string): string {
  return sanitizeDisplayName(value).toLowerCase();
}

/**
 * 프로필 아바타 URL이 안전한 형식(비어 있음, `/...` 로컬 경로, 또는 http/https URL)인지 검증합니다.
 */
export function parseProfileAvatarUrl(rawUrl: string): {
  valid: boolean;
  url: string;
} {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: true, url: "" };
  }

  if (/\s/.test(trimmed)) {
    return { valid: false, url: trimmed };
  }

  // 로컬 정적 경로(/avatar.png 등) 허용
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("..")) {
    return { valid: true, url: trimmed };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return { valid: true, url: parsed.toString() };
    }
    return { valid: false, url: trimmed };
  } catch {
    return { valid: false, url: trimmed };
  }
}

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .transform((val) => sanitizeDisplayName(val))
    .refine((val) => val.length > 0, "Display Name을 입력해 주세요.")
    .refine(
      (val) => val.length >= PROFILE_FIELD_LIMITS.DISPLAY_NAME_MIN_LENGTH,
      `Display Name은 최소 ${PROFILE_FIELD_LIMITS.DISPLAY_NAME_MIN_LENGTH}자 이상 입력해 주세요.`
    )
    .refine(
      (val) => val.length <= PROFILE_FIELD_LIMITS.DISPLAY_NAME_MAX_LENGTH,
      `Display Name은 ${PROFILE_FIELD_LIMITS.DISPLAY_NAME_MAX_LENGTH}자 이하로 입력해 주세요.`
    )
    .refine(
      (val) => !/[\r\n\t]/.test(val),
      "Display Name에는 줄바꿈이나 탭 문자를 사용할 수 없습니다."
    ),
  bio: z
    .string()
    .trim()
    .max(
      PROFILE_FIELD_LIMITS.BIO_MAX_LENGTH,
      `한 줄 소개는 ${PROFILE_FIELD_LIMITS.BIO_MAX_LENGTH}자 이하로 입력해 주세요.`
    ),
  avatarUrl: z
    .string()
    .trim()
    .max(
      PROFILE_FIELD_LIMITS.AVATAR_URL_MAX_LENGTH,
      `이미지 URL은 ${PROFILE_FIELD_LIMITS.AVATAR_URL_MAX_LENGTH}자 이하로 입력해 주세요.`
    )
    .refine(
      (val) => parseProfileAvatarUrl(val).valid,
      "올바른 이미지 URL(https://... 또는 /avatar.png)을 입력해 주세요."
    ),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * 현재 폼 입력값이 기존 프로필 값과 비교해 실제로 변경된 사항이 있는지 판별합니다.
 */
export function hasProfileFormChanges(
  current: ProfileFormValues,
  initial: ProfileFormValues
): boolean {
  if (
    sanitizeDisplayName(current.displayName) !==
    sanitizeDisplayName(initial.displayName)
  ) {
    return true;
  }

  if (current.bio.trim() !== initial.bio.trim()) {
    return true;
  }

  if (current.avatarUrl.trim() !== initial.avatarUrl.trim()) {
    return true;
  }

  return false;
}
