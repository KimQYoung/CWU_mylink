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

        {/* 소개글 */}
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다.
        </p>
      </main>
    </div>
  );
}
