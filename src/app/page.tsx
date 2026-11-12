"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useProfileStore, DEFAULT_PROFILE } from "../lib/store";

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Zustand 스토어에서 프로필 데이터 구독
  const storeProfile = useProfileStore((state) => state.profile);

  // Next.js SSR / LocalStorage Hydration 불일치 방지
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const profile = hasMounted ? storeProfile : DEFAULT_PROFILE;

  const handleCopyEmail = () => {
    if (profile.email) {
      navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const activeLinks = profile.links.filter((l) => l.isActive);

  return (
    <div className="min-h-screen w-full bg-canvas text-ink font-sans selection:bg-white/20 selection:text-white flex flex-col">
      {/* 1. Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              MYLINK // 01
            </span>
            <span className="text-hairline">|</span>
            <span className="text-sm font-normal tracking-[-0.02em] text-ink">
              {profile.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[1.4px] text-body-mid">
              LOCALSTORAGE ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Research Surface Container */}
      <main className="mx-auto w-full max-w-5xl px-6 sm:px-8 py-12 sm:py-20 flex-1 flex flex-col space-y-16 sm:space-y-24">
        {/* HERO BAND */}
        <section className="space-y-6">
          <div className="space-y-3">
            <p className="font-mono text-xs sm:text-sm uppercase tracking-[1.4px] text-body-mid">
              // RESEARCH & DEVELOPMENT PROFILE
            </p>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-normal tracking-[-0.035em] text-ink leading-none">
              {profile.name}
            </h1>
          </div>

          <p className="text-lg sm:text-xl font-normal text-body tracking-[-0.015em] max-w-2xl leading-relaxed">
            {profile.headline}
          </p>

          {/* Profile Telemetry Card */}
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-lg border border-hairline bg-canvas-card">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 w-full font-mono text-xs">
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
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">
                  STATUS
                </span>
                <span className="text-sunset font-normal">{profile.status}</span>
              </div>
            </div>
          </div>
        </section>

        {/* BIOGRAPHY BAND */}
        <section className="space-y-4 pt-6 border-t border-hairline">
          <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
            // STATEMENT
          </p>
          <div className="space-y-3 max-w-3xl">
            <p className="text-base sm:text-lg font-normal text-body leading-relaxed">
              {profile.statementLead}
            </p>
            <p className="text-sm sm:text-base font-normal text-body-mid leading-relaxed">
              {profile.statementBody}
            </p>
          </div>
        </section>

        {/* DIRECTORY & ACCESS (LINK CARDS FROM LOCALSTORAGE) */}
        <section className="space-y-6 pt-6 border-t border-hairline">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              // DIRECTORY & ACCESS
            </p>
            <span className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">
              {activeLinks.length} VERIFIED ENDPOINTS
            </span>
          </div>

          <div className="space-y-3">
            {activeLinks.map((link, index) => {
              const endpointNumber = String(index + 1).padStart(2, "0");
              const label = link.endpointLabel || `ENDPOINT ${endpointNumber}`;
              const display = link.displayUrl || link.url || "";

              return (
                <div
                  key={link.id}
                  className="rounded-lg border border-hairline bg-canvas-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">
                        {label}
                      </span>
                      {display && (
                        <>
                          <span className="text-hairline">·</span>
                          <span className="text-xs text-body font-mono break-all">
                            {display}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-normal text-ink tracking-[-0.02em]">
                      {link.title}
                    </h3>
                    <p className="text-sm font-normal text-body-mid leading-relaxed">
                      {link.description}
                    </p>
                  </div>

                  {link.isAction && link.actionType === "copy-email" ? (
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-normal text-canvas hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
                    >
                      {copied ? "Copied to Clipboard" : link.buttonText || "Copy Address"}
                    </button>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-normal text-ink transition-colors hover:border-white shrink-0"
                    >
                      {link.buttonText || "Open Link ↗"}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CORE CAPABILITIES & STACK */}
        {profile.capabilities && profile.capabilities.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-hairline">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              // CAPABILITIES & ARCHITECTURE
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.capabilities.map((cap) => (
                <div
                  key={cap.headline}
                  className="rounded-lg border border-hairline bg-canvas-card p-6 space-y-2 flex flex-col justify-between"
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
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 3. Footer Band */}
      <footer className="border-t border-hairline bg-canvas py-12 px-6 sm:px-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              {profile.name.toUpperCase()} // MYLINK INTERFACE
            </p>
            <p className="text-xs text-body-mid">
              Engineered with restraint • Strict Dark Canvas • xAI Design System • LocalStorage Driven
            </p>
          </div>

          <div className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">
            © {new Date().getFullYear()} {profile.name.toUpperCase()}
          </div>
        </div>
      </footer>

      {/* 4. Minimalist Notification Toast (Hairline Card Treatment) */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-hairline bg-canvas-card px-4 py-3 text-xs font-mono tracking-tight text-ink shadow-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>ADDRESS COPIED: {profile.email}</span>
        </div>
      )}
    </div>
  );
}
