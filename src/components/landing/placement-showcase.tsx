"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  QrCode,
  Terminal,
  UserRound,
} from "lucide-react";
import {
  LandingFrameHeader,
  LandingSectionHeader,
} from "@/components/landing/section-chrome";
import { LinkIcon } from "@/components/link-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, copyTextToClipboard } from "@/lib/utils";

type PlacementId = "readme" | "resume" | "bio" | "qr";

interface PlacementOption {
  id: PlacementId;
  label: string;
  eyebrow: string;
  tip: string;
  copyLabel: string;
}

const PLACEMENT_OPTIONS: PlacementOption[] = [
  {
    id: "readme",
    label: "GitHub README",
    eyebrow: "PROFILE README SNIPPET",
    tip: "프로필 README 상단에 한 줄만 추가하면 방문자가 블로그·포트폴리오·이메일로 자연스럽게 이어집니다.",
    copyLabel: "마크다운 복사",
  },
  {
    id: "resume",
    label: "이력서 · 포트폴리오",
    eyebrow: "RESUME HEADER LINK",
    tip: "PDF 이력서나 노션 상단에 단 하나의 MyLink URL을 적으면, 링크가 바뀌어도 재제출할 필요가 없습니다.",
    copyLabel: "이력서 문구 복사",
  },
  {
    id: "bio",
    label: "SNS 바이오",
    eyebrow: "SOCIAL BIO FORMAT",
    tip: "X(Twitter), LinkedIn, Threads의 단일 웹사이트 슬롯에 MyLink를 연결하고 유입 클릭을 추적하세요.",
    copyLabel: "바이오 문구 복사",
  },
  {
    id: "qr",
    label: "컨퍼런스 명함",
    eyebrow: "OFFLINE HANDOFF CARD",
    tip: "발표 자료 마지막 슬라이드나 명함에 내 페이지 주소를 담아 현장에서 바로 프로필을 공유하세요.",
    copyLabel: "페이지 경로 복사",
  },
];

interface PlacementShowcaseProps {
  effectiveHandle: string;
  onToast?: (message: string) => void;
}

/**
 * 마이링크 공개 주소를 활용하는 4가지 실전 배치를 히어로 카드와 통일된 프레임 크롬으로 보여주는 섹션
 */
export function PlacementShowcase({
  effectiveHandle,
  onToast,
}: PlacementShowcaseProps) {
  const [selectedId, setSelectedId] = useState<PlacementId>("readme");
  const [copiedId, setCopiedId] = useState<PlacementId | null>(null);

  const selected = useMemo(
    () =>
      PLACEMENT_OPTIONS.find((item) => item.id === selectedId) ??
      PLACEMENT_OPTIONS[0],
    [selectedId]
  );

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${effectiveHandle}`
      : `/${effectiveHandle}`;

  const snippetByPlacement: Record<PlacementId, string> = {
    readme: `### 🔗 Connect with me\n\n👉 **MyLink Hub**: [${effectiveHandle}](${publicUrl})`,
    resume: `Portfolio & Links: ${publicUrl}\n(GitHub · Tech Blog · Side Projects · Email Copy)`,
    bio: `Building products in code.\n🔗 All links & contact → ${publicUrl}`,
    qr: publicUrl,
  };

  const activeSnippet = snippetByPlacement[selected.id];

  const handleCopySnippet = () => {
    copyTextToClipboard(activeSnippet);
    setCopiedId(selected.id);
    onToast?.(`COPIED: ${selected.label}`);
    window.setTimeout(() => {
      setCopiedId((current) => (current === selected.id ? null : current));
    }, 2000);
  };

  const renderIcon = (id: PlacementId) => {
    switch (id) {
      case "readme":
        return <LinkIcon icon="github" className="size-3.5" />;
      case "resume":
        return <FileText className="size-3.5" strokeWidth={1.5} />;
      case "bio":
        return <UserRound className="size-3.5" strokeWidth={1.5} />;
      case "qr":
        return <QrCode className="size-3.5" strokeWidth={1.5} />;
    }
  };

  return (
    <section aria-labelledby="placement-heading" className="space-y-6">
      <LandingSectionHeader
        id="placement-heading"
        eyebrow="// WHERE TO DEPLOY"
        title="어디에 연결해도"
        accent="깔끔하게."
        rightSlot={
          <Badge variant="outline" className="w-fit font-mono text-[11px]">
            TARGET · /{effectiveHandle}
          </Badge>
        }
      />

      <Card className="overflow-hidden border-hairline bg-canvas-card">
        <LandingFrameHeader
          dotClassName="bg-sunset"
          label={
            <>
              deploy-snippet /{" "}
              <span className="text-ink">@{effectiveHandle}</span>
            </>
          }
          rightSlot={
            <Badge variant="active" className="text-[10px]">
              READY TO SHARE
            </Badge>
          }
        />

        {/* 히어로 프리뷰와 동일한 세그먼트 탭 스트립 */}
        <div className="border-b border-hairline bg-canvas/50 px-3.5 py-3 sm:px-4">
          <div
            role="tablist"
            aria-label="활용 위치 선택"
            className="grid grid-cols-2 sm:inline-flex items-center gap-1 rounded-xl sm:rounded-full border border-hairline bg-canvas p-1 sm:p-0.5 w-full sm:w-auto"
          >
            {PLACEMENT_OPTIONS.map((option) => {
              const active = option.id === selected.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedId(option.id)}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-lg sm:rounded-full px-3 py-1.5 sm:py-1 font-mono text-[11px] transition-colors cursor-pointer min-w-0",
                    active
                      ? "bg-white text-canvas"
                      : "text-body-mid hover:text-ink"
                  )}
                >
                  {renderIcon(option.id)}
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 본문: 스니펫 웰 + 기하학 엔드포인트 프리뷰 카드 */}
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 items-stretch">
          <div className="rounded-lg border border-hairline bg-canvas p-4 flex flex-col justify-between gap-4 min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[1.2px] text-sunset">
                  <Terminal className="size-3.5" strokeWidth={1.5} />
                  <span>{selected.eyebrow}</span>
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleCopySnippet}
                  className="font-mono text-[10px] uppercase tracking-[1px]"
                >
                  {copiedId === selected.id ? (
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
                      <span>{selected.copyLabel}</span>
                    </>
                  )}
                </Button>
              </div>

              <pre className="rounded-lg border border-hairline bg-canvas-soft/60 p-3.5 font-mono text-xs text-body overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                {activeSnippet}
              </pre>
            </div>

            <p className="text-xs sm:text-sm font-normal text-body-mid leading-relaxed">
              {selected.tip}
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-canvas p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-body-mid block">
                PUBLIC ENDPOINT
              </span>
              <p className="text-base sm:text-lg font-normal tracking-[-0.02em] text-ink truncate">
                @{effectiveHandle}
              </p>
              <p className="font-mono text-[11px] text-body-mid truncate">
                /{effectiveHandle}
              </p>
              <div className="pt-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span className="font-mono text-[10px] uppercase tracking-[1px] text-emerald-400">
                  LIVE ROUTE
                </span>
              </div>
            </div>

            {/* 미니멀 기하학 매트릭스 일러스트 */}
            <svg
              viewBox="0 0 64 64"
              className="size-16 sm:size-20 shrink-0 text-ink"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="4"
                width="20"
                height="20"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect x="10" y="10" width="8" height="8" rx="1" fill="#ff7a17" />
              <rect
                x="40"
                y="4"
                width="20"
                height="20"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="46"
                y="10"
                width="8"
                height="8"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="4"
                y="40"
                width="20"
                height="20"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="10"
                y="46"
                width="8"
                height="8"
                rx="1"
                fill="currentColor"
              />
              <rect x="30" y="10" width="4" height="4" fill="#7d8187" />
              <rect x="30" y="20" width="4" height="8" fill="currentColor" />
              <rect x="10" y="30" width="8" height="4" fill="currentColor" />
              <rect x="24" y="30" width="12" height="4" fill="#ff7a17" />
              <rect x="42" y="30" width="16" height="4" fill="#a0c3ec" />
              <rect x="30" y="40" width="6" height="6" fill="#c4b5fd" />
              <rect x="42" y="40" width="6" height="10" fill="currentColor" />
              <rect x="52" y="40" width="8" height="8" fill="#7d8187" />
              <rect x="30" y="52" width="10" height="8" fill="currentColor" />
              <rect x="46" y="54" width="14" height="6" fill="#ff7a17" />
            </svg>
          </div>
        </div>
      </Card>
    </section>
  );
}
