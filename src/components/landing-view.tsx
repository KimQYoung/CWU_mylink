"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowUpRight,
  Loader2,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { GoogleIcon } from "@/components/google-icon";
import { CapabilitiesBento } from "@/components/landing/capabilities-bento";
import { PlacementShowcase } from "@/components/landing/placement-showcase";
import {
  LandingEyebrowPill,
  LandingFrameHeader,
  LandingSectionHeader,
} from "@/components/landing/section-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProfileStore } from "@/lib/store";

const DEFAULT_DEMO_HANDLE = "gyuyoung";

const WORKFLOW_STEPS = [
  {
    step: "STEP 01",
    code: "AUTHENTICATE",
    dotClassName: "bg-sunset",
    spec: "OAUTH 2.0",
    title: "Google 계정으로 3초 시작",
    desc: "별도의 회원가입 폼이나 비밀번호 없이 Google OAuth 2.0 로그인만으로 개인 워크스페이스가 즉시 생성됩니다.",
    icon: UserCheck,
  },
  {
    step: "STEP 02",
    code: "CONFIGURE",
    dotClassName: "bg-breeze",
    spec: "FIRESTORE SYNC",
    title: "프로필과 링크 엔드포인트 구성",
    desc: "Display Name, 한 줄 소개, 아바타를 설정하고 GitHub·블로그·이메일 복사 링크를 원하는 공개 상태로 등록합니다.",
    icon: SlidersHorizontal,
  },
  {
    step: "STEP 03",
    code: "SHARE & TRACK",
    dotClassName: "bg-emerald-400",
    spec: "/{HANDLE} · /stats",
    title: "고유 URL 공유 및 클릭 추적",
    desc: "/{displayName} 공개 페이지를 이력서와 SNS에 연결하고, /stats 대시보드에서 링크별 클릭 흐름을 확인합니다.",
    icon: ArrowUpRight,
  },
] as const;

interface LandingViewProps {
  onToast?: (message: string) => void;
}

/**
 * 비로그인 상태에서 루트(`/`)에 표시되는 반응형 마이링크 랜딩 페이지
 * - 인터랙티브 라이브 프리뷰, 2x2 핵심 기능 벤토, 3단계 워크플로우, 활용 배치 가이드를 제공합니다.
 */
export function LandingView({ onToast }: LandingViewProps) {
  const isAuthSubmitting = useProfileStore((state) => state.isAuthSubmitting);
  const authError = useProfileStore((state) => state.authError);
  const signInWithGoogleAction = useProfileStore(
    (state) => state.signInWithGoogleAction
  );

  const effectiveHandle = DEFAULT_DEMO_HANDLE;

  const handleScrollToCapabilities = () => {
    const target = document.getElementById("capabilities-section");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderGoogleStartButton = (label: string, className?: string) => (
    <Button
      type="button"
      variant="default"
      size="lg"
      disabled={isAuthSubmitting}
      aria-busy={isAuthSubmitting}
      onClick={() => void signInWithGoogleAction()}
      className={className}
    >
      {isAuthSubmitting ? (
        <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
      ) : (
        <GoogleIcon className="size-4" />
      )}
      <span>{isAuthSubmitting ? "Google 로그인 중..." : label}</span>
    </Button>
  );

  return (
    <div className="w-full py-8 sm:py-14 space-y-12 sm:space-y-20">
      {/* HERO SECTION */}
      <section className="py-4 sm:py-10 lg:py-14">
        <div className="max-w-4xl space-y-7 text-left">
          <LandingEyebrowPill label="// PERSONAL LINK ENDPOINT SYSTEM" />

          <div className="space-y-5">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-normal tracking-[-0.04em] text-ink leading-[1.04]">
              Development in{" "}
              <span className="text-sunset block sm:inline">One Link.</span>
            </h1>
            <p className="text-base sm:text-xl font-normal text-body leading-relaxed max-w-2xl">
              GitHub, 기술 블로그, 포트폴리오, 이메일 복사까지.
              <br className="hidden sm:inline" /> 흩어진 개발자의 링크를 단 하나의
              엔드포인트로 연결하고 클릭 통계를 확인하세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 pt-1">
            {renderGoogleStartButton("Google로 시작하기", "px-7 w-full sm:w-auto")}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleScrollToCapabilities}
              className="w-full sm:w-auto"
            >
              <span>주요 기능 살펴보기</span>
              <ArrowDown className="size-4" strokeWidth={1.5} />
            </Button>
          </div>

          {authError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-300 text-left max-w-md"
            >
              <AlertCircle className="size-4 shrink-0" strokeWidth={1.75} />
              <span>{authError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 pt-2 font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid">
            <span>GOOGLE OAUTH 2.0</span>
            <span className="text-hairline" aria-hidden="true">
              /
            </span>
            <span>CUSTOM /{"{HANDLE}"}</span>
            <span className="text-hairline" aria-hidden="true">
              /
            </span>
            <span>CLICK TELEMETRY</span>
          </div>
        </div>
      </section>

      <Separator />

      {/* 2x2 CORE CAPABILITIES BENTO */}
      <CapabilitiesBento
        effectiveHandle={effectiveHandle}
        onToast={onToast}
      />

      <Separator />

      {/* 3-STEP WORKFLOW */}
      <section aria-labelledby="workflow-heading" className="space-y-6">
        <LandingSectionHeader
          id="workflow-heading"
          eyebrow="// WORKFLOW · 3 STEPS"
          title="가입부터 공개 페이지 배포까지,"
          accent="단 1분."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WORKFLOW_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.step}
                className="overflow-hidden border-hairline bg-canvas-card flex flex-col justify-between"
              >
                <LandingFrameHeader
                  dotClassName={item.dotClassName}
                  label={`${item.step} · ${item.code}`}
                  rightSlot={
                    <span className="font-mono text-[10px] text-body-mid tabular-nums">
                      0{idx + 1} / 03
                    </span>
                  }
                />

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-5">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-lg border border-hairline bg-canvas flex items-center justify-center text-ink shrink-0">
                      <Icon className="size-4" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="text-base sm:text-lg font-normal tracking-[-0.02em] text-ink">
                        {item.title}
                      </h3>
                      <p className="text-sm font-normal text-body-mid leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-hairline bg-canvas px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-body-mid">
                      PROTOCOL
                    </span>
                    <Badge variant="default" className="text-[10px]">
                      {item.spec}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* INTERACTIVE DEPLOYMENT SHOWCASE */}
      <PlacementShowcase
        effectiveHandle={effectiveHandle}
        onToast={onToast}
      />

      <Separator />

      {/* BOTTOM CTA BAND */}
      <section aria-labelledby="cta-heading">
        <Card className="overflow-hidden border-hairline bg-canvas-card">
          <LandingFrameHeader
            dotClassName="bg-sunset"
            label={
              <>
                {"// READY TO DEPLOY · "}
                <span className="text-ink">@{effectiveHandle}</span>
              </>
            }
            rightSlot={
              <Badge variant="accent" className="text-[10px]">
                FREE · INSTANT SETUP
              </Badge>
            }
          />

          <div className="p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <h2
                id="cta-heading"
                className="text-2xl sm:text-3xl font-normal tracking-[-0.03em] text-ink leading-tight"
              >
                지금 바로 나만의 링크 허브를{" "}
                <span className="text-sunset">열어보세요.</span>
              </h2>
              <p className="text-sm sm:text-base font-normal text-body-mid leading-relaxed">
                로그인 즉시 개인화된 마이페이지, 공개 프로필(/{effectiveHandle}
                ), 그리고 /stats 클릭 통계 대시보드가 활성화됩니다.
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid">
                <span>MY PAGE</span>
                <span className="text-hairline" aria-hidden="true">
                  /
                </span>
                <span>/{effectiveHandle}</span>
                <span className="text-hairline" aria-hidden="true">
                  /
                </span>
                <span>/stats ANALYTICS</span>
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas p-4 flex flex-col items-stretch sm:items-center gap-2.5 shrink-0">
              {renderGoogleStartButton(
                "Google로 무료 시작하기",
                "w-full sm:w-auto px-7"
              )}
              <span className="font-mono text-[11px] text-body-mid text-center">
                Cloud Firestore 실시간 동기화 지원
              </span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
