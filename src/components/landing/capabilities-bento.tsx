"use client";

import { useState } from "react";
import { Check, Copy, Lock, MousePointerClick, Share2 } from "lucide-react";
import {
  LandingFrameHeader,
  LandingSectionHeader,
} from "@/components/landing/section-chrome";
import { LinkIcon } from "@/components/link-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn, copyTextToClipboard } from "@/lib/utils";

const ICON_SHOWCASE = [
  { key: "github", label: "GitHub", hint: "코드 & 오픈소스 저장소" },
  { key: "code-2", label: "Dev", hint: "기술 스택 & API 문서" },
  { key: "book-open", label: "Blog", hint: "아티클 & 트러블슈팅 노트" },
  { key: "layers", label: "Project", hint: "사이드 프로젝트 모음" },
  { key: "briefcase", label: "Career", hint: "이력서 & 포트폴리오" },
  { key: "mail", label: "Email", hint: "원클릭 이메일 복사 액션" },
  { key: "archive", label: "Archive", hint: "발표 자료 & 뉴스레터" },
  { key: "globe", label: "Web", hint: "개인 웹사이트 & 링크" },
] as const;

const CHART_BARS = [
  { label: "EP 01", pct: 92, color: "bg-sunset", clicks: 142 },
  { label: "EP 02", pct: 64, color: "bg-ink", clicks: 89 },
  { label: "EP 03", pct: 48, color: "bg-breeze", clicks: 64 },
  { label: "EP 04", pct: 28, color: "bg-twilight", clicks: 31 },
] as const;

interface CapabilitiesBentoProps {
  effectiveHandle: string;
  onToast?: (message: string) => void;
}

/**
 * 마이링크 핵심 기능을 히어로 카드와 동일한 프레임 크롬의 2x2 벤토 그리드로 소개하는 섹션
 */
export function CapabilitiesBento({
  effectiveHandle,
  onToast,
}: CapabilitiesBentoProps) {
  const [copiedDemoUrl, setCopiedDemoUrl] = useState(false);
  const [selectedIconKey, setSelectedIconKey] = useState<string>("github");
  const [isDraftVisible, setIsDraftVisible] = useState(true);

  const selectedIcon =
    ICON_SHOWCASE.find((item) => item.key === selectedIconKey) ??
    ICON_SHOWCASE[0];

  const handleCopyDemoUrl = () => {
    const demoPath = `/${effectiveHandle}`;
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${demoPath}`
        : demoPath;
    copyTextToClipboard(fullUrl);
    setCopiedDemoUrl(true);
    onToast?.(`DEMO URL COPIED: ${demoPath}`);
    window.setTimeout(() => {
      setCopiedDemoUrl(false);
    }, 2000);
  };

  return (
    <section
      id="capabilities-section"
      aria-labelledby="capabilities-heading"
      className="space-y-6"
    >
      <LandingSectionHeader
        id="capabilities-heading"
        eyebrow="// CORE CAPABILITIES"
        title="필요한 기능만,"
        accent="군더더기 없이."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 01: 개인별 공개 URL */}
        <Card className="overflow-hidden border-hairline bg-canvas-card flex flex-col justify-between">
          <LandingFrameHeader
            dotClassName="bg-sunset"
            label={
              <>
                01 · PERSONAL ENDPOINT /{" "}
                <span className="text-ink">@{effectiveHandle}</span>
              </>
            }
            rightSlot={
              <Badge variant="outline" className="text-[10px]">
                /{effectiveHandle}
              </Badge>
            }
          />

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-normal tracking-[-0.02em] text-ink">
                기억하기 쉬운 나만의 공개 URL
              </h3>
              <p className="text-sm font-normal text-body-mid leading-relaxed">
                설정한 Display Name이 곧 공개 페이지 주소가 됩니다. 로그인하지
                않은 방문자도 한 번의 링크 클릭으로 내 프로필을 확인할 수
                있습니다.
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas p-3 flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-lg border border-hairline bg-canvas-soft flex items-center justify-center shrink-0">
                  <Share2
                    className="size-3.5 text-sunset"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="font-mono text-xs text-body truncate">
                  /{effectiveHandle}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleCopyDemoUrl}
                className="font-mono text-[10px] uppercase tracking-[1px] shrink-0"
              >
                {copiedDemoUrl ? (
                  <>
                    <Check
                      className="size-3 text-emerald-400"
                      strokeWidth={1.75}
                    />
                    <span className="text-emerald-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" strokeWidth={1.5} />
                    <span>COPY</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* 02: 스마트 아이콘 & 이메일 복사 액션 */}
        <Card className="overflow-hidden border-hairline bg-canvas-card flex flex-col justify-between">
          <LandingFrameHeader
            dotClassName="bg-breeze"
            label="02 · SMART ACTIONS"
            rightSlot={
              <Badge variant="accent" className="text-[10px]">
                {selectedIcon.label}
              </Badge>
            }
          />

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-normal tracking-[-0.02em] text-ink">
                링크 이동부터 원클릭 이메일 복사까지
              </h3>
              <p className="text-sm font-normal text-body-mid leading-relaxed">
                외부 URL 연결은 물론, 방문자가 버튼을 누르면 내 이메일 주소를
                클립보드에 바로 복사해 주는 액션 엔드포인트를 지원합니다.
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas p-3 space-y-2.5">
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {ICON_SHOWCASE.map((item) => {
                  const active = item.key === selectedIconKey;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedIconKey(item.key)}
                      aria-label={`${item.label} 아이콘 미리보기`}
                      aria-pressed={active}
                      className={cn(
                        "h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer",
                        active
                          ? "border-white/50 bg-canvas-soft text-ink"
                          : "border-hairline bg-canvas-card text-body-mid hover:border-white/25 hover:text-ink"
                      )}
                    >
                      <LinkIcon icon={item.key} className="size-4" />
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                <span className="text-body truncate">{selectedIcon.hint}</span>
                <span className="text-body-mid uppercase shrink-0">
                  icon:{selectedIcon.key}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 03: 공개/숨김 스위치 */}
        <Card className="overflow-hidden border-hairline bg-canvas-card flex flex-col justify-between">
          <LandingFrameHeader
            dotClassName={isDraftVisible ? "bg-emerald-400" : "bg-body-mid"}
            label="03 · VISIBILITY CONTROL"
            rightSlot={
              <Badge
                variant={isDraftVisible ? "active" : "muted"}
                className="text-[10px]"
              >
                {isDraftVisible ? "ACTIVE" : "HIDDEN"}
              </Badge>
            }
          />

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-normal tracking-[-0.02em] text-ink">
                삭제하지 않고 잠시 숨겨두기
              </h3>
              <p className="text-sm font-normal text-body-mid leading-relaxed">
                리뉴얼 중인 포트폴리오나 시즌성 프로젝트는 지우지 마세요. 스위치
                하나로 공개 페이지 노출 여부만 즉시 전환할 수 있습니다.
              </p>
            </div>

            <div
              className={cn(
                "rounded-lg border bg-canvas p-3 flex items-center justify-between gap-3 transition-opacity",
                isDraftVisible
                  ? "border-hairline"
                  : "border-dashed border-hairline opacity-70"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-lg border border-hairline bg-canvas-soft flex items-center justify-center shrink-0 text-ink">
                  {isDraftVisible ? (
                    <LinkIcon icon="layers" className="size-3.5" />
                  ) : (
                    <Lock className="size-3.5 text-body-mid" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-normal text-ink truncate">
                    신규 사이드 프로젝트 v2
                  </p>
                  <p className="font-mono text-[10px] text-body-mid truncate">
                    {isDraftVisible
                      ? `/${effectiveHandle} 에 공개 중`
                      : "공개 페이지에서 숨김 처리됨"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={isDraftVisible}
                  onCheckedChange={setIsDraftVisible}
                  aria-label="데모 링크 공개 상태 전환"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 04: 클릭 통계 & 차트 */}
        <Card className="overflow-hidden border-hairline bg-canvas-card flex flex-col justify-between">
          <LandingFrameHeader
            dotClassName="bg-twilight"
            label="04 · CLICK TELEMETRY"
            rightSlot={
              <Badge variant="default" className="text-[10px] tabular-nums">
                <MousePointerClick className="size-3" strokeWidth={1.5} />
                <span>326 TOTAL</span>
              </Badge>
            }
          />

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-normal tracking-[-0.02em] text-ink">
                어떤 링크가 가장 인기 있을까요?
              </h3>
              <p className="text-sm font-normal text-body-mid leading-relaxed">
                총 클릭수, 링크당 평균 클릭수, 최고 성과 엔드포인트와 비중 분포
                차트를 /stats 대시보드에서 실시간으로 확인합니다.
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-canvas p-3 space-y-2">
              <div className="grid grid-cols-4 gap-2 items-end h-16 pt-1">
                {CHART_BARS.map((bar) => (
                  <div
                    key={bar.label}
                    className="flex flex-col items-center justify-end h-full gap-1"
                  >
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={cn("w-full rounded-t-sm", bar.color)}
                        style={{ height: `${bar.pct}%` }}
                        title={`${bar.label}: ${bar.clicks} clicks`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px] text-body-mid border-t border-hairline pt-2">
                {CHART_BARS.map((bar) => (
                  <span key={bar.label} className="tabular-nums">
                    {bar.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
