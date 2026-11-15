"use client";

import Link from "next/link";
import { AlertCircle, Loader2, X } from "lucide-react";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

interface SiteHeaderProps {
  profileName?: string;
  username?: string;
  activeRoute?: "home" | "links";
  rightSlot?: React.ReactNode;
  onToast?: (message: string) => void;
}

/**
 * 미니멀 상단 고정 헤더
 * - 좌측: MyLink 브랜드 링크
 * - 우측: 비로그인 시 `로그인` 버튼 / 로그인 시 Base UI 프로필 드롭다운 아바타
 */
export function SiteHeader({ rightSlot, onToast }: SiteHeaderProps) {
  const hasMounted = useHydrated();
  const authStatus = useProfileStore((state) => state.authStatus);
  const authUser = useProfileStore((state) => state.authUser);
  const isAuthSubmitting = useProfileStore((state) => state.isAuthSubmitting);
  const authError = useProfileStore((state) => state.authError);
  const signInWithGoogleAction = useProfileStore(
    (state) => state.signInWithGoogleAction
  );
  const clearAuthError = useProfileStore((state) => state.clearAuthError);

  const effectiveAuthStatus = hasMounted ? authStatus : "loading";
  const effectiveAuthUser = hasMounted ? authUser : null;
  const isAuthenticated =
    effectiveAuthStatus === "authenticated" && Boolean(effectiveAuthUser);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          className="font-mono text-sm font-normal tracking-[-0.02em] text-ink hover:text-body transition-colors"
        >
          MyLink
        </Link>

        <div className="flex items-center gap-3 shrink-0">
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
