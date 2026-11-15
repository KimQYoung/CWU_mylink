"use client";

import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LinkIcon } from "@/components/link-icon";
import { CopyFeedbackContent } from "@/components/status-toast";
import { cn } from "@/lib/utils";
import type { LinkItem, ThemeId } from "@/types";

interface LinkCardProps {
  link: LinkItem;
  index: number;
  mode?: "directory" | "public";
  theme?: ThemeId;
  copied?: boolean;
  onCopyEmail?: (link: LinkItem) => void;
  onLinkClick?: (link: LinkItem) => void;
  onToggleActive?: (id: string) => void;
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
    primaryCta: string;
    outlineCta: string;
  }
> = {
  xai: {
    card: "rounded-lg border border-hairline bg-canvas-card p-4 sm:p-6 shadow-none hover:border-white/25 transition-colors",
    divider: "border-hairline",
    iconBox:
      "size-9 sm:size-10 rounded-lg border border-hairline bg-canvas-soft text-ink flex items-center justify-center shrink-0",
    meta: "font-mono text-[11px] sm:text-xs uppercase tracking-[1.2px] text-body-mid",
    subUrl: "font-mono text-xs text-body break-all",
    title: "text-lg sm:text-xl font-normal tracking-[-0.02em] text-ink",
    desc: "text-sm font-normal text-body-mid leading-relaxed",
    primaryCta: "",
    outlineCta: "",
  },
  neobrutalism: {
    card: "rounded-xl border-[3px] border-black bg-white p-4 sm:p-5 text-black shadow-[6px_6px_0px_#000] hover:bg-[#FFFDF5] transition-colors",
    divider: "border-black/15",
    iconBox:
      "size-9 sm:size-10 rounded-lg border-2 border-black bg-[#FFE600] text-black flex items-center justify-center shrink-0",
    meta: "font-mono text-[11px] uppercase tracking-[1px] text-black/65",
    subUrl: "font-mono text-xs text-black/75 break-all",
    title: "text-base sm:text-lg font-bold tracking-normal text-black",
    desc: "text-xs sm:text-sm text-black/80 leading-relaxed",
    primaryCta:
      "border-2 border-black bg-[#FFE600] text-black font-bold shadow-[3px_3px_0px_#000] hover:bg-[#FFE600] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
    outlineCta:
      "border-2 border-black bg-[#7BF1A8] text-black font-bold shadow-[3px_3px_0px_#000] hover:bg-[#7BF1A8] hover:border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
  },
  modern: {
    card: "rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 text-slate-900 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all",
    divider: "border-slate-100",
    iconBox:
      "size-9 sm:size-10 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0",
    meta: "font-mono text-[11px] uppercase tracking-[1px] text-slate-400",
    subUrl: "font-mono text-xs text-slate-500 break-all",
    title: "text-base sm:text-lg font-medium tracking-normal text-slate-900",
    desc: "text-xs sm:text-sm text-slate-500 leading-relaxed",
    primaryCta:
      "border-indigo-600 bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:border-indigo-700",
    outlineCta:
      "border-slate-200 bg-slate-50 text-slate-800 font-medium hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700",
  },
};

/**
 * shadcn/ui Card / Button / Badge / Switch 기반의 재사용 가능한 링크 카드 컴포넌트
 * - 모바일에서는 메타 헤더 / 본문 / 하단 액션 바를 수직 계층으로 배치하여 가독성을 확보합니다.
 */
export function LinkCard({
  link,
  index,
  mode = "public",
  theme = "xai",
  copied = false,
  onCopyEmail,
  onLinkClick,
  onToggleActive,
}: LinkCardProps) {
  const endpointNumber = String(link.order || index + 1).padStart(2, "0");
  const label = link.endpointLabel || `ENDPOINT ${endpointNumber}`;
  const display = link.displayUrl || link.url || "";
  const isDirectory = mode === "directory";
  const themeStyles = PUBLIC_THEME_CARD[theme];

  return (
    <Card
      className={cn(
        themeStyles.card,
        "flex flex-col justify-between gap-4",
        isDirectory ? "lg:flex-row lg:items-center lg:gap-6" : "sm:flex-row sm:items-center sm:gap-5",
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
        </div>
      </div>

      {/* Action Footer on Mobile / Inline Right on Desktop */}
      <div
        className={cn(
          "flex flex-col gap-3 pt-3 border-t shrink-0",
          themeStyles.divider,
          isDirectory
            ? "sm:flex-row sm:items-center sm:justify-between lg:justify-end lg:border-t-0 lg:pt-0"
            : "sm:flex-row sm:items-center sm:border-t-0 sm:pt-0"
        )}
      >
        {isDirectory && onToggleActive && (
          <div className="flex items-center justify-between sm:justify-start gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid sm:hidden">
              PUBLIC VISIBILITY
            </span>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <Switch
                checked={link.isActive}
                onCheckedChange={() => onToggleActive(link.id)}
                aria-label={`${link.title} 공개 여부 토글`}
              />
              <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid sm:w-14">
                {link.isActive ? "VISIBLE" : "HIDDEN"}
              </span>
            </label>
          </div>
        )}

        {link.isAction && link.actionType === "copy-email" ? (
          <Button
            type="button"
            variant="default"
            onClick={() => onCopyEmail?.(link)}
            className={cn("w-full sm:w-auto", themeStyles.primaryCta)}
          >
            <CopyFeedbackContent
              copied={copied}
              defaultLabel={link.buttonText || "Copy Address"}
              copiedLabel={mode === "public" ? "Copied" : "Copied to Clipboard"}
            />
          </Button>
        ) : (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLinkClick?.(link)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto",
              themeStyles.outlineCta
            )}
          >
            <span>
              {link.buttonText?.replace(/\s*↗$/, "") || "Open Link"}
            </span>
            <ArrowUpRight className="size-4" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </Card>
  );
}
