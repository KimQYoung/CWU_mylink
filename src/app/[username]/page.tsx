"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Share2 } from "lucide-react";
import { AuthRequiredView } from "@/components/auth-required-view";
import { FirestoreStatusBanner } from "@/components/firestore-status-banner";
import { LinkCard } from "@/components/link-card";
import { SiteHeader } from "@/components/site-header";
import { StatusToast } from "@/components/status-toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import {
  getUserLinksPath,
  sortLinksByCreatedAtDesc,
} from "@/lib/firestore-links";
import { DEFAULT_PROFILE, useProfileStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types";

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const rawUsername = params?.username ?? "";
  const decodedUsername = decodeURIComponent(rawUsername);

  const hasMounted = useHydrated();
  const authStatus = useProfileStore((state) => state.authStatus);
  const authUser = useProfileStore((state) => state.authUser);
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

  const isAuthenticated =
    hasMounted && authStatus === "authenticated" && Boolean(authUser);
  const profile = isAuthenticated ? storeProfile : DEFAULT_PROFILE;
  const linksPath = getUserLinksPath(isAuthenticated ? authUser?.uid : null);
  const isLoadingLinks =
    isAuthenticated && (firestoreStatus === "syncing" || isRefreshingLinks);

  const isMatchedUser =
    isAuthenticated &&
    (decodedUsername.toLowerCase() === profile.username.toLowerCase() ||
      decodedUsername === authUser?.uid);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-canvas text-ink flex flex-col font-sans">
        <SiteHeader onToast={showToast} />

        <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 flex-1 flex flex-col">
          <AuthRequiredView
            description={`@${decodedUsername} 프로필을 확인하려면\nGoogle 계정으로 먼저 로그인해 주세요.`}
          />
        </main>

        <footer className="py-8 px-4 text-center">
          <p className="font-mono text-xs text-body-mid">
            © {new Date().getFullYear()} MyLink. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  if (!isMatchedUser) {
    return (
      <div className="min-h-screen w-full bg-canvas text-ink flex flex-col font-sans">
        <SiteHeader onToast={showToast} />

        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <Card className="w-full max-w-md p-8 space-y-5 text-center">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              {"// 404 ENDPOINT NOT FOUND"}
            </p>
            <h1 className="text-2xl font-normal tracking-[-0.02em] text-ink">
              @{decodedUsername} 프로필을 찾을 수 없습니다
            </h1>
            <p className="text-sm text-body-mid leading-relaxed">
              현재 로그인된 계정의 프로필 경로는{" "}
              <span className="font-mono text-ink">@{profile.username}</span>
              입니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <Link
                href={`/${profile.username}`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full sm:w-auto"
                )}
              >
                Go to @{profile.username}
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto"
                )}
              >
                마이페이지로 이동
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-canvas text-ink flex flex-col font-sans">
      <SiteHeader
        onToast={showToast}
        rightSlot={
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={handleCopyPageUrl}
            aria-label="프로필 링크 복사"
          >
            <Share2 className="size-3.5" strokeWidth={1.5} />
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-md flex-1 px-4 sm:px-6 py-10 sm:py-16 space-y-7">
        {/* 중앙 정렬 공개 프로필 헤더 */}
        <section className="flex flex-col items-center text-center space-y-3">
          <UserAvatar
            src={profile.avatarUrl || authUser?.photoURL}
            name={profile.name}
            size={84}
            priority
          />

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-normal tracking-[-0.03em] text-ink">
              {profile.name}
            </h1>
            <p className="font-mono text-xs text-body-mid">
              {profile.callsign}
            </p>
          </div>

          {profile.bio?.trim() && (
            <p className="text-sm font-normal text-body max-w-sm leading-relaxed break-words">
              {profile.bio}
            </p>
          )}

          {authUser?.email && (
            <p className="text-sm font-normal text-body-mid">
              {authUser.email}
            </p>
          )}
        </section>

        <FirestoreStatusBanner
          isLoading={isLoadingLinks}
          error={hasMounted ? firestoreError : null}
          loadingMessage={`Firestore(${linksPath})에서 링크 목록을 불러오는 중입니다...`}
          onRetry={() => void loadFirestoreLinks(authUser?.uid)}
          theme="xai"
        />

        {/* 공개 링크 목록 */}
        <section
          aria-label="공개 링크 목록"
          className={cn(
            "space-y-2.5 transition-opacity",
            isLoadingLinks && "opacity-65"
          )}
        >
          {activeLinks.length === 0 && !isLoadingLinks ? (
            <Card className="p-7 text-center space-y-4">
              <p className="text-sm font-normal text-body">
                현재 공개된 링크가 없습니다.
              </p>
              <Link
                href="/"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                마이페이지에서 링크 추가
              </Link>
            </Card>
          ) : (
            activeLinks.map((link, index) => (
              <LinkCard
                key={link.id}
                link={link}
                index={index}
                mode="mypage"
                theme="xai"
                copied={copiedId === link.id}
                onCopyEmail={handleCopyEmail}
                onLinkClick={(item) => recordLinkClick(item.id)}
              />
            ))
          )}
        </section>
      </main>

      <footer className="py-8 px-4 text-center">
        <p className="font-mono text-xs text-body-mid">
          © {new Date().getFullYear()} MyLink. All rights reserved.
        </p>
      </footer>

      <StatusToast message={toastMessage} theme="xai" />
    </div>
  );
}
