"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const email = "103734455+KimQYoung@users.noreply.github.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const capabilities = [
    {
      category: "CORE ARCHITECTURE",
      headline: "Full-Stack Web Systems",
      desc: "Next.js 16 (App Router), React 19, TypeScript. Engineered for performance and type-safe clarity.",
    },
    {
      category: "DESIGN & INTERACTION",
      headline: "Minimalist Interface Craft",
      desc: "Tailwind CSS, PostCSS. Sparse monochrome aesthetics, geometric typography, and hairline precision.",
    },
    {
      category: "ENGINEERING TOOLS",
      headline: "Version & Scripting Protocols",
      desc: "Git workflow, Python scripting, automated task pipelines, and agentic pair programming.",
    },
    {
      category: "EXPLORATION DOMAIN",
      headline: "Vibe Coding & AI Systems",
      desc: "Rapid generative iteration, AI-native workflows, and prototype acceleration.",
    },
  ];

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
              Kim Kyu Young
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              ACTIVE
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
              Kim Kyu Young
            </h1>
          </div>

          <p className="text-lg sm:text-xl font-normal text-body tracking-[-0.015em] max-w-2xl leading-relaxed">
            Junior software engineer exploring frontier web architectures, AI workflows, and rapid system engineering.
          </p>

          {/* Profile Telemetry Card */}
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-lg border border-hairline bg-canvas-card">
            <div className="relative h-16 w-16 rounded-full border border-hairline overflow-hidden bg-canvas-soft shrink-0">
              <Image
                src="/avatar.png"
                alt="Kim Kyu Young Avatar"
                width={64}
                height={64}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 w-full font-mono text-xs">
              <div>
                <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">CALLSIGN</span>
                <span className="text-ink font-normal">@KimQYoung</span>
              </div>
              <div>
                <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">DISCIPLINE</span>
                <span className="text-ink font-normal">Software Eng</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-body-mid uppercase tracking-[1.2px] mb-1">STATUS</span>
                <span className="text-sunset font-normal">Deploying Vibe Code</span>
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
              아이디어를 코드로 실현하는 개발자 김규영입니다.
            </p>
            <p className="text-sm sm:text-base font-normal text-body-mid leading-relaxed">
              복잡한 문제를 단순하고 직관적인 코드로 풀어내는 과정을 지향합니다. 새로운 도구와 기술을 신속하게 습득하고, 실험을 통해 검증하며 함께 성장하는 엔지니어링 문화를 추구합니다.
            </p>
          </div>
        </section>

        {/* DIRECTORY & ACCESS (LINK CARDS) */}
        <section className="space-y-6 pt-6 border-t border-hairline">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              // DIRECTORY & ACCESS
            </p>
            <span className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">
              3 VERIFIED ENDPOINTS
            </span>
          </div>

          <div className="space-y-3">
            
            {/* GitHub Card */}
            <div className="rounded-lg border border-hairline bg-canvas-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">ENDPOINT 01</span>
                  <span className="text-hairline">·</span>
                  <span className="text-xs text-body font-mono">github.com/KimQYoung</span>
                </div>
                <h3 className="text-xl font-normal text-ink tracking-[-0.02em]">
                  GitHub Repository & Telemetry
                </h3>
                <p className="text-sm font-normal text-body-mid leading-relaxed">
                  Open-source contributions, public repositories, and commit activity logs.
                </p>
              </div>

              <a
                href="https://github.com/KimQYoung"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-normal text-ink transition-colors hover:border-white shrink-0"
              >
                Open GitHub ↗
              </a>
            </div>

            {/* Project Repository Card */}
            <div className="rounded-lg border border-hairline bg-canvas-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">ENDPOINT 02</span>
                  <span className="text-hairline">·</span>
                  <span className="text-xs text-body font-mono">CWU_mylink</span>
                </div>
                <h3 className="text-xl font-normal text-ink tracking-[-0.02em]">
                  CWU_mylink Source Protocol
                </h3>
                <p className="text-sm font-normal text-body-mid leading-relaxed">
                  Next.js 16 full-stack profile implementation engineered according to xAI design language specifications.
                </p>
              </div>

              <a
                href="https://github.com/KimQYoung/CWU_mylink"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-normal text-ink transition-colors hover:border-white shrink-0"
              >
                View Source ↗
              </a>
            </div>

            {/* Email Contact Card (Filled pill variant as primary action) */}
            <div className="rounded-lg border border-hairline bg-canvas-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">ENDPOINT 03</span>
                  <span className="text-hairline">·</span>
                  <span className="text-xs text-body font-mono">Direct Communication</span>
                </div>
                <h3 className="text-xl font-normal text-ink tracking-[-0.02em]">
                  Direct Contact Channel
                </h3>
                <p className="text-sm font-normal text-body-mid break-all leading-relaxed">
                  {email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-normal text-canvas hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
              >
                {copied ? "Copied to Clipboard" : "Copy Email Address"}
              </button>
            </div>

          </div>
        </section>

        {/* CORE CAPABILITIES & STACK (2-UP GRID AT DESKTOP) */}
        <section className="space-y-6 pt-6 border-t border-hairline">
          <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
            // CAPABILITIES & ARCHITECTURE
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capabilities.map((cap) => (
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

      </main>

      {/* 3. Footer Band */}
      <footer className="border-t border-hairline bg-canvas py-12 px-6 sm:px-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[1.4px] text-body-mid">
              KIM KYU YOUNG // MYLINK INTERFACE
            </p>
            <p className="text-xs text-body-mid">
              Engineered with restraint • Strict Dark Canvas • xAI Design System
            </p>
          </div>

          <div className="font-mono text-xs text-body-mid uppercase tracking-[1.2px]">
            © 2026 KIM KYU YOUNG
          </div>
        </div>
      </footer>

      {/* 4. Minimalist Notification Toast (Hairline Card Treatment) */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-hairline bg-canvas-card px-4 py-3 text-xs font-mono tracking-tight text-ink shadow-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>ADDRESS COPIED: {email}</span>
        </div>
      )}

    </div>
  );
}
