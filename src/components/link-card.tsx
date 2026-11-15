"use client";

import { ArrowUpRight, Loader2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LinkIcon } from "@/components/link-icon";
import { LinkInlineEditor } from "@/components/link-inline-editor";
import { CopyFeedbackContent } from "@/components/status-toast";
import {
  formatLinkTimestamp,
  type UpdateUserLinkInput,
} from "@/lib/firestore-links";
import { cn } from "@/lib/utils";
import type { LinkItem, ThemeId } from "@/types";

interface LinkCardProps {
  link: LinkItem;
  index: number;
  mode?: "directory" | "public" | "mypage";
  theme?: ThemeId;
  copied?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  existingLinks?: LinkItem[];
  isEditing?: boolean;
  onCopyEmail?: (link: LinkItem) => void;
  onLinkClick?: (link: LinkItem) => void;
  onToggleActive?: (id: string) => void;
  onEditStart?: (link: LinkItem) => void;
  onEditCancel?: () => void;
  onSaveEdit?: (id: string, input: UpdateUserLinkInput) => Promise<void>;
  onDeleteRequest?: (link: LinkItem) => void;
}

const PUBLIC_THEME_CARD: Record<
  ThemeId,
  {
    card: string;
    divider: string;
    iconBox: string;
    meta: string;
    subUrl: string;
    title: string;
    desc: string;
    indicator: string;
    focusRing: string;
  }
> = {
  xai: {
    card: "rounded-lg border border-hairline bg-canvas-card p-4 sm:p-6 shadow-none hover:border-white/35 hover:bg-canvas-soft/60 transition-colors",
    divider: "border-hairline",
    iconBox:
      "size-9 sm:size-10 rounded-lg border border-hairline bg-canvas-soft text-ink flex items-center justify-center shrink-0",
    meta: "font-mono text-[11px] sm:text-xs uppercase tracking-[1.2px] text-body-mid",
    subUrl: "font-mono text-xs text-body break-all",
    title: "text-lg sm:text-xl font-normal tracking-[-0.02em] text-ink",
    desc: "text-sm font-normal text-body-mid leading-relaxed",
    indicator: "text-body-mid group-hover:text-ink",
    focusRing: "focus-visible:after:ring-2 focus-visible:after:ring-white/40",
  },
  neobrutalism: {
    card: "rounded-xl border-[3px] border-black bg-white p-4 sm:p-5 text-black shadow-[6px_6px_0px_#000] hover:bg-[#FFFDF5] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[4px_4px_0px_#000] transition-all",
    divider: "border-black/15",
    iconBox:
      "size-9 sm:size-10 rounded-lg border-2 border-black bg-[#FFE600] text-black flex items-center justify-center shrink-0",
    meta: "font-mono text-[11px] uppercase tracking-[1px] text-black/65",
    subUrl: "font-mono text-xs text-black/75 break-all",
    title: "text-base sm:text-lg font-bold tracking-normal text-black",
    desc: "text-xs sm:text-sm text-black/80 leading-relaxed",
    indicator: "text-black/70 group-hover:text-black",
    focusRing: "focus-visible:after:ring-2 focus-visible:after:ring-black",
  },
  modern: {
    card: "rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 text-slate-900 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all",
    divider: "border-slate-100",
    iconBox:
      "size-9 sm:size-10 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0",
    meta: "font-mono text-[11px] uppercase tracking-[1px] text-slate-400",
    subUrl: "font-mono text-xs text-slate-500 break-all",
    title: "text-base sm:text-lg font-medium tracking-normal text-slate-900",
    desc: "text-xs sm:text-sm text-slate-500 leading-relaxed",
    indicator: "text-slate-400 group-hover:text-indigo-600",
    focusRing: "focus-visible:after:ring-2 focus-visible:after:ring-indigo-400",
  },
};

/**
 * shadcn/ui Card / Button / Badge / Switch 기반의 재사용 가능한 링크 카드 컴포넌트
 * - 카드 블록 전체를 클릭하면 링크를 실행(새 탭 열기 또는 이메일 복사)하며, 관리 버튼은 독립적으로 동작합니다.
 */
export function LinkCard({
  link,
  index,
  mode = "public",
  theme = "xai",
  copied = false,
  isUpdating = false,
  isDeleting = false,
  existingLinks,
  isEditing = false,
  onCopyEmail,
  onLinkClick,
  onToggleActive,
  onEditStart,
  onEditCancel,
  onSaveEdit,
  onDeleteRequest,
}: LinkCardProps) {
  const endpointNumber = String(link.order || index + 1).padStart(2, "0");
  const label = link.endpointLabel || `ENDPOINT ${endpointNumber}`;
  const display = link.displayUrl || link.url || "";
  const isDirectory = mode === "directory";
  const isMyPage = mode === "mypage";
  const isBusy = isUpdating || isDeleting;
  const hasManagementActions = Boolean(onEditStart || onDeleteRequest);
  const showManagementFooter =
    (isDirectory && Boolean(onToggleActive)) || hasManagementActions;
  const isCopyEmailAction = Boolean(
    link.isAction && link.actionType === "copy-email"
  );
  const hasPrimaryAction = isCopyEmailAction || Boolean(link.url);
  const formattedUpdatedAt = formatLinkTimestamp(link.updatedAt);
  const themeStyles = PUBLIC_THEME_CARD[theme];

  if (isEditing && onSaveEdit) {
    return (
      <Card
        className={cn(
          themeStyles.card,
          "border-white/30"
        )}
      >
        <LinkInlineEditor
          link={link}
          endpointLabel={label}
          existingLinks={existingLinks ?? [link]}
          onCancel={() => onEditCancel?.()}
          onSave={onSaveEdit}
        />
      </Card>
    );
  }

  if (isMyPage) {
    const compactTrigger = isCopyEmailAction ? (
      <button
        type="button"
        onClick={() => onCopyEmail?.(link)}
        aria-label={`${link.title} 이메일 복사`}
        className={cn(
          "absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none cursor-pointer",
          themeStyles.focusRing
        )}
      />
    ) : link.url ? (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onLinkClick?.(link)}
        aria-label={`${link.title} 새 탭에서 열기`}
        className={cn(
          "absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none",
          themeStyles.focusRing
        )}
      />
    ) : null;

    return (
      <Card
        className={cn(
          "relative group flex flex-row items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas-card px-4 py-3.5 shadow-none hover:border-white/35 hover:bg-canvas-soft/60 transition-colors",
          hasPrimaryAction && "cursor-pointer",
          !link.isActive && "opacity-65 border-dashed"
        )}
      >
        {compactTrigger}

        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="size-9 rounded-lg border border-hairline bg-canvas-soft text-ink flex items-center justify-center shrink-0">
            <LinkIcon icon={link.icon} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-normal tracking-[-0.015em] text-ink truncate">
              {link.title}
            </h3>
            {copied && (
              <span className="font-mono text-[11px] text-emerald-400">
                COPIED TO CLIPBOARD
              </span>
            )}
          </div>
        </div>

        {hasManagementActions && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex items-center gap-1 shrink-0"
          >
            {onEditStart && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isBusy}
                onClick={() => onEditStart(link)}
                aria-label={`${link.title} 수정`}
                className="size-8 text-body-mid hover:text-ink"
              >
                <Pencil className="size-3.5" strokeWidth={1.5} />
              </Button>
            )}
            {onDeleteRequest && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isBusy}
                aria-busy={isDeleting}
                onClick={() => onDeleteRequest(link)}
                aria-label={`${link.title} 삭제`}
                className="size-8 text-body-mid hover:text-red-400 hover:bg-red-500/10"
              >
                {isDeleting ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Trash2 className="size-3.5" strokeWidth={1.5} />
                )}
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  }

  // 카드 전체를 클릭 영역으로 확장(::after)하고 관리 버튼은 z-10으로 분리
  const primaryTrigger = isCopyEmailAction ? (
    <button
      type="button"
      onClick={() => onCopyEmail?.(link)}
      aria-label={`${link.title} 이메일 복사`}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs transition-colors focus-visible:outline-none cursor-pointer shrink-0",
        "after:absolute after:inset-0 after:z-0 after:rounded-[inherit]",
        themeStyles.focusRing,
        copied ? "text-emerald-400" : themeStyles.indicator
      )}
    >
      <CopyFeedbackContent
        copied={copied}
        defaultLabel={link.buttonText || "Copy Address"}
        copiedLabel={mode === "public" ? "Copied" : "Copied to Clipboard"}
      />
    </button>
  ) : link.url ? (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onLinkClick?.(link)}
      aria-label={`${link.title} 새 탭에서 열기`}
      className={cn(
        "inline-flex items-center justify-center transition-colors focus-visible:outline-none shrink-0",
        "after:absolute after:inset-0 after:z-0 after:rounded-[inherit]",
        themeStyles.focusRing,
        themeStyles.indicator
      )}
    >
      <ArrowUpRight
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.5}
      />
    </a>
  ) : null;

  return (
    <Card
      className={cn(
        themeStyles.card,
        "relative group flex justify-between gap-4",
        hasPrimaryAction && "cursor-pointer",
        showManagementFooter
          ? "flex-col lg:flex-row lg:items-center lg:gap-6"
          : "flex-row items-center sm:gap-5",
        isDirectory && !link.isActive && "opacity-75 border-dashed"
      )}
    >
      {/* Content Block */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Mobile Header Row: Icon + Endpoint Label + Badges */}
        <div className="flex items-center justify-between gap-3 sm:block shrink-0">
          <div className="flex items-center gap-3">
            <div className={themeStyles.iconBox}>
              <LinkIcon icon={link.icon} />
            </div>
            <span className={cn(themeStyles.meta, "sm:hidden")}>{label}</span>
          </div>

          {isDirectory && (
            <div className="flex items-center gap-1.5 sm:hidden">
              <Badge variant={link.isActive ? "active" : "muted"}>
                {link.isActive ? "ACTIVE" : "HIDDEN"}
              </Badge>
              <Badge variant="default">
                {(link.clicks ?? 0).toLocaleString()}
              </Badge>
            </div>
          )}
        </div>

        {/* Text Body */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="hidden sm:flex flex-wrap items-center gap-2">
            <span className={themeStyles.meta}>{label}</span>
            {display && (
              <>
                <span className={cn(themeStyles.meta, "opacity-50")}>·</span>
                <span className={themeStyles.subUrl}>{display}</span>
              </>
            )}

            {isDirectory && (
              <>
                <Badge variant={link.isActive ? "active" : "muted"}>
                  {link.isActive ? "ACTIVE" : "HIDDEN"}
                </Badge>
                <Badge variant="default">
                  {(link.clicks ?? 0).toLocaleString()} CLICKS
                </Badge>
              </>
            )}
          </div>

          {display && (
            <p className={cn(themeStyles.subUrl, "sm:hidden")}>{display}</p>
          )}

          <h3 className={themeStyles.title}>{link.title}</h3>
          {link.description && (
            <p className={cn(themeStyles.desc, "max-w-2xl")}>
              {link.description}
            </p>
          )}
          {formattedUpdatedAt && (isDirectory || hasManagementActions) && (
            <p
              title={new Date(link.updatedAt!).toLocaleString("ko-KR")}
              className="font-mono text-[11px] uppercase tracking-[1px] text-body-mid/80"
            >
              UPDATED {formattedUpdatedAt}
            </p>
          )}
        </div>
      </div>

      {/* 관리 액션(모바일 하단 / 데스크톱 우측) 및 카드 전체 클릭 트리거 */}
      {showManagementFooter ? (
        <div
          className={cn(
            "flex flex-col gap-3 pt-3 border-t shrink-0",
            themeStyles.divider,
            "sm:flex-row sm:items-center sm:justify-between lg:justify-end lg:border-t-0 lg:pt-0"
          )}
        >
          {isDirectory && onToggleActive && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex items-center justify-between sm:justify-start gap-2.5"
            >
              <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid sm:hidden">
                PUBLIC VISIBILITY
              </span>
              <label
                className={cn(
                  "inline-flex items-center gap-2 select-none",
                  isBusy ? "cursor-wait" : "cursor-pointer"
                )}
              >
                <Switch
                  checked={link.isActive}
                  disabled={isBusy}
                  onCheckedChange={() => onToggleActive(link.id)}
                  aria-label={`${link.title} 공개 여부 토글`}
                />
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid sm:w-20">
                  {isDeleting ? (
                    <>
                      <Loader2 className="size-3 animate-spin text-red-400" strokeWidth={1.75} />
                      <span className="text-red-300">DELETING</span>
                    </>
                  ) : isUpdating ? (
                    <>
                      <Loader2 className="size-3 animate-spin text-amber-400" strokeWidth={1.75} />
                      <span className="text-amber-300">SAVING</span>
                    </>
                  ) : link.isActive ? (
                    "VISIBLE"
                  ) : (
                    "HIDDEN"
                  )}
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {hasManagementActions && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 flex items-center gap-2 flex-1 sm:flex-initial"
              >
                {onEditStart && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => onEditStart(link)}
                    aria-label={`${link.title} 수정`}
                    className="flex-1 sm:flex-none"
                  >
                    <Pencil className="size-3.5" strokeWidth={1.5} />
                    <span>수정</span>
                  </Button>
                )}

                {onDeleteRequest && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isBusy}
                    aria-busy={isDeleting}
                    onClick={() => onDeleteRequest(link)}
                    aria-label={`${link.title} 삭제`}
                    className={cn(
                      "flex-1 sm:flex-none",
                      isDeleting && "disabled:opacity-80"
                    )}
                  >
                    {isDeleting ? (
                      <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
                    ) : (
                      <Trash2 className="size-3.5" strokeWidth={1.5} />
                    )}
                    <span>삭제</span>
                  </Button>
                )}
              </div>
            )}

            {primaryTrigger}
          </div>
        </div>
      ) : (
        primaryTrigger
      )}
    </Card>
  );
}
