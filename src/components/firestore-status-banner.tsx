"use client";

import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ThemeId } from "@/types";

interface FirestoreStatusBannerProps {
  isLoading: boolean;
  error?: string | null;
  loadingMessage?: string;
  onRetry?: () => void;
  theme?: ThemeId;
  className?: string;
}

const BANNER_THEME_STYLES: Record<
  ThemeId,
  {
    loading: string;
    error: string;
    retryButton: string;
  }
> = {
  xai: {
    loading:
      "rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300",
    error: "rounded-lg border border-red-500/35 bg-red-500/10 text-red-300",
    retryButton: "",
  },
  neobrutalism: {
    loading:
      "rounded-xl border-[3px] border-black bg-[#FFE600] text-black shadow-[4px_4px_0px_#000]",
    error:
      "rounded-xl border-[3px] border-black bg-[#FF6B6B] text-black shadow-[4px_4px_0px_#000]",
    retryButton:
      "border-2 border-black bg-white text-black hover:bg-white shadow-[2px_2px_0px_#000]",
  },
  modern: {
    loading:
      "rounded-xl border border-indigo-200 bg-indigo-50/90 text-indigo-700",
    error: "rounded-xl border border-red-200 bg-red-50 text-red-700",
    retryButton:
      "border-red-200 bg-white text-red-700 hover:bg-red-50 hover:border-red-300",
  },
};

/**
 * Firestore 링크 목록 조회·갱신 중 로딩 상태 또는 오류 상태를 표시하는 배너
 */
export function FirestoreStatusBanner({
  isLoading,
  error,
  loadingMessage = "Firestore(users/{user.uid}/links)에서 링크 목록을 불러오는 중입니다...",
  onRetry,
  theme = "xai",
  className,
}: FirestoreStatusBannerProps) {
  if (!isLoading && !error) {
    return null;
  }

  const styles = BANNER_THEME_STYLES[theme];

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-center gap-2.5 px-4 py-2.5 font-mono text-xs",
          styles.loading,
          className
        )}
      >
        <Loader2 className="size-3.5 animate-spin shrink-0" strokeWidth={1.75} />
        <span>{loadingMessage}</span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 font-mono text-xs",
        styles.error,
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="break-words">{error}</span>
      </div>
      {onRetry && (
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={onRetry}
          className={cn("shrink-0 self-start sm:self-auto", styles.retryButton)}
        >
          <RefreshCw className="size-3" strokeWidth={1.75} />
          <span>다시 불러오기</span>
        </Button>
      )}
    </div>
  );
}
