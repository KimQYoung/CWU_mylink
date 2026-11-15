"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import { LinkCard } from "@/components/link-card";
import { StatusToast } from "@/components/status-toast";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEFAULT_PROFILE, useProfileStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { LinkItem, ThemeId } from "@/types";

interface ThemeStyles {
  page: string;
  topBar: string;
  navButton: string;
  profileCard: string;
  avatarFrame: string;
  eyebrow: string;
  name: string;
  handle: string;
  statusBadge: string;
  bio: string;
  footer: string;
}

const THEME_LABELS: Record<ThemeId, string> = {
  xai: "xAI Dark",
  neobrutalism: "Neobrutalism",
  modern: "Modern Light",
};

const THEME_STYLES: Record<ThemeId, ThemeStyles> = {
  xai: {
    page: "bg-canvas text-ink",
    topBar: "border-b border-hairline bg-canvas/90 backdrop-blur-md",
    navButton:
      "border-white/25 bg-transparent text-ink hover:border-white hover:bg-canvas-soft/60",
    profileCard: "rounded-lg border border-hairline bg-canvas-card p-6 shadow-none",
    avatarFrame: "border border-hairline bg-canvas-soft",
    eyebrow: "font-mono text-xs uppercase tracking-[1.4px] text-body-mid",
    name: "text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-ink",
    handle: "font-mono text-xs text-body-mid",
    statusBadge: "border-hairline bg-canvas-soft px-3 py-1 text-sunset",
    bio: "text-sm sm:text-base font-normal text-body leading-relaxed",
    footer: "text-body-mid border-t border-hairline bg-canvas",
  },
  neobrutalism: {
    page: "bg-[#F4F0EA] text-black bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[length:24px_24px]",
    topBar: "border-b-[3px] border-black bg-[#FFE600]",
    navButton:
      "rounded-md border-2 border-black bg-white text-black font-medium shadow-[2px_2px_0px_#000] hover:bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
    profileCard:
      "rounded-xl border-[3px] border-black bg-white p-6 text-black shadow-[8px_8px_0px_#000]",
    avatarFrame: "border-[3px] border-black bg-[#7BF1A8]",
    eyebrow: "font-mono text-xs uppercase tracking-[1.2px] text-black/70",
    name: "text-3xl sm:text-4xl font-bold tracking-tight text-black",
    handle: "font-mono text-xs text-black/80",
    statusBadge: "border-2 border-black bg-[#7BF1A8] px-3 py-1 text-black",
    bio: "text-sm sm:text-base text-black/80 leading-relaxed",
    footer: "text-black/70 border-t-[3px] border-black bg-white/80",
  },
  modern: {
    page: "bg-[#F8FAFC] text-slate-900",
    topBar: "border-b border-slate-200 bg-white/85 backdrop-blur-md",
    navButton:
      "border-slate-200 bg-white text-slate-700 font-medium hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-600",
    profileCard:
      "rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-900 shadow-sm",
    avatarFrame: "border border-slate-200 bg-indigo-50",
    eyebrow: "font-mono text-xs uppercase tracking-[1.2px] text-indigo-600",
    name: "text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900",
    handle: "font-mono text-xs text-slate-500",
    statusBadge: "border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700",
    bio: "text-sm sm:text-base text-slate-600 leading-relaxed",
    footer: "text-slate-500 border-t border-slate-200 bg-white",
  },
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const rawUsername = params?.username ?? "";
  const decodedUsername = decodeURIComponent(rawUsername);

  const hasMounted = useHydrated();
  const storeProfile = useProfileStore((state) => state.profile);
  const setTheme = useProfileStore((state) => state.setTheme);
  const recordPageView = useProfileStore((state) => state.recordPageView);
  const recordLinkClick = useProfileStore((state) => state.recordLinkClick);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const profile = hasMounted ? storeProfile : DEFAULT_PROFILE;

  const isMatchedUser =
    decodedUsername.toLowerCase() === profile.username.toLowerCase();

  useEffect(() => {
    if (!hasMounted || !isMatchedUser) return;
    const sessionKey = `mylink_viewed_${profile.username.toLowerCase()}`;
    if (
      typeof window !== "undefined" &&
      !window.sessionStorage.getItem(sessionKey)
    ) {
      window.sessionStorage.setItem(sessionKey, "1");
      recordPageView();
    }
  }, [hasMounted, isMatchedUser, profile.username, recordPageView]);

  const activeLinks = useMemo(
    () =>
      [...profile.links]
        .filter((link) => link.isActive)
        .sort((a, b) => a.order - b.order),
    [profile.links]
  );

  const theme: ThemeId = profile.theme ?? "xai";
  const styles = THEME_STYLES[theme];

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  const handleCopyEmail = (link: LinkItem) => {
    if (!profile.email) return;
    navigator.clipboard.writeText(profile.email);
    recordLinkClick(link.id);
    setCopiedId(link.id);
    showToast(`ADDRESS COPIED: ${profile.email}`);
    window.setTimeout(() => {
      setCopiedId((current) => (current === link.id ? null : current));
    }, 2400);
  };

  const handleCopyPageUrl = () => {
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `/${profile.username}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("PROFILE LINK COPIED");
  };

  if (!isMatchedUser) {
    return (
      <div className="min-h-screen w-full bg-canvas text-ink flex flex-col items-center justify-center px-6">
        <Card className="w-full max-w-md p-8 space-y-5 text-center">
          <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
            {"// 404 ENDPOINT NOT FOUND"}
          </p>
          <h1 className="text-2xl font-normal tracking-[-0.02em] text-ink">
            @{decodedUsername} 프로필을 찾을 수 없습니다
          </h1>
          <p className="text-sm text-body-mid leading-relaxed">
            현재 LocalStorage에 등록된 프로필은{" "}
            <span className="font-mono text-ink">@{profile.username}</span>입니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Link
              href={`/${profile.username}`}
              className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto")}
            >
              Go to @{profile.username}
            </Link>
            <Link
              href="/links"
              className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
            >
              View All Links
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col font-sans transition-colors",
        styles.page
      )}
    >
      {/* Top Bar: 모바일에서는 2단 구조(내비게이션 줄 + 3열 테마 스위처 줄)로 정리 */}
      <header className={cn("sticky top-0 z-40 w-full", styles.topBar)}>
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-2.5 sm:min-h-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Link
                href="/links"
                className={cn(
                  buttonVariants({ variant: "outline", size: "xs" }),
                  styles.navButton
                )}
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.5} />
                <span>Links</span>
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "xs" }),
                  styles.navButton
                )}
              >
                Overview
              </Link>
            </div>

            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={handleCopyPageUrl}
              aria-label="프로필 링크 복사"
              className={cn("sm:hidden", styles.navButton)}
            >
              <Share2 className="size-3.5" strokeWidth={1.5} />
              <span>Share</span>
            </Button>
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto">
            {(["xai", "neobrutalism", "modern"] as ThemeId[]).map((preset) => (
              <Button
                key={preset}
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setTheme(preset)}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.8px] sm:tracking-[1px] px-2 sm:px-3",
                  theme === preset
                    ? theme === "xai"
                      ? "border-white bg-white text-canvas hover:bg-neutral-200"
                      : theme === "neobrutalism"
                      ? "border-black bg-black text-[#FFE600] hover:bg-black"
                      : "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
                    : theme === "xai"
                    ? "border-white/20 text-body-mid hover:text-ink"
                    : theme === "neobrutalism"
                    ? "border-black bg-white text-black hover:bg-[#FFFDF5]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                )}
              >
                {THEME_LABELS[preset]}
              </Button>
            ))}

            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={handleCopyPageUrl}
              aria-label="프로필 링크 복사"
              className={cn("hidden sm:inline-flex", styles.navButton)}
            >
              <Share2 className="size-3.5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Linktree Profile Surface */}
      <main className="mx-auto w-full max-w-xl flex-1 px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Neobrutalism Retro Window Chrome */}
        {theme === "neobrutalism" && (
          <div className="flex items-center justify-between rounded-t-xl border-[3px] border-black bg-[#FFE600] px-4 py-2 -mb-9 pb-5">
            <span className="font-mono text-xs font-bold uppercase tracking-[1px] text-black">
              MYLINK_PUBLIC.EXE
            </span>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border border-black bg-white" />
              <span className="size-2.5 rounded-full border border-black bg-[#7BF1A8]" />
              <span className="size-2.5 rounded-full border border-black bg-[#FF6B6B]" />
            </div>
          </div>
        )}

        {/* Profile Summary Card */}
        <Card className={styles.profileCard}>
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={cn(
                "relative size-20 rounded-full overflow-hidden shrink-0",
                styles.avatarFrame
              )}
            >
              <Image
                src={profile.avatarUrl || "/avatar.png"}
                alt={`${profile.name} Avatar`}
                width={80}
                height={80}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="space-y-1.5">
              <p className={styles.eyebrow}>
                {"//"} {profile.discipline}
              </p>
              <h1 className={styles.name}>{profile.name}</h1>
              <p className={styles.handle}>{profile.callsign}</p>
            </div>

            <Badge className={styles.statusBadge}>
              <span className="size-1.5 rounded-full bg-current" />
              <span>{profile.status}</span>
            </Badge>

            <p className={styles.bio}>{profile.headline}</p>
          </div>
        </Card>

        {/* Active Link List Header */}
        <div className="flex items-center justify-between px-1">
          <span className={styles.eyebrow}>{"// VERIFIED LINKS"}</span>
          <span className={styles.eyebrow}>{activeLinks.length} ACTIVE</span>
        </div>

        {/* Link Stack */}
        <section aria-label="공개 링크 목록" className="space-y-3">
          {activeLinks.length === 0 ? (
            <Card className={cn(styles.profileCard, "text-center space-y-4")}>
              <p className={styles.bio}>현재 공개된 링크가 없습니다.</p>
              <Link
                href="/links"
                className={buttonVariants({ variant: "outline" })}
              >
                Manage Links
              </Link>
            </Card>
          ) : (
            activeLinks.map((link, index) => (
              <LinkCard
                key={link.id}
                link={link}
                index={index}
                mode="public"
                theme={theme}
                copied={copiedId === link.id}
                onCopyEmail={handleCopyEmail}
                onLinkClick={(item) => recordLinkClick(item.id)}
              />
            ))
          )}
        </section>
      </main>

      <footer className={cn("py-6 px-4 text-center", styles.footer)}>
        <p className="font-mono text-[11px] uppercase tracking-[1.2px]">
          {profile.name.toUpperCase()} {"//"} MYLINK PUBLIC PROFILE
        </p>
      </footer>

      <StatusToast message={toastMessage} theme={theme} />
    </div>
  );
}
