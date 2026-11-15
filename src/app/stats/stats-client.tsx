"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ArrowUpRight,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Share2,
} from "lucide-react";
import {
  AddLinkDialog,
  type AddedLinkSummary,
} from "@/components/add-link-dialog";
import { DeleteLinkDialog } from "@/components/delete-link-dialog";
import { FirestoreStatusBanner } from "@/components/firestore-status-banner";
import { LinkCard } from "@/components/link-card";
import { SiteHeader } from "@/components/site-header";
import { StatsCharts } from "@/components/stats-charts";
import { StatusToast } from "@/components/status-toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  getUserLinksPath,
  sortLinksByCreatedAtDesc,
} from "@/lib/firestore-links";
import { buildPublicProfileHref } from "@/lib/firestore-profile";
import {
  useLinkActions,
  useResolvedUserProfile,
} from "@/lib/queries/user-data";
import { DEFAULT_PROFILE } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { useLinkManagement } from "@/lib/use-link-management";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types";

type StatusFilter = "all" | "active" | "hidden";
type SortMode = "latest" | "clicks";

/**
 * 로그인 사용자 전용 링크 관리 & 클릭 통계 통합 대시보드 (`/stats`) 클라이언트 뷰
 * - 비로그인 상태일 경우 메인 페이지(`/`)로 리다이렉트합니다.
 * - 모든 링크의 클릭수를 합산한 KPI, shadcn 차트, 검색·필터·편집·공개 토글이 가능한 링크 디렉토리를 제공합니다.
 */
export function StatsClient() {
  const router = useRouter();
  const hasMounted = useHydrated();
  const {
    authStatus,
    authUser,
    profile: storeProfile,
    firestoreError,
    isLoadingLinks: isQueryLoadingLinks,
    updatingLinkIds,
    refetchLinks,
  } = useResolvedUserProfile();
  const { toggleLink, updateLink, deleteLink, recordLinkClick } =
    useLinkActions();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const isAuthLoading = !hasMounted || authStatus === "loading";
  const isAuthenticated =
    hasMounted && authStatus === "authenticated" && Boolean(authUser);
  const shouldRedirect = hasMounted && authStatus !== "loading" && !authUser;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/");
    }
  }, [shouldRedirect, router]);

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

  const orderedLinks = useMemo(
    () => sortLinksByCreatedAtDesc(profile.links),
    [profile.links]
  );

  // 모든 링크(공개 + 숨김 포함)의 클릭수 합산
  const totalClicks = useMemo(
    () => orderedLinks.reduce((sum, link) => sum + (link.clicks ?? 0), 0),
    [orderedLinks]
  );

  const activeCount = useMemo(
    () => orderedLinks.filter((link) => link.isActive).length,
    [orderedLinks]
  );
  const hiddenCount = orderedLinks.length - activeCount;

  const activeClicks = useMemo(
    () =>
      orderedLinks
        .filter((link) => link.isActive)
        .reduce((sum, link) => sum + (link.clicks ?? 0), 0),
    [orderedLinks]
  );
  const hiddenClicks = totalClicks - activeClicks;

  const topLink = useMemo(() => {
    if (orderedLinks.length === 0) return null;
    const sorted = [...orderedLinks].sort(
      (a, b) => (b.clicks ?? 0) - (a.clicks ?? 0) || a.order - b.order
    );
    return (sorted[0]?.clicks ?? 0) > 0 ? sorted[0] : null;
  }, [orderedLinks]);

  const averageClicks =
    orderedLinks.length > 0
      ? (totalClicks / orderedLinks.length).toFixed(1)
      : "0.0";

  const filteredLinks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = orderedLinks.filter((link) => {
      if (statusFilter === "active" && !link.isActive) return false;
      if (statusFilter === "hidden" && link.isActive) return false;

      if (!query) return true;

      return (
        link.title.toLowerCase().includes(query) ||
        link.description.toLowerCase().includes(query) ||
        (link.url?.toLowerCase().includes(query) ?? false) ||
        (link.displayUrl?.toLowerCase().includes(query) ?? false) ||
        (link.endpointLabel?.toLowerCase().includes(query) ?? false)
      );
    });

    if (sortMode === "clicks") {
      return [...filtered].sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));
    }
    return filtered;
  }, [orderedLinks, searchQuery, statusFilter, sortMode]);

  const handleCopyEmail = (link: LinkItem) => {
    if (!profile.email) return;
    void navigator.clipboard?.writeText(profile.email);
    recordLinkClick(link.id);
    setCopiedLinkId(link.id);
    showToast(`ADDRESS COPIED: ${profile.email}`);
    window.setTimeout(() => {
      setCopiedLinkId((current) => (current === link.id ? null : current));
    }, 2400);
  };

  const handleToggleActive = (id: string) => {
    const target = orderedLinks.find((l) => l.id === id);
    toggleLink(id);
    if (target) {
      const label =
        target.endpointLabel ||
        `ENDPOINT ${String(target.order).padStart(2, "0")}`;
      showToast(`${label} ${target.isActive ? "HIDDEN" : "ACTIVATED"}`);
    }
  };

  const publicPageHref = buildPublicProfileHref(profile.name);

  const handleCopyPublicUrl = () => {
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${publicPageHref}`
        : publicPageHref;
    void navigator.clipboard?.writeText(fullUrl);
    showToast(`PUBLIC URL COPIED: /${profile.name}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortMode("latest");
  };

  const handleLinkAdded = (created: AddedLinkSummary) => {
    setSearchQuery("");
    if (
      (statusFilter === "hidden" && created.isActive) ||
      (statusFilter === "active" && !created.isActive)
    ) {
      setStatusFilter("all");
    }
    showToast(`${created.endpointLabel} ADDED: ${created.title}`);
  };

  return (
    <div className="min-h-screen w-full bg-canvas text-ink font-sans selection:bg-white/20 selection:text-white flex flex-col">
      <SiteHeader onToast={showToast} />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 py-8 sm:py-16 flex-1 flex flex-col space-y-8 sm:space-y-10">
        {isAuthLoading || !isAuthenticated ? (
          <section
            aria-live="polite"
            className="flex flex-1 flex-col items-center justify-center py-24 text-center space-y-4"
          >
            <Loader2
              className="size-6 animate-spin text-body-mid"
              strokeWidth={1.5}
            />
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              {shouldRedirect
                ? "로그인이 필요합니다. 메인 페이지로 이동 중..."
                : "세션 확인 중..."}
            </p>
          </section>
        ) : (
          <>
            {/* HERO BAND */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                <div className="space-y-3">
                  <p className="font-mono text-xs sm:text-sm uppercase tracking-[1.4px] text-body-mid">
                    {"// LINK DIRECTORY & ANALYTICS"}
                  </p>
                  <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.035em] text-ink leading-none">
                    Links &amp; Stats
                  </h1>
                  <p className="text-sm sm:text-lg font-normal text-body max-w-2xl leading-relaxed">
                    {profile.name} ({profile.callsign})의 통합 링크 관리 및 클릭
                    통계 대시보드입니다. Firestore 경로({linksPath})와 연동되어
                    공개 상태 전환, 링크 편집 및 전체 클릭 통계를 한곳에서
                    관리합니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:flex items-center gap-2.5 shrink-0 w-full md:w-auto">
                  <Link
                    href={publicPageHref}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "w-full sm:w-auto"
                    )}
                  >
                    <span>Public Page</span>
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={handleCopyPublicUrl}
                    className="w-full sm:w-auto"
                  >
                    <Share2 className="size-4" strokeWidth={1.5} />
                    <span>Copy Public URL</span>
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="default"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="min-[380px]:col-span-2 sm:col-span-1 w-full sm:w-auto"
                  >
                    <Plus className="size-4" strokeWidth={1.5} />
                    <span>링크 추가</span>
                  </Button>
                </div>
              </div>

              {/* KPI TELEMETRY STRIP */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <Card className="p-4 sm:p-5 space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block">
                    TOTAL CLICKS
                  </span>
                  <p className="text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-sunset tabular-nums">
                    {totalClicks.toLocaleString()}
                  </p>
                  <p className="font-mono text-[11px] text-body-mid">
                    전체 {orderedLinks.length}개 링크 합산 (공개{" "}
                    {activeClicks.toLocaleString()} · 숨김{" "}
                    {hiddenClicks.toLocaleString()})
                  </p>
                </Card>

                <Card className="p-4 sm:p-5 space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block">
                    TOTAL ENDPOINTS
                  </span>
                  <p className="text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-ink tabular-nums">
                    {String(orderedLinks.length).padStart(2, "0")}
                  </p>
                  <p className="font-mono text-[11px] text-body-mid">
                    {activeCount} ACTIVE · {hiddenCount} HIDDEN
                  </p>
                </Card>

                <Card className="p-4 sm:p-5 space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block">
                    AVG CLICKS / LINK
                  </span>
                  <p className="text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-ink tabular-nums">
                    {averageClicks}
                  </p>
                  <p className="font-mono text-[11px] text-body-mid">
                    링크당 평균 클릭수
                  </p>
                </Card>

                <Card className="p-4 sm:p-5 space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block">
                    TOP PERFORMER
                  </span>
                  <p className="text-xl sm:text-2xl font-normal tracking-[-0.02em] text-ink truncate">
                    {topLink ? topLink.title : "-"}
                  </p>
                  <p className="font-mono text-[11px] text-body-mid tabular-nums">
                    {topLink
                      ? `${(topLink.clicks ?? 0).toLocaleString()} CLICKS`
                      : "클릭 데이터 없음"}
                  </p>
                </Card>
              </div>
            </section>

            <Separator />

            {/* SHADCN CHARTS */}
            <StatsCharts
              links={orderedLinks}
              totalClicks={totalClicks}
              onAddLink={() => setIsAddDialogOpen(true)}
            />

            <Separator />

            {/* CONTROLS TOOLBAR */}
            <section className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              <div className="relative flex-1 lg:max-w-md">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-body-mid"
                  strokeWidth={1.5}
                />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, URL, endpoint..."
                  aria-label="링크 검색"
                  className="pl-10"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="grid grid-cols-3 sm:flex items-center gap-2">
                  {(
                    [
                      { id: "all", label: `ALL (${orderedLinks.length})` },
                      { id: "active", label: `ACTIVE (${activeCount})` },
                      { id: "hidden", label: `HIDDEN (${hiddenCount})` },
                    ] as const
                  ).map((tab) => (
                    <Button
                      key={tab.id}
                      type="button"
                      size="sm"
                      variant={statusFilter === tab.id ? "default" : "outline"}
                      onClick={() => setStatusFilter(tab.id)}
                      className="font-mono text-[11px] tracking-[1px] sm:tracking-[1.2px] px-2.5 sm:px-4"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setSortMode((prev) =>
                      prev === "latest" ? "clicks" : "latest"
                    )
                  }
                  className="font-mono text-[11px] tracking-[1.2px] w-full sm:w-auto"
                >
                  <ArrowUpDown className="size-3.5" strokeWidth={1.5} />
                  <span>
                    {sortMode === "latest" ? "SORT: LATEST" : "SORT: CLICKS"}
                  </span>
                </Button>
              </div>
            </section>

            {/* LINK LIST */}
            <section className="space-y-3" aria-label="링크 목록">
              <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-2 pb-1">
                <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                  {"// ENDPOINT REGISTRY"}
                </p>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={isLoadingLinks}
                    onClick={() => void refetchLinks()}
                    className="font-mono text-[10px] uppercase tracking-[1px]"
                  >
                    <RefreshCw
                      className={cn("size-3", isLoadingLinks && "animate-spin")}
                      strokeWidth={1.5}
                    />
                    <span>{isLoadingLinks ? "갱신 중..." : "새로고침"}</span>
                  </Button>
                  <span className="font-mono text-xs uppercase tracking-[1.2px] text-body-mid">
                    SHOWING {filteredLinks.length} OF {orderedLinks.length}
                  </span>
                </div>
              </div>

              <FirestoreStatusBanner
                isLoading={isLoadingLinks}
                error={hasMounted ? firestoreError : null}
                loadingMessage={`Firestore(${linksPath})에서 최신 링크 목록과 클릭 통계를 불러오는 중입니다...`}
                onRetry={() => void refetchLinks()}
              />

              {orderedLinks.length === 0 && !isLoadingLinks ? (
                <Card className="p-8 sm:p-10 text-center space-y-4">
                  <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                    {"// NO REGISTERED ENDPOINTS"}
                  </p>
                  <p className="text-base font-normal text-body">
                    아직 Firestore({linksPath})에 저장된 링크가 없습니다.
                  </p>
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="size-4" strokeWidth={1.5} />
                      <span>첫 링크 추가하기</span>
                    </Button>
                  </div>
                </Card>
              ) : filteredLinks.length === 0 && !isLoadingLinks ? (
                <Card className="p-8 sm:p-10 text-center space-y-4">
                  <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                    {"// NO MATCHING ENDPOINTS"}
                  </p>
                  <p className="text-base font-normal text-body">
                    검색 조건이나 필터에 일치하는 링크가 없습니다.
                  </p>
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                    >
                      Reset Filters
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
                  {filteredLinks.map((link, index) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      index={index}
                      mode="directory"
                      theme="xai"
                      copied={copiedLinkId === link.id}
                      isUpdating={updatingLinkIds.includes(link.id)}
                      isDeleting={deletingLinkId === link.id}
                      existingLinks={profile.links}
                      isEditing={editingLinkId === link.id}
                      onCopyEmail={handleCopyEmail}
                      onLinkClick={(item) => recordLinkClick(item.id)}
                      onToggleActive={handleToggleActive}
                      onEditStart={handleEditStart}
                      onEditCancel={handleEditCancel}
                      onSaveEdit={handleSaveEdit}
                      onDeleteRequest={handleDeleteRequest}
                    />
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* FOOTER ACTIONS */}
            <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                  {`// FIRESTORE PERSISTENCE (${linksPath})`}
                </p>
                <p className="text-sm font-normal text-body-mid">
                  새로 추가한 링크와 해당 링크의 공개 상태·클릭 카운터는 Cloud
                  Firestore({linksPath})에 저장되어 새로고침 후에도 유지됩니다.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLoadingLinks}
                onClick={() => void refetchLinks()}
                className="font-mono text-[11px] uppercase tracking-[1.2px] w-full sm:w-auto"
              >
                <RefreshCw
                  className={cn("size-3.5", isLoadingLinks && "animate-spin")}
                  strokeWidth={1.5}
                />
                <span>
                  {isLoadingLinks ? "Refreshing..." : "Reload Firestore"}
                </span>
              </Button>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-hairline bg-canvas py-10 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
            {profile.name.toUpperCase()} {"//"} LINKS &amp; STATISTICS
          </p>
          <p className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">
            © {new Date().getFullYear()} {profile.name.toUpperCase()}
          </p>
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
