"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, ArrowUpRight, Loader2, X } from "lucide-react";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Button } from "@/components/ui/button";
import { getDisplayNameFromAuthUser } from "@/lib/firebase-auth";
import { buildPublicProfileHref } from "@/lib/firestore-profile";
import { useResolvedUserProfile } from "@/lib/queries/user-data";
import { normalizeDisplayNameKey } from "@/lib/schemas/profile";
import { useProfileStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  rightSlot?: React.ReactNode;
  onToast?: (message: string) => void;
}

function getSafePathSegment(pathname: string): string {
  if (!pathname || pathname === "/" || pathname.slice(1).includes("/")) {
    return "";
  }
  try {
    return decodeURIComponent(pathname.slice(1));
  } catch {
    return "";
  }
}

/**
 * 미니멀 상단 고정 헤더
 * - 좌측: MyLink 브랜드 링크 및 로그인 사용자용 페이지 내비게이션(개인별 페이지 포함)
 * - 우측: 비로그인 시 `로그인` 버튼 / 로그인 시 Base UI 프로필 드롭다운 아바타
 */
export function SiteHeader({ rightSlot, onToast }: SiteHeaderProps) {
  const hasMounted = useHydrated();
  const pathname = usePathname() ?? "/";
  const isAuthSubmitting = useProfileStore((state) => state.isAuthSubmitting);
  const authError = useProfileStore((state) => state.authError);
  const signInWithGoogleAction = useProfileStore(
    (state) => state.signInWithGoogleAction
  );
  const clearAuthError = useProfileStore((state) => state.clearAuthError);
  const { authStatus, authUser, profile } = useResolvedUserProfile();

  const effectiveAuthStatus = hasMounted ? authStatus : "loading";
  const effectiveAuthUser = hasMounted ? authUser : null;
  const isAuthenticated =
    effectiveAuthStatus === "authenticated" && Boolean(effectiveAuthUser);

  const displayName = effectiveAuthUser
    ? profile.name?.trim() || getDisplayNameFromAuthUser(effectiveAuthUser)
    : "";
  const personalPageHref = displayName
    ? buildPublicProfileHref(displayName)
    : "/";

  const singleSegment = getSafePathSegment(pathname);
  const isHomeActive = pathname === "/";
  const isLinksActive = pathname === "/links";
  const isPersonalPageActive =
    Boolean(displayName) &&
    Boolean(singleSegment) &&
    singleSegment !== "links" &&
    normalizeDisplayNameKey(singleSegment) ===
      normalizeDisplayNameKey(displayName);

  const navLinkClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-normal transition-colors whitespace-nowrap",
      active
        ? "border-white/30 bg-canvas-soft text-ink"
        : "border-transparent text-body-mid hover:bg-canvas-soft/60 hover:text-ink"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/"
            className="font-mono text-sm font-normal tracking-[-0.02em] text-ink hover:text-body transition-colors shrink-0"
          >
            MyLink
          </Link>

          {isAuthenticated && (
            <nav
              aria-label="주요 페이지 이동"
              className="hidden sm:flex items-center gap-1"
            >
              <Link href="/" className={navLinkClass(isHomeActive)}>
                마이페이지
              </Link>
              <Link href="/links" className={navLinkClass(isLinksActive)}>
                링크 관리
              </Link>
              <Link
                href={personalPageHref}
                className={navLinkClass(isPersonalPageActive)}
                title={`개인별 공개 페이지 (/${displayName})로 이동`}
              >
                <span>내 페이지</span>
                <ArrowUpRight className="size-3 opacity-75" strokeWidth={1.5} />
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated && (
            <Link
              href={personalPageHref}
              className={cn(
                navLinkClass(isPersonalPageActive),
                "sm:hidden border-hairline px-2.5"
              )}
              title={`개인별 공개 페이지 (/${displayName})로 이동`}
            >
              <span>내 페이지</span>
              <ArrowUpRight className="size-3 opacity-75" strokeWidth={1.5} />
            </Link>
          )}
          {rightSlot}
          {effectiveAuthStatus === "loading" ? (
            <span className="inline-flex size-8 items-center justify-center rounded-full border border-hairline bg-canvas-soft">
              <Loader2
                className="size-3.5 animate-spin text-body-mid"
                strokeWidth={1.75}
              />
            </span>
          ) : isAuthenticated ? (
            <ProfileDropdown onToast={onToast} />
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isAuthSubmitting}
              aria-busy={isAuthSubmitting}
              onClick={() => void signInWithGoogleAction()}
              className="text-xs px-4"
            >
              {isAuthSubmitting && (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
              )}
              <span>로그인</span>
            </Button>
          )}
        </div>
      </div>

      {hasMounted && authError && (
        <div className="border-t border-red-500/30 bg-red-500/10 px-4 py-2 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 font-mono text-[11px] text-red-300">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{authError}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearAuthError}
              aria-label="인증 오류 닫기"
              className="size-6 text-red-300 hover:bg-red-500/15 hover:text-white shrink-0"
            >
              <X className="size-3.5" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
