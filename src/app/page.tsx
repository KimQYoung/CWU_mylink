"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const email = "contact@example.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  // 노션의 장식용 스티커 팔레트 (Only for decorative dots & micro icons, never for CTAs)
  const stickerPalette = {
    sky: "#62aef0",
    purple: "#d6b6f6",
    pink: "#ff64c8",
    orange: "#dd5b00",
    teal: "#2a9d99",
    green: "#1aae39",
  };

  const techStacks = [
    { name: "React", dot: stickerPalette.sky },
    { name: "Next.js", dot: "#31302e" },
    { name: "TypeScript", dot: "#0075de" },
    { name: "Tailwind CSS", dot: stickerPalette.teal },
    { name: "Python", dot: stickerPalette.orange },
    { name: "Git", dot: stickerPalette.pink },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f6f5f4] text-[#000000] font-sans antialiased flex flex-col items-center">
      
      {/* 1. Top Navigation Bar (nav-bar) */}
      <header className="sticky top-0 z-40 w-full border-b border-[#e6e6e6] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            {/* Notion-style Document Icon */}
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#e6e6e6] bg-[#f6f5f4] text-xs font-semibold text-[#31302e]">
              📄
            </div>
            <div className="flex items-center gap-1.5 text-[15px] font-medium text-[#31302e]">
              <span className="font-semibold text-[#000000]">김규영</span>
              <span className="text-[#a39e98]">/</span>
              <span className="text-[#615d59]">Profile</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEmail}
              className="group flex h-8 items-center gap-1.5 rounded-[8px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium text-[#31302e] transition-colors hover:bg-[#f6f5f4] active:scale-[0.98]"
            >
              <svg className="h-3.5 w-3.5 text-[#615d59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>{copied ? "복사됨" : "이메일 복사"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Document Page Container */}
      <main className="w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12 flex-1">
        
        {/* Document Card Surface */}
        <div
          className="overflow-hidden rounded-[12px] border border-[#e6e6e6] bg-white transition-shadow"
          style={{
            boxShadow:
              "0 0.175px 1.041px rgba(0,0,0,0.01), 0 0.8px 2.925px rgba(0,0,0,0.02), 0 2.025px 7.847px rgba(0,0,0,0.027), 0 4px 18px rgba(0,0,0,0.04)",
          }}
        >
          {/* Hero Band (Notion's Deep Indigo 'Night' Cover Band - colors.secondary #213183) */}
          <div className="relative h-40 sm:h-48 w-full bg-[#213183] overflow-hidden">
            {/* Constellation Dots & Floating Sticker Icons */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
            
            {/* Decorative stickers constellation */}
            <div className="absolute top-6 right-8 flex items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-full bg-white/10 px-2.5 text-[11px] font-medium text-white/90 backdrop-blur-md border border-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff64c8]" />
                Night Shift
              </span>
            </div>

            <div className="absolute bottom-4 left-6 sm:left-8 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#62aef0] animate-pulse" />
              <span className="text-xs font-medium text-white/75">
                Developer Workspace
              </span>
            </div>
          </div>

          {/* Profile Body Content */}
          <div className="relative px-6 sm:px-8 pb-8 pt-0">
            
            {/* Avatar overlapping the hero banner */}
            <div className="-mt-14 sm:-mt-16 mb-5 flex items-end justify-between">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
                <Image
                  src="/profile.jpg"
                  alt="김규영"
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              {/* Status Pill Badge (badge-pill) */}
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#e6e6e6] bg-[#f6f5f4] px-3 py-1 text-[12px] font-semibold text-[#0075de]">
                <span className="h-2 w-2 rounded-full bg-[#1aae39]" />
                Open for Projects
              </div>
            </div>

            {/* Eyebrow Category */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[12px] font-semibold tracking-[+0.125px] text-[#0075de] uppercase">
                Student & Developer
              </span>
              <span className="text-xs text-[#a39e98]">•</span>
              <span className="text-[13px] font-normal text-[#615d59]">
                컴퓨터공학과 2학년
              </span>
            </div>

            {/* Display Headline (typography.heading-1) */}
            <h1 className="text-3xl sm:text-[38px] font-bold leading-[1.1] text-[#000000] tracking-[-1px]">
              김규영
            </h1>
            <p className="mt-1 text-[15px] font-normal text-[#615d59]">
              QYoung Kim · @KimQYoung
            </p>

            {/* Notion Callout Box (Signature Document Callout) */}
            <div className="mt-5 flex items-start gap-3.5 rounded-[8px] border border-[#e6e6e6] bg-[#f6f5f4] p-4">
              <span className="text-lg leading-none select-none">💡</span>
              <div className="text-[15px] leading-[1.5] text-[#31302e]">
                문제를 코드로 해결하고 가치 있는 경험을 만드는 개발자입니다.
                새로운 기술을 탐구하며 차분하고 꾸준하게 성장하고 있습니다.
              </div>
            </div>

            {/* Metadata Summary Tiles (Decorative Sticker Dots & Hairline Cards) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-[8px] border border-[#e6e6e6] bg-white p-3.5 transition-colors hover:bg-[#f6f5f4]">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#615d59]">
                  <span className="h-2 w-2 rounded-full bg-[#d6b6f6]" />
                  전공
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#000000]">
                  컴퓨터공학전공
                </div>
              </div>

              <div className="rounded-[8px] border border-[#e6e6e6] bg-white p-3.5 transition-colors hover:bg-[#f6f5f4]">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#615d59]">
                  <span className="h-2 w-2 rounded-full bg-[#2a9d99]" />
                  위치
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#000000]">
                  대한민국, 서울
                </div>
              </div>

              <div className="rounded-[8px] border border-[#e6e6e6] bg-white p-3.5 transition-colors hover:bg-[#f6f5f4]">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#615d59]">
                  <span className="h-2 w-2 rounded-full bg-[#dd5b00]" />
                  관심 분야
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#000000]">
                  Web & UI Engineering
                </div>
              </div>
            </div>

            {/* Tech Stack Pills (Notion Database Tag style) */}
            <div className="mt-7">
              <div className="mb-2.5 text-[12px] font-semibold tracking-[+0.125px] text-[#615d59] uppercase">
                Skills & Tech Stack
              </div>
              <div className="flex flex-wrap gap-2">
                {techStacks.map((tech) => (
                  <span
                    key={tech.name}
                    className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#e6e6e6] bg-[#f6f5f4] px-2.5 py-1 text-[13px] font-medium text-[#31302e] transition-colors hover:bg-[#eceae8]"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: tech.dot }}
                    />
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider Hairline */}
            <div className="my-7 h-[1px] w-full bg-[#e6e6e6]" />

            {/* Buttons & Actions (Strict adherence to Notion CTA rules) */}
            <div className="flex flex-col gap-3">
              <div className="text-[12px] font-semibold tracking-[+0.125px] text-[#615d59] uppercase">
                Links & Contact
              </div>

              {/* Primary CTA (button-primary) — The Single Blue Action (#0075de) */}
              <a
                href="https://github.com/KimQYoung"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-12 w-full items-center justify-between rounded-full bg-[#0075de] px-5 text-white transition-all hover:bg-[#005bab] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span className="text-[15px] font-medium tracking-tight">
                    GitHub 프로필 바로가기
                  </span>
                </div>
                <span className="text-white/80 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </a>

              {/* Secondary CTA (button-secondary) — Pill with hairline & soft shadow */}
              <a
                href="https://velog.io"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-12 w-full items-center justify-between rounded-full border border-[#e6e6e6] bg-white px-5 text-[#31302e] transition-all hover:bg-[#f6f5f4] active:scale-[0.98]"
                style={{
                  boxShadow:
                    "0 0.175px 1.041px rgba(0,0,0,0.01), 0 0.8px 2.925px rgba(0,0,0,0.02)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center text-[#615d59]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-[15px] font-medium tracking-tight">
                    기술 블로그 읽어보기
                  </span>
                </div>
                <span className="text-[#a39e98] transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </a>

              {/* Utility Button (button-utility) — Rounded-md (8px), quiet hairline */}
              <div className="flex items-center justify-between rounded-[8px] border border-[#e6e6e6] bg-white p-3.5 transition-colors hover:bg-[#f6f5f4]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#e6e6e6] bg-[#f6f5f4] text-[#615d59]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[13px] font-semibold text-[#000000]">이메일 문의</p>
                    <p className="text-[12px] font-normal text-[#615d59] truncate">{email}</p>
                  </div>
                </div>

                <button
                  onClick={handleCopyEmail}
                  className="shrink-0 rounded-[6px] border border-[#e6e6e6] bg-white px-3 py-1.5 text-[13px] font-medium text-[#31302e] transition-colors hover:bg-[#f6f5f4] active:scale-[0.98] cursor-pointer"
                >
                  {copied ? "복사완료 ✨" : "주소 복사"}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* 3. Footer Band (footer) */}
        <footer className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#615d59]">
          <div className="flex items-center gap-2">
            <span>Built with Notion Design System</span>
            <span>•</span>
            <span className="text-[#a39e98]">Paper-soft Canvas</span>
          </div>
          <p className="text-[#a39e98]">© 2026 Kim Kyu Young</p>
        </footer>

      </main>

      {/* Floating Toast Notification (Level-2 Elevated Shadow) */}
      {copied && (
        <div
          className="fixed bottom-6 z-50 flex items-center gap-2.5 rounded-full border border-[#e6e6e6] bg-white px-4 py-2.5 text-[14px] font-medium text-[#31302e] transition-all animate-in fade-in slide-in-from-bottom-2"
          style={{
            boxShadow:
              "0 6px 16px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)",
          }}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1aae39] text-white text-[10px] font-bold">
            ✓
          </span>
          <span>이메일 주소가 클립보드에 복사되었습니다.</span>
        </div>
      )}

    </div>
  );
}
