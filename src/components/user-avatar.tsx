"use client";

import Image from "next/image";
import { Avatar } from "@base-ui/react/avatar";
import { parseProfileAvatarUrl } from "@/lib/schemas/profile";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Base UI Avatar 기반의 원형 사용자 프로필 아바타 컴포넌트
 * - Google 프로필 사진 로딩 실패 또는 미존재 시 이니셜 폴백을 표시합니다.
 */
export function UserAvatar({
  src,
  name,
  size = 64,
  className,
  priority = false,
}: UserAvatarProps) {
  const rawSrc = src?.trim() || "";
  const parsedSrc = parseProfileAvatarUrl(rawSrc);
  const normalizedSrc = parsedSrc.valid ? parsedSrc.url : "";
  const fallbackInitial = (name?.trim().charAt(0) || "M").toUpperCase();

  return (
    <Avatar.Root
      className={cn(
        "relative rounded-full border border-hairline overflow-hidden bg-canvas-soft shrink-0 inline-flex items-center justify-center text-ink font-mono select-none",
        className
      )}
      style={{ width: size, height: size }}
    >
      {normalizedSrc && (
        <Avatar.Image
          key={normalizedSrc}
          src={normalizedSrc}
          alt={`${name || "사용자"} 프로필 이미지`}
          keepMounted
          render={(props) => (
            <Image
              {...props}
              src={normalizedSrc}
              alt={`${name || "사용자"} 프로필 이미지`}
              width={size}
              height={size}
              referrerPolicy="no-referrer"
              unoptimized={normalizedSrc.startsWith("http")}
              priority={priority}
              className="h-full w-full object-cover"
            />
          )}
        />
      )}
      <Avatar.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center font-normal tracking-normal text-body",
          size <= 28 ? "text-[11px]" : size <= 48 ? "text-sm" : "text-xl"
        )}
      >
        {fallbackInitial}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
