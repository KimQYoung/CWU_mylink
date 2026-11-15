"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { Loader2, Share2 } from "lucide-react";
import { AuthRequiredView } from "@/components/auth-required-view";
import { FirestoreStatusBanner } from "@/components/firestore-status-banner";
import { LinkCard } from "@/components/link-card";
import { SiteHeader } from "@/components/site-header";
import { StatusToast } from "@/components/status-toast";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  getFirestoreErrorMessage,
  getUserLinksPath,
  sortLinksByCreatedAtDesc,
} from "@/lib/firestore-links";
import {
  buildPublicProfileHref,
  DisplayNamePermissionError,
  getProfileFirestoreErrorMessage,
  type ResolvedPublicUser,
} from "@/lib/firestore-profile";
import {
  useLinkActions,
  usePublicUserByDisplayNameQuery,
  useResolvedUserProfile,
  useUserLinksQuery,
} from "@/lib/queries/user-data";
import {
  normalizeDisplayNameKey,
  sanitizeDisplayName,
} from "@/lib/schemas/profile";
import { useProfileStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types";

interface PublicProfileClientProps {
  rawDisplayName: string;
}

function safeDecodeParam(rawValue: string): string | null {
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return null;
  }
}

function isPermissionError(error: unknown): boolean {
  return (
    error instanceof DisplayNamePermissionError ||
    (error instanceof FirebaseError && error.code === "permission-denied")
  );
}

/**
 * `/[displayName]` 동적 라우팅 공개 프로필 클라이언트 뷰
 * - URL의 displayName으로 Firestore에서 사용자를 검색하고 `users/{userId}/links` 링크 목록을 표시합니다.
 * - 일치하는 사용자가 없으면 Next.js `notFound()`를 호출해 404 페이지를 렌더링합니다.
 */
export function PublicProfileClient({
  rawDisplayName,
}: PublicProfileClientProps) {
  const decodedDisplayName = safeDecodeParam(rawDisplayName);
  const cleanedDisplayName = decodedDisplayName
    ? sanitizeDisplayName(decodedDisplayName)
    : "";
  const normalizedTargetKey = normalizeDisplayNameKey(cleanedDisplayName);

  if (decodedDisplayName === null || !normalizedTargetKey) {
    notFound();
  }

  const hasMounted = useHydrated();
  const {
    authStatus,
    authUser,
    profile: ownProfile,
    isProfileLoading,
  } = useResolvedUserProfile();
  const { recordLinkClick } = useLinkActions();
  const recordPageView = useProfileStore((state) => state.recordPageView);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isAuthenticated =
    hasMounted && authStatus === "authenticated" && Boolean(authUser);
  const authScope = isAuthenticated && authUser ? authUser.uid : authStatus;
  const firebaseReady = isFirebaseConfigured();

  const publicUserQuery = usePublicUserByDisplayNameQuery(
    cleanedDisplayName,
    authScope
  );

  // Firestore 인덱스 조회 결과가 없거나 규칙상 전체 조회가 제한된 경우에도,
  // 현재 로그인 사용자의 Display Name과 일치하면 본인 UID/프로필로 안전하게 폴백
  const ownFallbackUser: ResolvedPublicUser | null = useMemo(() => {
    if (!isAuthenticated || !authUser) {
      return null;
    }
    const ownNormalized = normalizeDisplayNameKey(ownProfile.name);
    if (!ownNormalized || ownNormalized !== normalizedTargetKey) {
      return null;
    }
    return {
      uid: authUser.uid,
      profile: {
        displayName: ownProfile.name,
        normalizedDisplayName: ownNormalized,
        bio: ownProfile.bio ?? "",
        avatarUrl: ownProfile.avatarUrl,
        ...(authUser.email ? { email: authUser.email } : {}),
      },
    };
  }, [
    isAuthenticated,
    authUser,
    ownProfile.name,
    ownProfile.bio,
    ownProfile.avatarUrl,
    normalizedTargetKey,
  ]);

  const resolvedUser = publicUserQuery.data ?? ownFallbackUser;
  const isWaitingForAuth = !hasMounted || authStatus === "loading";
  const isPublicQueryLoading =
    publicUserQuery.fetchStatus === "fetching" ||
    (firebaseReady && publicUserQuery.isPending);
  const isWaitingOwnProfile =
    isAuthenticated && !publicUserQuery.data && isProfileLoading;
  const isResolvingUser =
    isWaitingForAuth || isPublicQueryLoading || isWaitingOwnProfile;

  // 본인 페이지 폴백으로 이미 해석된 경우 공개 컬렉션 조회 권한 오류는 무시
  const lookupError =
    publicUserQuery.isError && !resolvedUser ? publicUserQuery.error : null;

  const targetUserId = resolvedUser?.uid ?? null;
  const linksQuery = useUserLinksQuery(targetUserId);
  const linksPath = getUserLinksPath(targetUserId);
  const isOwnProfile = Boolean(
    isAuthenticated && authUser?.uid && targetUserId === authUser.uid
  );

  const isLoadingLinks =
    Boolean(targetUserId) &&
    (linksQuery.fetchStatus === "fetching" || linksQuery.isPending);
  const linksError = linksQuery.isError
    ? getFirestoreErrorMessage(linksQuery.error, linksPath)
    : null;

  const activeLinks = useMemo(
    () =>
      sortLinksByCreatedAtDesc(linksQuery.data ?? []).filter(
        (link) => link.isActive
      ),
    [linksQuery.data]
  );

  useEffect(() => {
    if (!hasMounted || !isOwnProfile || !resolvedUser) return;
    const sessionKey = `mylink_viewed_${resolvedUser.profile.normalizedDisplayName}`;
    if (
      typeof window !== "undefined" &&
      !window.sessionStorage.getItem(sessionKey)
    ) {
      window.sessionStorage.setItem(sessionKey, "1");
      recordPageView();
    }
  }, [hasMounted, isOwnProfile, resolvedUser, recordPageView]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  if (!isResolvingUser && !lookupError && !resolvedUser) {
    notFound();
  }

  const displayProfile = resolvedUser?.profile;
  const contactEmail =
    displayProfile?.email || (isOwnProfile ? authUser?.email ?? "" : "");

  const handleCopyEmail = (link: LinkItem) => {
    if (!contactEmail || !targetUserId) return;
    navigator.clipboard.writeText(contactEmail);
    recordLinkClick(link.id, targetUserId);
    setCopiedId(link.id);
    showToast(`ADDRESS COPIED: ${contactEmail}`);
    window.setTimeout(() => {
      setCopiedId((current) => (current === link.id ? null : current));
    }, 2400);
  };

  const handleCopyPageUrl = () => {
    const sharePath = buildPublicProfileHref(
      displayProfile?.displayName || cleanedDisplayName
    );
    const shareUrl =
      typeof window !== "undefined" ? window.location.href : sharePath;
    navigator.clipboard.writeText(shareUrl);
    showToast("PROFILE LINK COPIED");
  };

  if (isResolvingUser) {
    return (
      <div className="min-h-screen w-full bg-canvas text-ink flex flex-col font-sans">
        <SiteHeader onToast={showToast} />

        <main className="mx-auto w-full max-w-md flex-1 px-4 sm:px-6 py-16 flex flex-col items-center justify-center">
          <Card className="w-full p-8 flex flex-col items-center text-center space-y-3">
            <Loader2
              className="size-5 animate-spin text-body-mid"
              strokeWidth={1.5}
            />
            <p className="font-mono text-xs uppercase tracking-[1.2px] text-body-mid">
              RESOLVING PROFILE · {cleanedDisplayName}
            </p>
            <p className="text-sm text-body-mid">
              사용자 프로필과 링크 목록을 조회하고 있습니다...
            </p>
          </Card>
        </main>

        <footer className="py-8 px-4 text-center">
          <p className="font-mono text-xs text-body-mid">
            © {new Date().getFullYear()} MyLink. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  if (lookupError) {
    if (!isAuthenticated && isPermissionError(lookupError)) {
      return (
        <div className="min-h-screen w-full bg-canvas text-ink flex flex-col font-sans">
          <SiteHeader onToast={showToast} />

          <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 flex-1 flex flex-col">
            <AuthRequiredView
              description={`@${cleanedDisplayName} 프로필을 조회하려면\nGoogle 계정으로 먼저 로그인해 주세요.`}
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

    return (
      <div className="min-h-screen w-full bg-canvas text-ink flex flex-col font-sans">
        <SiteHeader onToast={showToast} />

        <main className="mx-auto w-full max-w-md flex-1 px-4 sm:px-6 py-16 space-y-4">
          <FirestoreStatusBanner
            isLoading={false}
            error={getProfileFirestoreErrorMessage(lookupError)}
            onRetry={() => void publicUserQuery.refetch()}
            theme="xai"
          />
          <div className="text-center">
            <Link
              href="/"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              홈으로 돌아가기
            </Link>
          </div>
        </main>

        <footer className="py-8 px-4 text-center">
          <p className="font-mono text-xs text-body-mid">
            © {new Date().getFullYear()} MyLink. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  const resolvedDisplayName =
    displayProfile?.displayName || cleanedDisplayName;

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
            src={
              displayProfile?.avatarUrl ||
              (isOwnProfile ? authUser?.photoURL : undefined)
            }
            name={resolvedDisplayName}
            size={84}
            priority
          />

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-normal tracking-[-0.03em] text-ink">
                {resolvedDisplayName}
              </h1>
              {isOwnProfile && (
                <Badge variant="default" className="text-[10px]">
                  MY PAGE
                </Badge>
              )}
            </div>
            <p className="font-mono text-xs text-body-mid">
              @{resolvedDisplayName}
            </p>
          </div>

          {displayProfile?.bio?.trim() && (
            <p className="text-sm font-normal text-body max-w-sm leading-relaxed break-words">
              {displayProfile.bio}
            </p>
          )}

          {isOwnProfile && contactEmail && (
            <p className="text-sm font-normal text-body-mid">{contactEmail}</p>
          )}
        </section>

        <FirestoreStatusBanner
          isLoading={isLoadingLinks}
          error={linksError}
          loadingMessage={`Firestore(${linksPath})에서 링크 목록을 불러오는 중입니다...`}
          onRetry={() => void linksQuery.refetch()}
          theme="xai"
        />

        {/* 공개 링크 목록 (users/{userId}/links) */}
        <section
          aria-label="공개 링크 목록"
          className={cn(
            "space-y-2.5 transition-opacity",
            isLoadingLinks && "opacity-65"
          )}
        >
          {activeLinks.length === 0 && !isLoadingLinks && !linksError ? (
            <Card className="p-7 text-center space-y-4">
              <p className="text-sm font-normal text-body">
                현재 공개된 링크가 없습니다.
              </p>
              {isOwnProfile && (
                <Link
                  href="/"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  마이페이지에서 링크 추가
                </Link>
              )}
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
                onLinkClick={(item) => recordLinkClick(item.id, targetUserId)}
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
