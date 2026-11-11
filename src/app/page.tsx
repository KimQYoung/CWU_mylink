"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const email = "103734455+KimQYoung@users.noreply.github.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const techStacks = [
    { name: "Next.js", color: "bg-black text-white dark:bg-white dark:text-black" },
    { name: "React", color: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300" },
    { name: "TypeScript", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" },
    { name: "Tailwind CSS", color: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300" },
    { name: "Python", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
    { name: "Git", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 bg-zinc-100/80 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 overflow-x-hidden font-sans">
      
      {/* 앰비언트 백그라운드 글로우 (은은한 분위기) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[360px] w-[360px] sm:h-[500px] sm:w-[500px] rounded-full bg-gradient-to-tr from-indigo-500/15 via-sky-500/10 to-teal-500/15 blur-3xl dark:from-indigo-600/20 dark:via-purple-600/15 dark:to-teal-500/15" />
      </div>

      {/* 메인 반응형 프로필 카드 */}
      <main className="relative w-full max-w-md sm:max-w-lg rounded-3xl overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl shadow-zinc-300/40 dark:shadow-black/60 transition-all">
        
        {/* 1. 상단 그라데이션 히어로 배너 */}
        <div className="relative h-32 sm:h-36 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 overflow-hidden">
          {/* 배너 장식 패턴 */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
          
          {/* 활동 상태 뱃지 */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/15 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>Vibe Coding</span>
          </div>
        </div>

        {/* 2. 프로필 콘텐츠 본문 */}
        <div className="px-6 sm:px-8 pb-8">
          
          {/* 아바타 이미지 (배너와 겹치는 구조) */}
          <div className="-mt-14 sm:-mt-16 mb-4 flex items-end justify-between">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 shadow-lg overflow-hidden group">
              <Image
                src="/avatar.png"
                alt="김규영 프로필 이미지"
                width={112}
                height={112}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>

            {/* 작은 소셜 바로가기 아이콘들 */}
            <div className="flex items-center gap-2 mb-1">
              <a
                href="https://github.com/KimQYoung"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub 프로필"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>

              <button
                onClick={handleCopyEmail}
                aria-label="이메일 주소 복사"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 이름 & 직무 타이틀 */}
          <div className="space-y-1.5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                김규영
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                Junior Software Developer
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              @KimQYoung • Software Engineer
            </p>
          </div>

          {/* 개발자 소개글 */}
          <div className="mt-4 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-left">
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              아이디어를 코드로 실현하는 개발자입니다. <br className="hidden sm:inline" />
              문제를 집요하게 파고들고, 새로운 기술을 탐구하며 함께 성장하는 과정을 즐깁니다.
            </p>
          </div>

          {/* 3. 관심 기술 스택 칩 */}
          <div className="mt-5 text-left">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-2.5">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {techStacks.map((tech) => (
                <span
                  key={tech.name}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border border-black/5 dark:border-white/5 ${tech.color}`}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>

          {/* 4. 링크 리스트 카드 섹션 (MyLink 핵심 기능) */}
          <div className="mt-6 space-y-3">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 text-left">
              Featured Links
            </h2>

            {/* GitHub 링크 카드 */}
            <a
              href="https://github.com/KimQYoung"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">GitHub 프로필</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">오픈소스 저장소 및 커밋 활동</p>
                </div>
              </div>
              <span className="text-zinc-400 group-hover:translate-x-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-all text-sm font-semibold">
                →
              </span>
            </a>

            {/* MyLink 프로젝트 레포지토리 카드 */}
            <a
              href="https://github.com/KimQYoung/CWU_mylink"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-sm">
                  <span className="text-base font-bold">🔗</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">CWU_mylink 저장소</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Next.js 16 기반 프로필 서비스 소스 코드</p>
                </div>
              </div>
              <span className="text-zinc-400 group-hover:translate-x-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-all text-sm font-semibold">
                →
              </span>
            </a>

            {/* 이메일 복사 액션 카드 */}
            <div
              onClick={handleCopyEmail}
              className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2-0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">이메일 연락처</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">클릭 시 주소 복사</p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                {copied ? "복사완료 ✨" : "복사"}
              </button>
            </div>

          </div>

          {/* 5. 푸터 */}
          <footer className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              © 2026 Kim Kyu Young • Built with Next.js & Tailwind CSS
            </p>
          </footer>

        </div>
      </main>

      {/* 부드러운 복사 완료 알림 토스트 */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl dark:bg-white dark:text-zinc-900 transition-all animate-bounce">
          <span>✓</span>
          <span>이메일 주소가 클립보드에 복사되었습니다!</span>
        </div>
      )}

    </div>
  );
}
