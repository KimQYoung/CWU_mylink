"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const email = "contact@example.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const techStacks = [
    { name: "React", bg: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/60" },
    { name: "Next.js", bg: "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700" },
    { name: "TypeScript", bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60" },
    { name: "Tailwind CSS", bg: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/60" },
    { name: "Python", bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60" },
    { name: "Git", bg: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/60" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 py-12 text-zinc-900 transition-colors duration-300 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:text-zinc-100 sm:px-6 sm:py-20 flex items-center justify-center">
      {/* 배경 은은한 오로라 블러 효과 */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-400/20 via-indigo-400/20 to-purple-400/20 blur-3xl dark:from-blue-600/10 dark:via-indigo-600/10 dark:to-purple-600/10" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-400/15 to-blue-400/15 blur-3xl dark:from-cyan-600/10 dark:to-blue-600/10" />

      {/* 메인 프로필 카드 */}
      <main className="relative z-10 w-full max-w-lg rounded-3xl border border-zinc-200/80 bg-white/80 p-6 sm:p-10 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl transition-all duration-300 hover:shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-none">
        
        {/* 프로필 이미지 영역 */}
        <div className="flex flex-col items-center">
          <div className="relative group mb-5">
            {/* 이미지 테두리 빛 효과 */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 opacity-70 blur-sm transition duration-300 group-hover:opacity-100" />
            
            {/* 프로필 이미지 */}
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-white dark:ring-zinc-900 shadow-xl">
              <Image
                src="/profile.jpg"
                alt="김규영 프로필 이미지"
                fill
                sizes="112px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>

            {/* 온라인 상태 표시 뱃지 */}
            <span
              title="협업 및 연락 가능"
              className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white dark:bg-zinc-900 dark:ring-zinc-900"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
            </span>
          </div>

          {/* 소속 & 신분 뱃지 */}
          <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              컴퓨터공학과 · 2학년
            </span>
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              Junior Dev
            </span>
          </div>

          {/* 이름 */}
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            김규영
          </h1>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-0.5">
            QYoung Kim
          </p>

          {/* 소개글 */}
          <p className="mt-4 text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
            문제를 코드로 해결하고 가치 있는 경험을 만드는 개발자입니다.
            <br className="hidden sm:inline" />
            {" "}새로운 기술을 탐구하며 꾸준히 성장하고 있습니다.
          </p>

          {/* 기술 스택 태그 */}
          <div className="mt-6 w-full">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Tech Stack
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {techStacks.map((tech) => (
                <span
                  key={tech.name}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 ${tech.bg}`}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

        {/* 소셜 및 액션 링크 버튼들 */}
        <div className="flex w-full flex-col gap-3">
          {/* GitHub 링크 */}
          <a
            href="https://github.com/KimQYoung"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-between rounded-2xl border border-zinc-200/80 bg-zinc-900 p-4 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md dark:border-zinc-700/80 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 dark:bg-zinc-900/10">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">GitHub 저장소</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">@KimQYoung 소스코드 확인하기</p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-zinc-400 transition-transform duration-200 group-hover:translate-x-1 dark:text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* 블로그 / 기록 링크 (옵션) */}
          <a
            href="https://velog.io"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 text-zinc-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">기술 블로그</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">학습 기록 및 기술 아티클</p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-zinc-400 transition-transform duration-200 group-hover:translate-x-1 dark:text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* 이메일 복사 및 전송 버튼 */}
          <button
            onClick={handleCopyEmail}
            className="group flex w-full items-center justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 text-zinc-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">이메일 연락처</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{email}</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400">
              {copied ? "복사완료! ✨" : "주소 복사"}
            </span>
          </button>
        </div>

        {/* 푸터 정보 */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              📍 대한민국
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              💻 Coffee & Code
            </span>
          </div>
          <p>© 2026 김규영. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
