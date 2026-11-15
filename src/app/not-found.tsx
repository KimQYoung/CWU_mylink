"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDisplayNameFromAuthUser } from "@/lib/firebase-auth";
import { buildPublicProfileHref } from "@/lib/firestore-profile";
import { useResolvedUserProfile } from "@/lib/queries/user-data";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

/**
 * 존재하지 않는 사용자(displayName) 또는 잘못된 경로 접근 시 표시되는 404 페이지
 */
export default function NotFound() {
  const hasMounted = useHydrated();
  const { authStatus, authUser, profile } = useResolvedUserProfile();

  const isAuthenticated =
    hasMounted && authStatus === "authenticated" && Boolean(authUser);
  const myDisplayName = authUser
    ? profile.name?.trim() || getDisplayNameFromAuthUser(authUser)
    : "";
  const myPageHref = myDisplayName
    ? buildPublicProfileHref(myDisplayName)
    : "/";

  return (
    <div className="min-h-screen w-full bg-canvas text-ink flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <Card className="w-full max-w-md p-8 space-y-5 text-center">
          <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
            {"// 404 ENDPOINT NOT FOUND"}
          </p>
          <h1 className="text-2xl font-normal tracking-[-0.02em] text-ink">
            사용자를 찾을 수 없습니다
          </h1>
          <p className="text-sm text-body-mid leading-relaxed">
            요청하신 Display Name에 해당하는 공개 프로필 페이지가 존재하지
            않거나 주소가 변경되었습니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full sm:w-auto"
              )}
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.5} />
              <span>마이페이지로 이동</span>
            </Link>

            {isAuthenticated && myDisplayName && (
              <Link
                href={myPageHref}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto"
                )}
              >
                <span>내 페이지 (/{myDisplayName})</span>
                <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </Card>
      </main>

      <footer className="py-8 px-4 text-center">
        <p className="font-mono text-xs text-body-mid">
          © {new Date().getFullYear()} MyLink. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
