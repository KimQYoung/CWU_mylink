"use client";

import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ThemeId } from "@/types";

interface StatusToastProps {
  message: string | null;
  theme?: ThemeId;
  className?: string;
}

const TOAST_THEME_CLASSES: Record<ThemeId, string> = {
  xai: "border-hairline bg-canvas-card text-ink rounded-lg shadow-none",
  neobrutalism:
    "border-[3px] border-black bg-[#FFE600] text-black rounded-lg shadow-[4px_4px_0px_#000]",
  modern:
    "border-slate-200 bg-slate-900 text-white rounded-xl shadow-lg",
};

/**
 * shadcn/ui Card 기반의 재사용 가능한 미니멀 상태 알림 토스트 (Tailwind CSS 통일)
 */
export function StatusToast({
  message,
  theme = "xai",
  className,
}: StatusToastProps) {
  if (!message) return null;

  return (
    <Card
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 text-xs font-mono tracking-tight",
        TOAST_THEME_CLASSES[theme],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
      <span>{message}</span>
    </Card>
  );
}

interface CopyFeedbackContentProps {
  copied: boolean;
  defaultLabel: string;
  copiedLabel?: string;
  showIcon?: boolean;
}

export function CopyFeedbackContent({
  copied,
  defaultLabel,
  copiedLabel = "Copied to Clipboard",
  showIcon = true,
}: CopyFeedbackContentProps) {
  if (copied) {
    return (
      <>
        {showIcon && <Check className="size-4" strokeWidth={1.5} />}
        <span>{copiedLabel}</span>
      </>
    );
  }

  return (
    <>
      {showIcon && <Copy className="size-4" strokeWidth={1.5} />}
      <span>{defaultLabel}</span>
    </>
  );
}
