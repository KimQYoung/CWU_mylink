"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Check,
  Copy,
  ExternalLink,
  FolderKanban,
  Loader2,
  LogOut,
  RefreshCw,
  User,
} from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { getDisplayNameFromAuthUser } from "@/lib/firebase-auth";
import { getUserLinksPath } from "@/lib/firestore-links";
import { useResolvedUserProfile } from "@/lib/queries/user-data";
import { useProfileStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ProfileDropdownProps {
  onToast?: (message: string) => void;
}

const MENU_ITEM_CLASS =
  "flex w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-2 text-xs font-normal text-body transition-colors outline-none cursor-pointer data-[highlighted]:bg-canvas-soft data-[highlighted]:text-ink disabled:opacity-45 disabled:pointer-events-none";

/**
 * Base UI Menu 기반 헤더 프로필 드롭다운
 * - 계정 정보(Display Name, 전체 이메일, UID 복사), 개인화 Firestore 경로·링크 통계, 빠른 이동·액션, 세션 제어를 제공합니다.
 */
export function ProfileDropdown({ onToast }: ProfileDropdownProps) {
  const isAuthSubmitting = useProfileStore((state) => state.isAuthSubmitting);
  const signInWithGoogleAction = useProfileStore(
    (state) => state.signInWithGoogleAction
  );
  const signOutAction = useProfileStore((state) => state.signOutAction);
  const {
    authUser,
    profile,
    firestoreStatus,
    isLoadingLinks: isSyncing,
    refetchLinks,
  } = useResolvedUserProfile();

  const [copiedKey, setCopiedKey] = useState<"uid" | "publicUrl" | null>(null);

  if (!authUser) return null;

  const displayName =
    profile.name?.trim() || getDisplayNameFromAuthUser(authUser);
  const avatarSrc = profile.avatarUrl || authUser.photoURL;
  const linksPath = getUserLinksPath(authUser.uid);
  const shortUid =
    authUser.uid.length > 14
      ? `${authUser.uid.slice(0, 6)}...${authUser.uid.slice(-4)}`
      : authUser.uid;

  const totalLinks = profile.links.length;
  const activeLinks = profile.links.filter((link) => link.isActive).length;
  const totalClicks = profile.links.reduce(
    (sum, link) => sum + (link.clicks ?? 0),
    0
  );

  const statusDotClass =
    firestoreStatus === "error"
      ? "bg-red-400"
      : isSyncing
      ? "bg-amber-400 animate-pulse"
      : "bg-emerald-400";
  const statusLabel =
    firestoreStatus === "error"
      ? "ERROR"
      : isSyncing
      ? "SYNCING"
      : "ACTIVE";

  const copyText = (text: string, key: "uid" | "publicUrl", toastMsg: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onToast?.(toastMsg);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 2000);
  };

  const handleCopyPublicUrl = () => {
    const publicPath = `/${profile.username}`;
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${publicPath}`
        : publicPath;
    copyText(fullUrl, "publicUrl", `PUBLIC URL COPIED: ${publicPath}`);
  };

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`${displayName} 프로필 메뉴 열기`}
        className="inline-flex items-center justify-center rounded-full border border-hairline p-0.5 transition-colors outline-none cursor-pointer hover:border-white/40 focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/25 data-[popup-open]:border-white/50"
      >
        <UserAvatar
          src={avatarSrc}
          name={displayName}
          size={32}
        />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-hairline bg-canvas-card p-1.5 text-ink shadow-none outline-none transition-all duration-150 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0">
            {/* 1. 계정 정보 */}
            <div className="rounded-md bg-canvas-soft/60 px-3 py-2.5 space-y-2">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar
                  src={avatarSrc}
                  name={displayName}
                  size={38}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-ink truncate">
                      {displayName}
                    </span>
                    <Badge
                      variant="active"
                      className="px-1.5 py-0 text-[9px] tracking-[1px]"
                    >
                      GOOGLE
                    </Badge>
                  </div>
                  {authUser.email && (
                    <p className="font-mono text-[11px] text-body-mid truncate mt-0.5">
                      {authUser.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-hairline pt-2 font-mono text-[10px]">
                <span className="text-body-mid uppercase tracking-[1px] shrink-0">
                  UID · {shortUid}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    copyText(authUser.uid, "uid", "UID COPIED TO CLIPBOARD")
                  }
                  className="h-auto px-1.5 py-0.5 font-mono text-[10px] text-body-mid hover:text-ink"
                >
                  {copiedKey === "uid" ? (
                    <>
                      <Check className="size-3 text-emerald-400" strokeWidth={1.75} />
                      <span className="text-emerald-400">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" strokeWidth={1.5} />
                      <span>COPY</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Menu.Separator className="my-1.5 h-px bg-hairline" />

            {/* 2. 개인화 Firestore 경로 및 미니 통계 */}
            <div className="px-2.5 py-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-body-mid">
                  FIRESTORE PATH
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1px] text-body-mid">
                  <span className={cn("size-1.5 rounded-full", statusDotClass)} />
                  <span>{statusLabel}</span>
                </span>
              </div>
              <p className="font-mono text-[11px] text-body break-all rounded border border-hairline bg-canvas px-2 py-1">
                {linksPath}
              </p>

              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <div className="rounded border border-hairline bg-canvas px-2 py-1.5 text-center">
                  <span className="block font-mono text-[9px] uppercase tracking-[1px] text-body-mid">
                    LINKS
                  </span>
                  <span className="font-mono text-xs text-ink">
                    {String(totalLinks).padStart(2, "0")}
                  </span>
                </div>
                <div className="rounded border border-hairline bg-canvas px-2 py-1.5 text-center">
                  <span className="block font-mono text-[9px] uppercase tracking-[1px] text-body-mid">
                    PUBLIC
                  </span>
                  <span className="font-mono text-xs text-ink">
                    {String(activeLinks).padStart(2, "0")}
                  </span>
                </div>
                <div className="rounded border border-hairline bg-canvas px-2 py-1.5 text-center">
                  <span className="block font-mono text-[9px] uppercase tracking-[1px] text-body-mid">
                    CLICKS
                  </span>
                  <span className="font-mono text-xs text-sunset">
                    {totalClicks.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Menu.Separator className="my-1.5 h-px bg-hairline" />

            {/* 3. 빠른 이동 및 액션 */}
            <Menu.Group>
              <Menu.Item
                onClick={handleCopyPublicUrl}
                className={MENU_ITEM_CLASS}
              >
                <span className="inline-flex items-center gap-2 min-w-0">
                  <Copy className="size-3.5 text-body-mid shrink-0" strokeWidth={1.5} />
                  <span className="truncate">
                    내 공개 링크 복사 (/{profile.username})
                  </span>
                </span>
                {copiedKey === "publicUrl" && (
                  <Check className="size-3.5 text-emerald-400 shrink-0" strokeWidth={1.75} />
                )}
              </Menu.Item>

              <Menu.LinkItem
                closeOnClick
                render={<Link href="/" />}
                className={MENU_ITEM_CLASS}
              >
                <span className="inline-flex items-center gap-2">
                  <User className="size-3.5 text-body-mid shrink-0" strokeWidth={1.5} />
                  <span>마이페이지</span>
                </span>
              </Menu.LinkItem>

              <Menu.LinkItem
                closeOnClick
                render={<Link href="/links" />}
                className={MENU_ITEM_CLASS}
              >
                <span className="inline-flex items-center gap-2">
                  <FolderKanban className="size-3.5 text-body-mid shrink-0" strokeWidth={1.5} />
                  <span>링크 디렉토리 관리</span>
                </span>
                <span className="font-mono text-[10px] text-body-mid">
                  {totalLinks}
                </span>
              </Menu.LinkItem>

              <Menu.LinkItem
                closeOnClick
                render={<Link href={`/${profile.username}`} />}
                className={MENU_ITEM_CLASS}
              >
                <span className="inline-flex items-center gap-2">
                  <ExternalLink className="size-3.5 text-body-mid shrink-0" strokeWidth={1.5} />
                  <span>공개 프로필 보기</span>
                </span>
              </Menu.LinkItem>

              <Menu.Item
                disabled={isSyncing}
                onClick={() => void refetchLinks()}
                className={MENU_ITEM_CLASS}
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCw
                    className={cn(
                      "size-3.5 text-body-mid shrink-0",
                      isSyncing && "animate-spin"
                    )}
                    strokeWidth={1.5}
                  />
                  <span>
                    {isSyncing ? "Firestore 동기화 중..." : "Firestore 새로고침"}
                  </span>
                </span>
              </Menu.Item>
            </Menu.Group>

            <Menu.Separator className="my-1.5 h-px bg-hairline" />

            {/* 4. 세션 제어 */}
            <Menu.Group>
              <Menu.Item
                disabled={isAuthSubmitting}
                onClick={() => void signInWithGoogleAction()}
                className={MENU_ITEM_CLASS}
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeftRight className="size-3.5 text-body-mid shrink-0" strokeWidth={1.5} />
                  <span>다른 Google 계정으로 전환</span>
                </span>
              </Menu.Item>

              <Menu.Item
                disabled={isAuthSubmitting}
                onClick={() => void signOutAction()}
                className={cn(
                  MENU_ITEM_CLASS,
                  "text-red-400 data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-300"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {isAuthSubmitting ? (
                    <Loader2 className="size-3.5 animate-spin shrink-0" strokeWidth={1.5} />
                  ) : (
                    <LogOut className="size-3.5 shrink-0" strokeWidth={1.5} />
                  )}
                  <span>로그아웃</span>
                </span>
              </Menu.Item>
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
