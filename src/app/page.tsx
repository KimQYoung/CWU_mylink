export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <main className="flex w-full max-w-md flex-col items-center rounded-3xl border border-zinc-200/80 bg-white p-8 text-center shadow-lg shadow-zinc-200/40 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none sm:p-10">
        {/* 프로필 이미지 / 아바타 */}
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-3xl font-bold text-white shadow-md shadow-blue-500/20 ring-4 ring-white dark:ring-zinc-800">
          김
        </div>

        {/* 배지 */}
        <span className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          컴퓨터공학과 · 2학년
        </span>

        {/* 이름 */}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          김규영
        </h1>

        {/* 소개글 */}
        <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          문제를 코드로 해결하고 가치 있는 경험을 만드는 개발자입니다. 새로운 기술을 탐구하며 꾸준히 성장하고 있습니다.
        </p>

        {/* 구분선 */}
        <div className="my-6 h-px w-full bg-zinc-100 dark:bg-zinc-800" />

        {/* 소셜 및 바로가기 링크 버튼들 */}
        <div className="flex w-full flex-col gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            GitHub 바로가기
          </a>
          <a
            href="mailto:contact@example.com"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            이메일 보내기
          </a>
        </div>
      </main>
    </div>
  );
}
