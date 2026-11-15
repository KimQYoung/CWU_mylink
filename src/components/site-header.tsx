"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
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
 * - 모바일에서는 브랜드 바 + 3열 균등 내비게이션으로 분리되어 한 줄 뭉침을 방지합니다.
 */
export function SiteHeader({
  profileName,
  username,
  activeRoute,
  rightSlot,
}: SiteHeaderProps) {
  const hasMounted = useHydrated();
  const firestoreStatus = useProfileStore((state) => state.firestoreStatus);
  const isRefreshingLinks = useProfileStore((state) => state.isRefreshingLinks);
  const updatingCount = useProfileStore((state) => state.updatingLinkIds.length);
  const isLoading =
    hasMounted &&
    (firestoreStatus === "syncing" || isRefreshingLinks || updatingCount > 0);
  const statusLabel =
    hasMounted && firestoreStatus === "error"
      ? "FIRESTORE ERROR"
      : isLoading
      ? updatingCount > 0
        ? "FIRESTORE UPDATING"
        : "FIRESTORE LOADING"
      : "FIRESTORE DB";
  const indicatorClass =
    hasMounted && firestoreStatus === "error"
      ? "bg-red-400"
      : "bg-emerald-400";
  const navItems = [
    { key: "home" as const, label: "Overview", href: "/" },
    { key: "links" as const, label: "Links", href: "/links" },
    {
      key: "public" as const,
      label: `@${username}`,
      href: `/${username}`,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-2.5 px-4 py-3 sm:min-h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-2">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid hover:text-ink transition-colors shrink-0"
            >
              MYLINK {"//"} 01
            </Link>
            <span className="text-hairline hidden sm:inline">|</span>
            <span className="text-sm font-normal tracking-[-0.02em] text-ink truncate">
              {profileName}
            </span>
          </div>

          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {isLoading ? (
              <Loader2 className="size-3 animate-spin text-amber-400" strokeWidth={1.75} />
            ) : (
              <span className={cn("h-1.5 w-1.5 rounded-full", indicatorClass)} />
            )}
            <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-body-mid">
              {isLoading ? "LOADING" : "DB"}
            </span>
          </div>
        </div>

        <nav
          aria-label="Primary navigation"
          className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center"
        >
          {navItems.map((item) => {
            const isActive = item.key === activeRoute;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "inline-flex items-center justify-center rounded-full border px-3 py-1.5 sm:px-3.5 sm:py-1 text-xs font-normal transition-colors truncate",
                  isActive
                    ? "border-white/30 bg-canvas-soft text-ink"
                    : "border-hairline sm:border-transparent text-body-mid hover:border-hairline hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          {rightSlot ?? (
            <>
              {isLoading ? (
                <Loader2 className="size-3 animate-spin text-amber-400" strokeWidth={1.75} />
              ) : (
                <span className={cn("h-1.5 w-1.5 rounded-full", indicatorClass)} />
              )}
              <span className="font-mono text-[11px] uppercase tracking-[1.4px] text-body-mid">
                {statusLabel}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
