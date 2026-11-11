export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-12 dark:from-zinc-950 dark:to-black">
      <main className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        {/* 아바타 */}
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 text-2xl font-bold text-zinc-700 shadow-inner dark:bg-zinc-800 dark:text-zinc-200">
          KY
        </div>

        {/* 이름 */}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          김규영
        </h1>

        {/* 개발자 직무 배지 */}
        <div className="mt-2 flex justify-center">
          <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Junior Software Developer
          </span>
        </div>

        {/* 소개글 */}
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          아이디어를 코드로 실현하는 개발자입니다. <br />
          문제를 집요하게 탐구하고, 새로운 기술을 배우며 함께 성장하는 과정을 즐깁니다.
        </p>
      </main>
    </div>
  );
}
