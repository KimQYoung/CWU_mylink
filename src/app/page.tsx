"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LinkCard } from "@/components/link-card";
import { SiteHeader } from "@/components/site-header";
import { StatusToast } from "@/components/status-toast";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_PROFILE, useProfileStore } from "../lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types";

export default function Home() {
  const hasMounted = useHydrated();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const storeProfile = useProfileStore((state) => state.profile);
  const recordLinkClick = useProfileStore((state) => state.recordLinkClick);

  const profile = hasMounted ? storeProfile : DEFAULT_PROFILE;

  const handleCopyEmail = (link: LinkItem) => {
    if (!profile.email) return;
    navigator.clipboard.writeText(profile.email);
    recordLinkClick(link.id);
    setCopiedId(link.id);
    const message = `ADDRESS COPIED: ${profile.email}`;
    setToastMessage(message);
    window.setTimeout(() => {
      setCopiedId((current) => (current === link.id ? null : current));
      setToastMessage((current) => (current === message ? null : current));
    }, 2400);
  };

  const activeLinks = useMemo(
    () =>
      [...profile.links]
        .filter((l) => l.isActive)
        .sort((a, b) => a.order - b.order),
    [profile.links]
  );

  return (
    <div className="min-h-screen w-full bg-canvas text-ink font-sans selection:bg-white/20 selection:text-white flex flex-col">
      {/* 1. Sticky Navigation Bar */}
      <SiteHeader
        profileName={profile.name}
        username={profile.username}
        activeRoute="home"
      />

      {/* 2. Main Research Surface Container */}
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 py-10 sm:py-20 flex-1 flex flex-col space-y-12 sm:space-y-24">
        {/* HERO BAND */}
        <section className="space-y-6">
          <div className="space-y-3">
            <p className="font-mono text-xs sm:text-sm uppercase tracking-[1.4px] text-body-mid">
              {"// RESEARCH & DEVELOPMENT PROFILE"}
            </p>
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-normal tracking-[-0.035em] text-ink leading-none">
              {profile.name}
            </h1>
          </div>

          <p className="text-base sm:text-xl font-normal text-body tracking-[-0.015em] max-w-2xl leading-relaxed">
            {profile.headline}
          </p>

          {/* Profile Telemetry Card */}
          <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 p-5">
            <div className="relative h-16 w-16 rounded-full border border-hairline overflow-hidden bg-canvas-soft shrink-0">
              <Image
                src={profile.avatarUrl || "/avatar.png"}
                alt={`${profile.name} Avatar`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 w-full font-mono text-xs">
              <div>
                <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">
                  CALLSIGN
                </span>
                <span className="text-ink font-normal">{profile.callsign}</span>
              </div>
              <div>
                <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">
                  DISCIPLINE
                </span>
                <span className="text-ink font-normal">{profile.discipline}</span>
              </div>
              <div className="min-[420px]:col-span-2 sm:col-span-1">
                <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">
                  STATUS
                </span>
                <span className="text-sunset font-normal">{profile.status}</span>
              </div>
            </div>
          </Card>
        </section>

        {/* BIOGRAPHY BAND */}
        <section className="space-y-6">
          <Separator />
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              {"// STATEMENT"}
            </p>
            <div className="space-y-3 max-w-3xl">
              <p className="text-base sm:text-lg font-normal text-body leading-relaxed">
                {profile.statementLead}
              </p>
              <p className="text-sm sm:text-base font-normal text-body-mid leading-relaxed">
                {profile.statementBody}
              </p>
            </div>
          </div>
        </section>

        {/* DIRECTORY & ACCESS (LINK CARDS FROM LOCALSTORAGE) */}
        <section className="space-y-6">
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
                {"// DIRECTORY & ACCESS"}
              </p>
              <span className="font-mono text-xs text-body-mid uppercase tracking-[1.2px] block">
                {activeLinks.length} VERIFIED ENDPOINTS
              </span>
            </div>

            <Link
              href="/links"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full sm:w-auto font-mono text-[11px] uppercase tracking-[1.2px]"
              )}
            >
              <span>All Links ({profile.links.length})</span>
              <ArrowRight className="size-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="space-y-3">
            {activeLinks.map((link, index) => (
              <LinkCard
                key={link.id}
                link={link}
                index={index}
                mode="public"
                theme="xai"
                copied={copiedId === link.id}
                onCopyEmail={handleCopyEmail}
                onLinkClick={(item) => recordLinkClick(item.id)}
              />
            ))}
          </div>
        </section>

        {/* CORE CAPABILITIES & STACK */}
        {profile.capabilities && profile.capabilities.length > 0 && (
          <section className="space-y-6">
            <Separator />
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              {"// CAPABILITIES & ARCHITECTURE"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.capabilities.map((cap) => (
                <Card
                  key={cap.headline}
                  className="p-5 sm:p-6 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-body-mid block mb-1">
                      {cap.category}
                    </span>
                    <h4 className="text-lg font-normal text-ink tracking-[-0.02em]">
                      {cap.headline}
                    </h4>
                  </div>
                  <p className="text-sm font-normal text-body-mid leading-relaxed pt-2">
                    {cap.desc}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 3. Footer Band */}
      <footer className="border-t border-hairline bg-canvas py-10 sm:py-12 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              {profile.name.toUpperCase()} {"//"} MYLINK INTERFACE
            </p>
            <p className="text-xs text-body-mid">
              Engineered with restraint • Strict Dark Canvas • xAI Design System •
              LocalStorage Driven
            </p>
          </div>

          <div className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">
            © {new Date().getFullYear()} {profile.name.toUpperCase()}
          </div>
        </div>
      </footer>

      <StatusToast message={toastMessage} theme="xai" />
    </div>
  );
}
