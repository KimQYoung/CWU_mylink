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

  const techStacks = [
    { name: "Next.js", bg: "bg-black text-white", rotate: "-rotate-1" },
    { name: "React", bg: "bg-cyan-200 text-black", rotate: "rotate-2" },
    { name: "TypeScript", bg: "bg-blue-300 text-black", rotate: "-rotate-2" },
    { name: "Tailwind CSS", bg: "bg-teal-300 text-black", rotate: "rotate-1" },
    { name: "Python", bg: "bg-amber-300 text-black", rotate: "-rotate-1" },
    { name: "Git", bg: "bg-rose-300 text-black", rotate: "rotate-2" },
    { name: "✦ Vibe Coding", bg: "bg-purple-300 text-black", rotate: "-rotate-2" },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#F4F0EA] text-black font-sans selection:bg-yellow-300 selection:text-black">
      
      {/* 1. 배경 레트로 격자 그리드 패턴 */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-[0.15]" 
        style={{
          backgroundImage: "linear-gradient(#000000 1.2px, transparent 1.2px), linear-gradient(90deg, #000000 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px"
        }}
      />

      {/* 2. 네오브루탈리즘 메인 윈도우 카드 컨테이너 */}
      <main className="relative w-full max-w-lg rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000000] overflow-hidden transition-all">
        
        {/* 상단 레트로 OS 윈도우 바 */}
        <header className="flex h-12 items-center justify-between border-b-4 border-black bg-yellow-400 px-4 select-none">
          {/* OS 버튼 3개 */}
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-black bg-rose-500 inline-block shadow-[1px_1px_0px_0px_#000]" />
            <span className="h-3.5 w-3.5 rounded-full border-2 border-black bg-amber-400 inline-block shadow-[1px_1px_0px_0px_#000]" />
            <span className="h-3.5 w-3.5 rounded-full border-2 border-black bg-emerald-500 inline-block shadow-[1px_1px_0px_0px_#000]" />
          </div>

          {/* 중앙 주소창 타이틀 */}
          <div className="rounded-md border-2 border-black bg-white px-3 py-0.5 font-mono text-xs font-bold tracking-tight shadow-[2px_2px_0px_0px_#000]">
            mylink.dev/kimqyoung
          </div>

          {/* 상태 뱃지 */}
          <div className="flex items-center gap-1 rounded border-2 border-black bg-emerald-300 px-2 py-0.5 font-mono text-[11px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000]">
            <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
            LIVE
          </div>
        </header>

        {/* 메인 프로필 본문 */}
        <div className="p-6 sm:p-8">
          
          {/* 프로필 헤더 (아바타 & 스티커 & 이름) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 pb-6 border-b-[3px] border-black">
            
            {/* 아바타 이미지 (하드 섀도우 & 볼드 보더) */}
            <div className="relative shrink-0 self-start sm:self-center">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-black bg-emerald-200 overflow-hidden shadow-[5px_5px_0px_0px_#000000]">
                <Image
                  src="/avatar.png"
                  alt="김규영 프로필 이미지"
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              {/* 귀여운 스티커 뱃지 */}
              <div className="absolute -top-3 -right-3 rotate-12 rounded-lg border-2 border-black bg-pink-400 px-2 py-0.5 font-mono text-[11px] font-black text-black shadow-[2px_2px_0px_0px_#000]">
                HELLO! ✦
              </div>
            </div>

            {/* 이름 및 직무 */}
            <div className="flex-1 space-y-2 text-left">
              <div className="inline-block -rotate-1 rounded-md border-2 border-black bg-sky-200 px-2.5 py-0.5 font-mono text-xs font-extrabold uppercase shadow-[2px_2px_0px_0px_#000]">
                Junior Software Developer
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black flex items-center gap-2">
                김규영
                <span className="text-xl sm:text-2xl font-mono text-zinc-600 font-bold">
                  (@KimQYoung)
                </span>
              </h1>

              <p className="font-mono text-xs font-bold text-zinc-700">
                🚀 Web Developer • Student • Problem Solver
              </p>
            </div>
          </div>

          {/* 개발자 소개글 박스 (메모장 / 말풍선 느낌) */}
          <div className="mt-6 rounded-xl border-[3px] border-black bg-[#FEF9C3] p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000000] text-left">
            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-black mb-2">
              <span>📌 BIO.TXT</span>
            </div>
            <p className="text-sm sm:text-base font-semibold leading-relaxed text-black">
              아이디어를 코드로 실현하는 개발자 김규영입니다! <br className="hidden sm:inline" />
              문제를 집요하게 파고들고, 새로운 기술을 탐구하며 함께 성장하는 과정을 즐깁니다.
            </p>
          </div>

          {/* 테크 스택 (스티커 태그 컬렉션) */}
          <div className="mt-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <span>⚡ TECH STACK</span>
              </h2>
              <span className="font-mono text-[11px] font-bold text-zinc-500">Skills & Tools</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 pb-1">
              {techStacks.map((tech) => (
                <span
                  key={tech.name}
                  className={`inline-block ${tech.rotate} rounded-lg border-2 border-black px-3 py-1 font-mono text-xs font-extrabold shadow-[2.5px_2.5px_0px_0px_#000000] transition-transform hover:scale-105 hover:rotate-0 cursor-default ${tech.bg}`}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>

          {/* 핵심 링크 리스트 (누르는 재미가 있는 하드 버튼) */}
          <div className="mt-8 space-y-3.5 text-left">
            <h2 className="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <span>🔗 FEATURED LINKS</span>
            </h2>

            {/* 1. GitHub 버튼 */}
            <a
              href="https://github.com/KimQYoung"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border-[3px] border-black bg-white p-3.5 sm:p-4 shadow-[5px_5px_0px_0px_#000000] transition-all hover:bg-violet-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-black text-white shadow-[2px_2px_0px_0px_#000]">
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-mono text-sm sm:text-base font-black text-black">
                    GITHUB PROFILE
                  </h3>
                  <p className="text-xs font-semibold text-zinc-600">
                    오픈소스 저장소 및 잔디 활동 둘러보기
                  </p>
                </div>
              </div>
              <span className="rounded-lg border-2 border-black bg-yellow-300 px-3 py-1 font-mono text-xs font-black shadow-[2px_2px_0px_0px_#000] group-hover:bg-yellow-400">
                GO ➔
              </span>
            </a>

            {/* 2. CWU_mylink 저장소 버튼 */}
            <a
              href="https://github.com/KimQYoung/CWU_mylink"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border-[3px] border-black bg-[#E0F2FE] p-3.5 sm:p-4 shadow-[5px_5px_0px_0px_#000000] transition-all hover:bg-[#BAE6FD] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-blue-500 text-white font-mono font-black text-lg shadow-[2px_2px_0px_0px_#000]">
                  ✦
                </div>
                <div>
                  <h3 className="font-mono text-sm sm:text-base font-black text-black">
                    PROJECT REPOSITORY
                  </h3>
                  <p className="text-xs font-semibold text-zinc-700">
                    CWU_mylink Next.js 프로젝트 소스 코드
                  </p>
                </div>
              </div>
              <span className="rounded-lg border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                VIEW ➔
              </span>
            </a>

            {/* 3. 이메일 원클릭 복사 버튼 */}
            <div
              onClick={handleCopyEmail}
              className="group flex items-center justify-between rounded-xl border-[3px] border-black bg-[#DCFCE7] p-3.5 sm:p-4 shadow-[5px_5px_0px_0px_#000000] transition-all hover:bg-[#BBF7D0] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-emerald-600 text-white shadow-[2px_2px_0px_0px_#000]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-mono text-sm sm:text-base font-black text-black truncate">
                    CONTACT EMAIL
                  </h3>
                  <p className="text-xs font-semibold text-zinc-700 truncate">
                    {email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black shadow-[2px_2px_0px_0px_#000] group-hover:bg-black group-hover:text-white transition-colors"
              >
                {copied ? "COPIED! ✨" : "COPY"}
              </button>
            </div>

          </div>

          {/* 레트로 스타일 푸터 */}
          <footer className="mt-8 pt-5 border-t-[3px] border-black text-center">
            <p className="font-mono text-xs font-extrabold text-black uppercase tracking-tight">
              ★ 2026 KIM KYU YOUNG • NEO-BRUTALISM EDITION ★
            </p>
          </footer>

        </div>
      </main>

      {/* 네오브루탈 토스트 알림 */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl border-[3px] border-black bg-black px-5 py-3 text-sm font-mono font-black text-yellow-300 shadow-[5px_5px_0px_0px_#FFE500] animate-bounce">
          <span>✓</span>
          <span>EMAIL COPIED TO CLIPBOARD! ✨</span>
        </div>
      )}

    </div>
  );
}
