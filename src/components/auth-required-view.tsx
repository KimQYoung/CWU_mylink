"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/google-icon";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/lib/store";

interface AuthRequiredViewProps {
  title?: string;
  description?: string;
}

/**
 * 인증 세션 확인 중 또는 비로그인 상태일 때 표시되는 미니멀 랜딩·로그인 안내 화면
 */
export function AuthRequiredView({
  description = "GitHub, 블로그, 포트폴리오까지.\nGoogle 로그인 이후 나만의 모든 링크를 한 페이지에 담아보세요.",
}: AuthRequiredViewProps) {
  const authStatus = useProfileStore((state) => state.authStatus);
  const isAuthSubmitting = useProfileStore((state) => state.isAuthSubmitting);
  const authError = useProfileStore((state) => state.authError);
  const signInWithGoogleAction = useProfileStore(
    (state) => state.signInWithGoogleAction
  );

  if (authStatus === "loading") {
    return (
      <section className="flex flex-1 flex-col items-center justify-center py-24 text-center space-y-4">
        <Loader2
          className="size-6 animate-spin text-body-mid"
          strokeWidth={1.5}
        />
        <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
          세션 확인 중...
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center pt-10 sm:pt-16 pb-6 text-center">
      <div className="w-full max-w-xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.035em] text-ink leading-[1.08]">
          Development in{" "}
          <span className="text-sunset block sm:inline">One Link.</span>
        </h1>

        <p className="text-sm sm:text-base font-normal text-body-mid leading-relaxed whitespace-pre-line">
          {description}
        </p>

        <div className="pt-2 flex flex-col items-center gap-3">
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={isAuthSubmitting}
            aria-busy={isAuthSubmitting}
            onClick={() => void signInWithGoogleAction()}
            className="px-7"
          >
            {isAuthSubmitting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            <span>
              {isAuthSubmitting ? "Google 로그인 중..." : "Google로 시작하기"}
            </span>
          </Button>

          {authError && (
            <div
              role="alert"
              className="mt-2 flex items-center gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-300 text-left max-w-md"
            >
              <AlertCircle className="size-4 shrink-0" strokeWidth={1.75} />
              <span>{authError}</span>
            </div>
          )}
        </div>
      </div>

      {/* 미니멀 프리뷰 실루엣 */}
      <div
        aria-hidden="true"
        className="mt-14 w-64 sm:w-72 rounded-2xl border border-hairline bg-canvas-card/70 p-5 space-y-3 -rotate-2 opacity-60 pointer-events-none select-none"
      >
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full border border-hairline bg-canvas-soft" />
          <div className="space-y-1.5 flex-1">
            <div className="h-2.5 w-20 rounded-full bg-canvas-mid" />
            <div className="h-2 w-14 rounded-full bg-hairline" />
          </div>
        </div>
        <div className="h-8 rounded-lg border border-hairline bg-canvas-soft flex items-center gap-2.5 px-3">
          <span className="size-2.5 rounded-full bg-sunset/70" />
          <div className="h-2 w-24 rounded-full bg-canvas-mid" />
        </div>
        <div className="h-8 rounded-lg border border-hairline bg-canvas-soft flex items-center gap-2.5 px-3">
          <span className="size-2.5 rounded-full bg-breeze/60" />
          <div className="h-2 w-20 rounded-full bg-canvas-mid" />
        </div>
      </div>
    </section>
  );
}
