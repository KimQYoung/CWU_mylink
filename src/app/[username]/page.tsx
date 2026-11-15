"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import { FirestoreStatusBanner } from "@/components/firestore-status-banner";
import { LinkCard } from "@/components/link-card";
import { StatusToast } from "@/components/status-toast";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sortLinksByCreatedAtDesc } from "@/lib/firestore-links";
import { DEFAULT_PROFILE, useProfileStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types";

const NAV_BUTTON_CLASS =
  "border-white/25 bg-transparent text-ink hover:border-white hover:bg-canvas-soft/60";

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const rawUsername = params?.username ?? "";
  const decodedUsername = decodeURIComponent(rawUsername);

  const hasMounted = useHydrated();
  const storeProfile = useProfileStore((state) => state.profile);
  const firestoreStatus = useProfileStore((state) => state.firestoreStatus);
  const firestoreError = useProfileStore((state) => state.firestoreError);
  const isRefreshingLinks = useProfileStore((state) => state.isRefreshingLinks);
  const loadFirestoreLinks = useProfileStore(
    (state) => state.loadFirestoreLinks
  );
  const recordPageView = useProfileStore((state) => state.recordPageView);
  const recordLinkClick = useProfileStore((state) => state.recordLinkClick);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const profile = hasMounted ? storeProfile : DEFAULT_PROFILE;
  const isLoadingLinks =
    hasMounted && (firestoreStatus === "syncing" || isRefreshingLinks);

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
      sortLinksByCreatedAtDesc(profile.links).filter((link) => link.isActive),
    [profile.links]
  );

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
            현재 로컬 메모리 상태에 등록된 프로필은{" "}
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
    <div className="min-h-screen w-full bg-canvas text-ink flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-14 max-w-2xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2">
            <Link
              href="/links"
              className={cn(
                buttonVariants({ variant: "outline", size: "xs" }),
                NAV_BUTTON_CLASS
              )}
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.5} />
              <span>Links</span>
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "xs" }),
                NAV_BUTTON_CLASS
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
            className={cn("sm:hidden", NAV_BUTTON_CLASS)}
          >
            <Share2 className="size-3.5" strokeWidth={1.5} />
            <span>Share</span>
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={handleCopyPageUrl}
            aria-label="프로필 링크 복사"
            className={cn("hidden sm:inline-flex", NAV_BUTTON_CLASS)}
          >
            <Share2 className="size-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      </header>

      {/* Main Linktree Profile Surface */}
      <main className="mx-auto w-full max-w-xl flex-1 px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Profile Summary Card */}
        <Card className="rounded-lg border border-hairline bg-canvas-card p-6 shadow-none">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative size-20 rounded-full overflow-hidden shrink-0 border border-hairline bg-canvas-soft">
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
              <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                {"//"} {profile.discipline}
              </p>
              <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-ink">
                {profile.name}
              </h1>
              <p className="font-mono text-xs text-body-mid">{profile.callsign}</p>
            </div>

            <Badge className="border-hairline bg-canvas-soft px-3 py-1 text-sunset">
              <span className="size-1.5 rounded-full bg-current" />
              <span>{profile.status}</span>
            </Badge>

            <p className="text-sm sm:text-base font-normal text-body leading-relaxed">
              {profile.headline}
            </p>
          </div>
        </Card>

        {/* Active Link List Header */}
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
            {"// VERIFIED LINKS"}
          </span>
          <div className="flex items-center gap-2">
            {isLoadingLinks && (
              <Loader2 className="size-3.5 animate-spin opacity-75" strokeWidth={1.75} />
            )}
            <span className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              {activeLinks.length} ACTIVE
            </span>
          </div>
        </div>

        <FirestoreStatusBanner
          isLoading={isLoadingLinks}
          error={hasMounted ? firestoreError : null}
          loadingMessage="링크 목록을 불러오는 중입니다..."
          onRetry={() => void loadFirestoreLinks()}
          theme="xai"
        />

        {/* Link Stack */}
        <section
          aria-label="공개 링크 목록"
          className={cn(
            "space-y-3 transition-opacity",
            isLoadingLinks && "opacity-65"
          )}
        >
          {activeLinks.length === 0 ? (
            <Card className="rounded-lg border border-hairline bg-canvas-card p-6 shadow-none text-center space-y-4">
              <p className="text-sm sm:text-base font-normal text-body leading-relaxed">
                현재 공개된 링크가 없습니다.
              </p>
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
                theme="xai"
                copied={copiedId === link.id}
                onCopyEmail={handleCopyEmail}
                onLinkClick={(item) => recordLinkClick(item.id)}
              />
            ))
          )}
        </section>
      </main>

      <footer className="py-6 px-4 text-center text-body-mid border-t border-hairline bg-canvas">
        <p className="font-mono text-[11px] uppercase tracking-[1.2px]">
          {profile.name.toUpperCase()} {"//"} MYLINK PUBLIC PROFILE
        </p>
      </footer>

      <StatusToast message={toastMessage} theme="xai" />
    </div>
  );
}
