"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import {
  AddLinkDialog,
  type AddedLinkSummary,
} from "@/components/add-link-dialog";
import { AuthRequiredView } from "@/components/auth-required-view";
import { DeleteLinkDialog } from "@/components/delete-link-dialog";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { FirestoreStatusBanner } from "@/components/firestore-status-banner";
import { LinkCard } from "@/components/link-card";
import { SiteHeader } from "@/components/site-header";
import { StatusToast } from "@/components/status-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import {
  getUserLinksPath,
  sortLinksByCreatedAtDesc,
} from "@/lib/firestore-links";
import {
  useLinkActions,
  useResolvedUserProfile,
} from "@/lib/queries/user-data";
import { DEFAULT_PROFILE } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { useLinkManagement } from "@/lib/use-link-management";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types";

export default function Home() {
  const hasMounted = useHydrated();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);

  const {
    authStatus,
    authUser,
    profile: storeProfile,
    firestoreError,
    isLoadingLinks: isQueryLoadingLinks,
    isSavingProfile,
    profileError,
    updatingLinkIds,
    refetchLinks,
    refetchProfile,
    clearProfileError,
  } = useResolvedUserProfile();
  const { updateLink, deleteLink, recordLinkClick } = useLinkActions();

  const isAuthenticated =
    hasMounted && authStatus === "authenticated" && Boolean(authUser);
  const profile = isAuthenticated ? storeProfile : DEFAULT_PROFILE;
  const linksPath = getUserLinksPath(isAuthenticated ? authUser?.uid : null);
  const isLoadingLinks = isAuthenticated && isQueryLoadingLinks;

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
    void navigator.clipboard?.writeText(profile.email);
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

  const orderedLinks = useMemo(
    () => sortLinksByCreatedAtDesc(profile.links),
    [profile.links]
  );

  return (
    <div className="min-h-screen w-full bg-canvas text-ink font-sans selection:bg-white/20 selection:text-white flex flex-col">
      <SiteHeader onToast={showToast} />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 flex-1 flex flex-col">
        {!isAuthenticated ? (
          <AuthRequiredView />
        ) : (
          <div className="mx-auto w-full max-w-md py-10 sm:py-16 flex flex-col space-y-7">
            {/* 중앙 정렬 사용자 프로필 헤더 */}
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

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSavingProfile}
                aria-busy={isSavingProfile}
                onClick={() => setIsEditProfileDialogOpen(true)}
                className="mt-1"
              >
                {isSavingProfile ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Pencil className="size-3.5" strokeWidth={1.5} />
                )}
                <span>{isSavingProfile ? "프로필 저장 중..." : "프로필 수정"}</span>
              </Button>
            </section>

            {/* 링크 추가 버튼 */}
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full"
            >
              <Plus className="size-4" strokeWidth={1.75} />
              <span>새로운 링크 추가하기</span>
            </Button>

            {/* 프로필 저장 오류/롤백 배너 */}
            <FirestoreStatusBanner
              isLoading={false}
              error={hasMounted ? profileError : null}
              onRetry={() => {
                clearProfileError();
                void refetchProfile();
              }}
            />

            {/* 로딩/오류 시에만 표시되는 상태 배너 */}
            <FirestoreStatusBanner
              isLoading={isLoadingLinks}
              error={hasMounted ? firestoreError : null}
              loadingMessage={`Firestore(${linksPath})에서 링크 목록을 불러오는 중입니다...`}
              onRetry={() => void refetchLinks()}
            />

            {/* 개인화 링크 목록 */}
            <section aria-label="내 링크 목록" className="space-y-3">
              {orderedLinks.length === 0 && !isLoadingLinks ? (
                <Card className="p-7 text-center space-y-2">
                  <p className="text-sm font-normal text-body">
                    아직 등록된 링크가 없습니다.
                  </p>
                  <p className="text-xs text-body-mid">
                    상단의 버튼을 눌러 첫 번째 링크를 추가해 보세요.
                  </p>
                </Card>
              ) : (
                <div
                  className={cn(
                    "space-y-2.5 transition-opacity",
                    isLoadingLinks && "opacity-65"
                  )}
                >
                  {orderedLinks.map((link, index) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      index={index}
                      mode="mypage"
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
          </div>
        )}
      </main>

      <footer className="py-8 px-4 text-center">
        <p className="font-mono text-xs text-body-mid">
          © {new Date().getFullYear()} MyLink. All rights reserved.
        </p>
      </footer>

      {isAuthenticated && (
        <>
          <EditProfileDialog
            open={isEditProfileDialogOpen}
            onOpenChange={setIsEditProfileDialogOpen}
            onSaved={(updated) =>
              showToast(`PROFILE UPDATED: ${updated.displayName}`)
            }
            onSaveRollback={(errorMessage) =>
              showToast(`PROFILE ROLLBACK: ${errorMessage}`)
            }
          />

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
