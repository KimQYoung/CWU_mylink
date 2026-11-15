"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUpRight,
  RotateCcw,
  Search,
  Share2,
} from "lucide-react";
import { LinkCard } from "@/components/link-card";
import { SiteHeader } from "@/components/site-header";
import { StatusToast } from "@/components/status-toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_PROFILE, useProfileStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types";

type StatusFilter = "all" | "active" | "hidden";
type SortMode = "order" | "clicks";

export default function LinksPage() {
  const hasMounted = useHydrated();
  const storeProfile = useProfileStore((state) => state.profile);
  const toggleLink = useProfileStore((state) => state.toggleLink);
  const recordLinkClick = useProfileStore((state) => state.recordLinkClick);
  const resetToDefault = useProfileStore((state) => state.resetToDefault);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("order");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const profile = hasMounted ? storeProfile : DEFAULT_PROFILE;

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  const orderedLinks = useMemo(
    () => [...profile.links].sort((a, b) => a.order - b.order),
    [profile.links]
  );

  const activeCount = useMemo(
    () => orderedLinks.filter((l) => l.isActive).length,
    [orderedLinks]
  );

  const hiddenCount = orderedLinks.length - activeCount;

  const totalClicks = useMemo(
    () => orderedLinks.reduce((sum, link) => sum + (link.clicks ?? 0), 0),
    [orderedLinks]
  );

  const totalViews = profile.analytics?.totalViews ?? 0;
  const averageCtr =
    totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

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
    navigator.clipboard.writeText(profile.email);
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

  const handleCopyPublicUrl = () => {
    const publicPath = `/${profile.username}`;
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${publicPath}`
        : publicPath;
    navigator.clipboard.writeText(fullUrl);
    showToast(`PUBLIC URL COPIED: ${publicPath}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortMode("order");
  };

  return (
    <div className="min-h-screen w-full bg-canvas text-ink font-sans selection:bg-white/20 selection:text-white flex flex-col">
      <SiteHeader
        profileName={profile.name}
        username={profile.username}
        activeRoute="links"
      />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 py-8 sm:py-16 flex-1 flex flex-col space-y-8 sm:space-y-10">
        {/* HERO BAND */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="space-y-3">
              <p className="font-mono text-xs sm:text-sm uppercase tracking-[1.4px] text-body-mid">
                {"// LINK DIRECTORY & ENDPOINTS"}
              </p>
              <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.035em] text-ink leading-none">
                Link Directory
              </h1>
              <p className="text-sm sm:text-lg font-normal text-body max-w-2xl leading-relaxed">
                {profile.name} ({profile.callsign})의 전체 링크 목록입니다. 공개 상태
                전환 및 클릭 텔레메트리를 즉시 확인할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              <Link
                href={`/${profile.username}`}
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
                variant="default"
                size="default"
                onClick={handleCopyPublicUrl}
                className="w-full sm:w-auto"
              >
                <Share2 className="size-4" strokeWidth={1.5} />
                <span>Copy Public URL</span>
              </Button>
            </div>
          </div>

          {/* KPI TELEMETRY STRIP */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <Card className="p-4 sm:p-5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block">
                TOTAL ENDPOINTS
              </span>
              <p className="text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-ink">
                {String(orderedLinks.length).padStart(2, "0")}
              </p>
            </Card>
            <Card className="p-4 sm:p-5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block">
                ACTIVE PUBLIC
              </span>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                <p className="text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-ink">
                  {String(activeCount).padStart(2, "0")}
                </p>
                <span className="text-xs text-body-mid font-mono">
                  {hiddenCount} HIDDEN
                </span>
              </div>
            </Card>
            <Card className="p-4 sm:p-5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block">
                TOTAL CLICKS
              </span>
              <p className="text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-ink">
                {totalClicks.toLocaleString()}
              </p>
            </Card>
            <Card className="p-4 sm:p-5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block">
                AVERAGE CTR
              </span>
              <p className="text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-sunset">
                {averageCtr}%
              </p>
            </Card>
          </div>
        </section>

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
                setSortMode((prev) => (prev === "order" ? "clicks" : "order"))
              }
              className="font-mono text-[11px] tracking-[1.2px] w-full sm:w-auto"
            >
              <ArrowUpDown className="size-3.5" strokeWidth={1.5} />
              <span>{sortMode === "order" ? "SORT: ORDER" : "SORT: CLICKS"}</span>
            </Button>
          </div>
        </section>

        {/* LINK LIST */}
        <section className="space-y-3" aria-label="링크 목록">
          <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-1 pb-1">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              {"// ENDPOINT REGISTRY"}
            </p>
            <span className="font-mono text-xs uppercase tracking-[1.2px] text-body-mid">
              SHOWING {filteredLinks.length} OF {orderedLinks.length}
            </span>
          </div>

          {filteredLinks.length === 0 ? (
            <Card className="p-8 sm:p-10 text-center space-y-4">
              <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                {"// NO MATCHING ENDPOINTS"}
              </p>
              <p className="text-base font-normal text-body">
                검색 조건이나 필터에 일치하는 링크가 없습니다.
              </p>
              <div className="pt-1">
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Reset Filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link, index) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  index={index}
                  mode="directory"
                  theme="xai"
                  copied={copiedLinkId === link.id}
                  onCopyEmail={handleCopyEmail}
                  onLinkClick={(item) => recordLinkClick(item.id)}
                  onToggleActive={handleToggleActive}
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
              {"// LOCALSTORAGE PERSISTENCE"}
            </p>
            <p className="text-sm font-normal text-body-mid">
              변경된 공개 상태와 클릭 카운터는 브라우저 LocalStorage에 즉시 저장됩니다.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              resetToDefault();
              showToast("RESET TO DEFAULT DUMMY_LINKS (7 ENDPOINTS)");
            }}
            className="font-mono text-[11px] uppercase tracking-[1.2px] w-full sm:w-auto"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.5} />
            <span>Reset Default Data</span>
          </Button>
        </section>
      </main>

      <footer className="border-t border-hairline bg-canvas py-10 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
            {profile.name.toUpperCase()} {"//"} LINK DIRECTORY
          </p>
          <p className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">
            © {new Date().getFullYear()} {profile.name.toUpperCase()}
          </p>
        </div>
      </footer>

      <StatusToast message={toastMessage} theme="xai" />
    </div>
  );
}
