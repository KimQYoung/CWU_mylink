"use client";

import Link from "next/link";
import { AlertCircle, Loader2, LogOut, X } from "lucide-react";
import { GoogleIcon } from "@/components/google-icon";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { getDisplayNameFromAuthUser } from "@/lib/firebase-auth";
import { useProfileStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  profileName: string;
  username: string;
  activeRoute: "home" | "links";
  rightSlot?: React.ReactNode;
}

/**
 * xAI Minimal Dark 규격의 상단 고정 내비게이션 헤더
 * - Google 소셜 로그인/로그아웃 및 로그인 사용자 정보 표시
 * - 모바일에서는 브랜드+인증 바와 3열 균등 내비게이션으로 분리되어 한 줄 뭉침을 방지합니다.
 */
export function SiteHeader({
  profileName,
  username,
  activeRoute,
  rightSlot,
}: SiteHeaderProps) {
  const hasMounted = useHydrated();
  const authStatus = useProfileStore((state) => state.authStatus);
  const authUser = useProfileStore((state) => state.authUser);
  const isAuthSubmitting = useProfileStore((state) => state.isAuthSubmitting);
  const authError = useProfileStore((state) => state.authError);
  const signInWithGoogleAction = useProfileStore(
    (state) => state.signInWithGoogleAction
  );
  const signOutAction = useProfileStore((state) => state.signOutAction);
  const clearAuthError = useProfileStore((state) => state.clearAuthError);

  const firestoreStatus = useProfileStore((state) => state.firestoreStatus);
  const isRefreshingLinks = useProfileStore((state) => state.isRefreshingLinks);
  const updatingCount = useProfileStore((state) => state.updatingLinkIds.length);

  const effectiveAuthStatus = hasMounted ? authStatus : "loading";
  const effectiveAuthUser = hasMounted ? authUser : null;
  const isAuthenticated =
    effectiveAuthStatus === "authenticated" && Boolean(effectiveAuthUser);

  const isLoading =
    hasMounted &&
    isAuthenticated &&
    (firestoreStatus === "syncing" || isRefreshingLinks || updatingCount > 0);

  const statusLabel = !hasMounted || effectiveAuthStatus === "loading"
    ? "AUTH CHECKING"
    : !isAuthenticated
    ? "LOGIN REQUIRED"
    : firestoreStatus === "error"
    ? "FIRESTORE ERROR"
    : isLoading
    ? updatingCount > 0
      ? "FIRESTORE UPDATING"
      : "FIRESTORE LOADING"
    : "FIRESTORE DB";

  const indicatorClass =
    !hasMounted || effectiveAuthStatus === "loading"
      ? "bg-amber-400"
      : !isAuthenticated
      ? "bg-sunset"
      : firestoreStatus === "error"
      ? "bg-red-400"
      : "bg-emerald-400";

  const resolvedDisplayName = isAuthenticated
    ? getDisplayNameFromAuthUser(effectiveAuthUser)
    : profileName;

  const displayBrandName = isAuthenticated
    ? resolvedDisplayName
    : effectiveAuthStatus === "loading"
    ? "Checking..."
    : "Guest";

  const userDisplayLabel = resolvedDisplayName;

  const navItems = [
    { key: "home" as const, label: "마이페이지", href: "/" },
    { key: "links" as const, label: "Links", href: "/links" },
    {
      key: "public" as const,
      label: isAuthenticated ? `@${username}` : "Profile",
      href: `/${username}`,
    },
  ];

  const renderAuthControls = (compact = false) => {
    if (effectiveAuthStatus === "loading") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas-soft px-3 py-1 font-mono text-[10px] uppercase tracking-[1.2px] text-body-mid">
          <Loader2 className="size-3 animate-spin" strokeWidth={1.75} />
          <span>{compact ? "AUTH" : "CHECKING"}</span>
        </span>
      );
    }

    if (isAuthenticated && effectiveAuthUser) {
      return (
        <div className="flex items-center gap-2 min-w-0">
          <div
            title={effectiveAuthUser.email ?? userDisplayLabel}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas-soft pl-1 pr-2.5 py-0.5 max-w-[140px] sm:max-w-[180px]"
          >
            <UserAvatar
              src={effectiveAuthUser.photoURL}
              name={userDisplayLabel}
              size={22}
            />
            <span className="text-xs font-normal text-ink truncate">
              {userDisplayLabel}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isAuthSubmitting}
            onClick={() => void signOutAction()}
            aria-label="Google 로그아웃"
            className="font-mono text-[10px] uppercase tracking-[1px]"
          >
            {isAuthSubmitting ? (
              <Loader2 className="size-3 animate-spin" strokeWidth={1.75} />
            ) : (
              <LogOut className="size-3" strokeWidth={1.75} />
            )}
            <span>로그아웃</span>
          </Button>
        </div>
      );
    }

    return (
      <Button
        type="button"
        variant="default"
        size="xs"
        disabled={isAuthSubmitting}
        aria-busy={isAuthSubmitting}
        onClick={() => void signInWithGoogleAction()}
        className="font-normal text-xs"
      >
        {isAuthSubmitting ? (
          <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
        ) : (
          <GoogleIcon className="size-3.5" />
        )}
        <span>{compact ? "Google 로그인" : "Google 로그인"}</span>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-2.5 px-4 py-3 md:min-h-14 md:flex-row md:items-center md:justify-between md:gap-4 sm:px-8 md:py-2">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid hover:text-ink transition-colors shrink-0"
            >
              MYLINK {"//"} 01
            </Link>
            <span className="text-hairline hidden sm:inline">|</span>
            <span className="text-sm font-normal tracking-[-0.02em] text-ink truncate">
              {displayBrandName}
            </span>
          </div>

          <div className="flex md:hidden items-center gap-2 shrink-0">
            {renderAuthControls(true)}
          </div>
        </div>

        <nav
          aria-label="Primary navigation"
          className="grid grid-cols-3 gap-1.5 md:flex md:items-center"
        >
          {navItems.map((item) => {
            const isActive = item.key === activeRoute;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "inline-flex items-center justify-center rounded-full border px-3 py-1.5 md:px-3.5 md:py-1 text-xs font-normal transition-colors truncate",
                  isActive
                    ? "border-white/30 bg-canvas-soft text-ink"
                    : "border-hairline md:border-transparent text-body-mid hover:border-hairline hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {rightSlot ?? (
            <div className="flex items-center gap-1.5">
              {isLoading ? (
                <Loader2
                  className="size-3 animate-spin text-amber-400"
                  strokeWidth={1.75}
                />
              ) : (
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", indicatorClass)}
                />
              )}
              <span className="font-mono text-[10px] uppercase tracking-[1.3px] text-body-mid">
                {statusLabel}
              </span>
            </div>
          )}
          {renderAuthControls(false)}
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
