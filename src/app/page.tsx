"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, RefreshCw } from "lucide-react";
import {
  AddLinkDialog,
  type AddedLinkSummary,
} from "@/components/add-link-dialog";
import { AuthRequiredView } from "@/components/auth-required-view";
import { DeleteLinkDialog } from "@/components/delete-link-dialog";
import { FirestoreStatusBanner } from "@/components/firestore-status-banner";
import { LinkCard } from "@/components/link-card";
import { SiteHeader } from "@/components/site-header";
import { StatusToast } from "@/components/status-toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/user-avatar";
import {
  getUserLinksPath,
  sortLinksByCreatedAtDesc,
} from "@/lib/firestore-links";
import { DEFAULT_PROFILE, useProfileStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { useLinkManagement } from "@/lib/use-link-management";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types";

export default function Home() {
  const hasMounted = useHydrated();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const authStatus = useProfileStore((state) => state.authStatus);
  const authUser = useProfileStore((state) => state.authUser);
  const storeProfile = useProfileStore((state) => state.profile);
  const firestoreStatus = useProfileStore((state) => state.firestoreStatus);
  const firestoreError = useProfileStore((state) => state.firestoreError);
  const isRefreshingLinks = useProfileStore((state) => state.isRefreshingLinks);
  const updatingLinkIds = useProfileStore((state) => state.updatingLinkIds);
  const loadFirestoreLinks = useProfileStore(
    (state) => state.loadFirestoreLinks
  );
  const updateLink = useProfileStore((state) => state.updateLink);
  const deleteLink = useProfileStore((state) => state.deleteLink);
  const recordLinkClick = useProfileStore((state) => state.recordLinkClick);

  const isAuthenticated =
    hasMounted && authStatus === "authenticated" && Boolean(authUser);
  const profile = isAuthenticated ? storeProfile : DEFAULT_PROFILE;
  const linksPath = getUserLinksPath(isAuthenticated ? authUser?.uid : null);
  const isLoadingLinks =
    isAuthenticated && (firestoreStatus === "syncing" || isRefreshingLinks);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  const {
    editingLinkId,
    deletingLink,
    deletingLinkId,
    handleEditStart,
    handleEditCancel,
    handleSaveEdit,
    handleDeleteRequest,
    handleDeleteDialogOpenChange,
    handleConfirmDelete,
  } = useLinkManagement({
    links: profile.links,
    updateLink,
    deleteLink,
    onSuccessToast: showToast,
  });

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

  const handleLinkAdded = (created: AddedLinkSummary) => {
    showToast(
      created.isActive
        ? `${created.endpointLabel} ADDED: ${created.title}`
        : `${created.endpointLabel} SAVED AS HIDDEN`
    );
  };

  const activeLinks = useMemo(
    () => sortLinksByCreatedAtDesc(profile.links).filter((l) => l.isActive),
    [profile.links]
  );

  return (
    <div className="min-h-screen w-full bg-canvas text-ink font-sans selection:bg-white/20 selection:text-white flex flex-col">
      {/* 1. Sticky Navigation Bar */}
      <SiteHeader
        profileName={profile.name}
        username={profile.username}
        activeRoute="home"
      />

      {/* 2. Main Research Surface Container */}
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 py-10 sm:py-20 flex-1 flex flex-col space-y-12 sm:space-y-24">
        {!isAuthenticated ? (
          <AuthRequiredView />
        ) : (
          <>
            {/* HERO BAND */}
            <section className="space-y-6">
              <div className="space-y-3">
                <p className="font-mono text-xs sm:text-sm uppercase tracking-[1.4px] text-body-mid">
                  {"// MYPAGE · PERSONALIZED PROFILE"}
                </p>
                <h1 className="text-4xl sm:text-7xl md:text-8xl font-normal tracking-[-0.035em] text-ink leading-none break-words">
                  {profile.name}
                </h1>
              </div>

              <p className="text-base sm:text-xl font-normal text-body tracking-[-0.015em] max-w-2xl leading-relaxed">
                {profile.headline}
              </p>

              {/* Authenticated User & Firestore Path Telemetry Card */}
              <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 p-5 sm:p-6">
                <UserAvatar
                  src={authUser?.photoURL}
                  name={profile.name}
                  size={64}
                  priority
                />

                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full font-mono text-xs">
                  <div className="min-w-0">
                    <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">
                      USER ACCOUNT
                    </span>
                    <span className="text-ink font-normal block truncate">
                      {profile.name}
                    </span>
                    {authUser?.email && (
                      <span className="text-body-mid text-[11px] block truncate mt-0.5">
                        {authUser.email}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">
                      CALLSIGN / UID
                    </span>
                    <span className="text-ink font-normal block truncate">
                      {profile.callsign}
                    </span>
                    <span className="text-body-mid text-[11px] block break-all mt-0.5">
                      {authUser?.uid}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">
                      FIRESTORE PATH
                    </span>
                    <span className="text-ink font-normal block break-all">
                      {linksPath}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">
                      STATUS
                    </span>
                    <span className="text-sunset font-normal block">
                      {profile.status}
                    </span>
                    <span className="text-body-mid text-[11px] block mt-0.5">
                      {profile.links.length} REGISTERED LINKS
                    </span>
                  </div>
                </div>
              </Card>
            </section>

            {/* BIOGRAPHY BAND */}
            <section className="space-y-6">
              <Separator />
              <div className="space-y-4">
                <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                  {"// STATEMENT"}
                </p>
                <div className="space-y-3 max-w-3xl">
                  <p className="text-base sm:text-lg font-normal text-body leading-relaxed">
                    {profile.statementLead}
                  </p>
                  <p className="text-sm sm:text-base font-normal text-body-mid leading-relaxed">
                    {profile.statementBody}
                  </p>
                </div>
              </div>
            </section>

            {/* DIRECTORY & ACCESS (LINK CARDS LOADED FROM FIRESTORE) */}
            <section className="space-y-6">
              <Separator />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                    {"// DIRECTORY & ACCESS"}
                  </p>
                  <span className="font-mono text-xs text-body-mid uppercase tracking-[1.2px] block">
                    {activeLinks.length} VERIFIED ENDPOINTS · {linksPath}
                  </span>
                </div>

                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoadingLinks}
                    onClick={() => void loadFirestoreLinks(authUser?.uid)}
                    className="w-full sm:w-auto font-mono text-[11px] uppercase tracking-[1.2px]"
                  >
                    <RefreshCw
                      className={cn(
                        "size-3.5",
                        isLoadingLinks && "animate-spin"
                      )}
                      strokeWidth={1.5}
                    />
                    <span>{isLoadingLinks ? "갱신 중..." : "새로고침"}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="w-full sm:w-auto font-mono text-[11px] uppercase tracking-[1.2px]"
                  >
                    <Plus className="size-3.5" strokeWidth={1.5} />
                    <span>링크 추가</span>
                  </Button>
                  <Link
                    href="/links"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "min-[380px]:col-span-2 sm:col-span-1 w-full sm:w-auto font-mono text-[11px] uppercase tracking-[1.2px]"
                    )}
                  >
                    <span>All Links ({profile.links.length})</span>
                    <ArrowRight className="size-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>

              <FirestoreStatusBanner
                isLoading={isLoadingLinks}
                error={hasMounted ? firestoreError : null}
                loadingMessage={`Firestore(${linksPath})에서 최신 링크 목록을 불러오는 중입니다...`}
                onRetry={() => void loadFirestoreLinks(authUser?.uid)}
              />

              {activeLinks.length === 0 && !isLoadingLinks ? (
                <Card className="p-8 sm:p-10 text-center space-y-4">
                  <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                    {"// NO VERIFIED ENDPOINTS"}
                  </p>
                  <p className="text-sm sm:text-base font-normal text-body">
                    아직 Firestore({linksPath})에 등록된 공개 링크가 없습니다.
                  </p>
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="size-3.5" strokeWidth={1.5} />
                      <span>첫 링크 추가하기</span>
                    </Button>
                  </div>
                </Card>
              ) : (
                <div
                  className={cn(
                    "space-y-3 transition-opacity",
                    isLoadingLinks && "opacity-65"
                  )}
                >
                  {activeLinks.map((link, index) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      index={index}
                      mode="public"
                      theme="xai"
                      copied={copiedId === link.id}
                      isUpdating={updatingLinkIds.includes(link.id)}
                      isDeleting={deletingLinkId === link.id}
                      existingLinks={profile.links}
                      isEditing={editingLinkId === link.id}
                      onCopyEmail={handleCopyEmail}
                      onLinkClick={(item) => recordLinkClick(item.id)}
                      onEditStart={handleEditStart}
                      onEditCancel={handleEditCancel}
                      onSaveEdit={handleSaveEdit}
                      onDeleteRequest={handleDeleteRequest}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* CORE CAPABILITIES & STACK */}
            {profile.capabilities && profile.capabilities.length > 0 && (
              <section className="space-y-6">
                <Separator />
                <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                  {"// CAPABILITIES & ARCHITECTURE"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.capabilities.map((cap) => (
                    <Card
                      key={cap.headline}
                      className="p-5 sm:p-6 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block mb-1">
                          {cap.category}
                        </span>
                        <h4 className="text-lg font-normal text-ink tracking-[-0.02em]">
                          {cap.headline}
                        </h4>
                      </div>
                      <p className="text-sm font-normal text-body-mid leading-relaxed pt-2">
                        {cap.desc}
                      </p>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* 3. Footer Band */}
      <footer className="border-t border-hairline bg-canvas py-10 sm:py-12 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              {profile.name.toUpperCase()} {"//"} MYLINK INTERFACE
            </p>
            <p className="text-xs text-body-mid">
              Engineered with restraint • Strict Dark Canvas • xAI Design System
              • Cloud Firestore ({linksPath})
            </p>
          </div>

          <div className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">
            © {new Date().getFullYear()} {profile.name.toUpperCase()}
          </div>
        </div>
      </footer>

      {isAuthenticated && (
        <>
          <AddLinkDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAdded={handleLinkAdded}
          />

          <DeleteLinkDialog
            link={deletingLink}
            open={Boolean(deletingLink)}
            onOpenChange={handleDeleteDialogOpenChange}
            onConfirmDelete={handleConfirmDelete}
          />
        </>
      )}

      <StatusToast message={toastMessage} theme="xai" />
    </div>
  );
}
