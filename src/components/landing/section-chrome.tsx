import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LandingEyebrowPillProps {
  label: string;
  dotClassName?: string;
  className?: string;
}

/**
 * 히어로 섹션과 동일한 상단 모노 아이브로우 필 배지
 */
export function LandingEyebrowPill({
  label,
  dotClassName = "bg-sunset",
  className,
}: LandingEyebrowPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas-card px-3 py-1",
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", dotClassName)} />
      <span className="font-mono text-[11px] uppercase tracking-[1.3px] text-body-mid">
        {label}
      </span>
    </div>
  );
}

interface LandingSectionHeaderProps {
  id: string;
  eyebrow: string;
  title: string;
  accent?: string;
  rightSlot?: ReactNode;
}

/**
 * 히어로 섹션의 타이포그래피·필 아이브로우 리듬을 공유하는 섹션 헤더
 */
export function LandingSectionHeader({
  id,
  eyebrow,
  title,
  accent,
  rightSlot,
}: LandingSectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="space-y-3">
        <LandingEyebrowPill label={eyebrow} />
        <h2
          id={id}
          className="text-2xl sm:text-4xl font-normal tracking-[-0.03em] text-ink leading-tight"
        >
          {title}
          {accent && <span className="text-sunset"> {accent}</span>}
        </h2>
      </div>
      {rightSlot}
    </div>
  );
}

interface LandingFrameHeaderProps {
  label: ReactNode;
  dotClassName?: string;
  rightSlot?: ReactNode;
  className?: string;
}

/**
 * 히어로 라이브 프리뷰 카드와 동일한 상단 터미널/브라우저 프레임 헤더 바
 */
export function LandingFrameHeader({
  label,
  dotClassName = "bg-sunset",
  rightSlot,
  className,
}: LandingFrameHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-canvas-soft/80 px-3.5 py-2.5 sm:px-4",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn("size-2 rounded-full shrink-0", dotClassName)} />
        <span className="font-mono text-[11px] text-body-mid truncate">
          {label}
        </span>
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}
