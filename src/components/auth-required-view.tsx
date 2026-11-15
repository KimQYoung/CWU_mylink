"use client";

import { AlertCircle, Loader2, Lock, ShieldCheck } from "lucide-react";
import { GoogleIcon } from "@/components/google-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProfileStore } from "@/lib/store";

interface AuthRequiredViewProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

const ONBOARDING_STEPS = [
  {
    code: "01 // GOOGLE SOCIAL AUTH",
    headline: "Google 계정으로 간편 로그인",
    desc: "상단 헤더 또는 아래 버튼을 클릭하여 Google 계정으로 즉시 로그인할 수 있습니다.",
  },
  {
    code: "02 // FIRESTORE PATH",
    headline: "users/{user.uid}/links 개인화",
    desc: "로그인한 사용자의 고유 UID 경로 아래에 나만의 링크 데이터가 분리 저장됩니다.",
  },
  {
    code: "03 // MY PAGE",
    headline: "내 마이페이지 및 링크 관리",
    desc: "로그인 이후 프로필 이름, 이메일, 아바타, UID 정보와 링크 목록을 마이페이지에서 확인·편집할 수 있습니다.",
  },
] as const;

/**
 * 인증 세션 확인 중 또는 비로그인 상태일 때 사용자에게 로그인 안내 문구를 표시하는 화면 컴포넌트
 */
export function AuthRequiredView({
  eyebrow = "// AUTHENTICATION REQUIRED",
  title = "로그인 후 마이페이지를 사용할 수 있습니다",
  description = "개인화된 마이페이지 정보와 나만의 링크 디렉토리를 이용하려면 Google 계정으로 로그인해 주세요. 로그인을 완료하면 사용자 고유 경로(users/{user.uid}/links)가 즉시 연결됩니다.",
}: AuthRequiredViewProps) {
  const authStatus = useProfileStore((state) => state.authStatus);
  const isAuthSubmitting = useProfileStore((state) => state.isAuthSubmitting);
  const authError = useProfileStore((state) => state.authError);
  const signInWithGoogleAction = useProfileStore(
    (state) => state.signInWithGoogleAction
  );

  if (authStatus === "loading") {
    return (
      <section className="py-12 sm:py-20">
        <Card className="p-8 sm:p-10 text-center space-y-4">
          <div className="mx-auto size-11 rounded-full border border-hairline bg-canvas-soft flex items-center justify-center">
            <Loader2
              className="size-5 animate-spin text-body"
              strokeWidth={1.5}
            />
          </div>
          <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
            {"// VERIFYING GOOGLE SESSION"}
          </p>
          <p className="text-base font-normal text-body">
            로그인 상태와 개인화된 Firestore 경로를 확인하고 있습니다...
          </p>
        </Card>
      </section>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[1.4px] text-body-mid">
            {eyebrow}
          </p>
          <h1 className="text-3xl sm:text-6xl font-normal tracking-[-0.035em] text-ink leading-tight">
            {title}
          </h1>
        </div>

        <p className="text-base sm:text-lg font-normal text-body tracking-[-0.01em] max-w-2xl leading-relaxed">
          {description}
        </p>

        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="size-11 rounded-full border border-hairline bg-canvas-soft flex items-center justify-center shrink-0">
                <Lock className="size-5 text-sunset" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <p className="font-mono text-[11px] uppercase tracking-[1.3px] text-body-mid">
                  ACCESS CONTROL · GOOGLE AUTH REQUIRED
                </p>
                <p className="text-base font-normal text-ink">
                  현재 로그아웃 상태입니다. 로그인 이후 모든 기능을 사용할 수
                  있습니다.
                </p>
                <p className="text-sm font-normal text-body-mid leading-relaxed">
                  로그인 후 Firestore 경로{" "}
                  <code className="font-mono text-xs text-body bg-canvas-soft px-1.5 py-0.5 rounded border border-hairline">
                    users/{"{user.uid}"}/links
                  </code>
                  에서 본인의 링크 목록과 계정 정보를 바로 불러옵니다.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="default"
              size="lg"
              disabled={isAuthSubmitting}
              aria-busy={isAuthSubmitting}
              onClick={() => void signInWithGoogleAction()}
              className="w-full sm:w-auto shrink-0"
            >
              {isAuthSubmitting ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <GoogleIcon className="size-4" />
              )}
              <span>
                {isAuthSubmitting
                  ? "Google 로그인 중..."
                  : "Google 계정으로 로그인"}
              </span>
            </Button>
          </div>

          {authError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-300"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.75} />
              <span>{authError}</span>
            </div>
          )}
        </Card>
      </section>

      <Separator />

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-body-mid" strokeWidth={1.5} />
          <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
            {"// HOW PERSONALIZATION WORKS"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ONBOARDING_STEPS.map((step) => (
            <Card key={step.code} className="p-5 space-y-2.5">
              <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block">
                {step.code}
              </span>
              <h2 className="text-lg font-normal text-ink tracking-[-0.02em]">
                {step.headline}
              </h2>
              <p className="text-sm font-normal text-body-mid leading-relaxed">
                {step.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
