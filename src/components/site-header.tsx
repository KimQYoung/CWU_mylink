"use client";

import Link from "next/link";
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
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-body-mid">
              SYNC
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
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-[1.4px] text-body-mid">
                LOCALSTORAGE ACTIVE
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
