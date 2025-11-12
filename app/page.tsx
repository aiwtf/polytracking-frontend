import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-10">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        PolyTracking
      </h1>
      <p className="text-gray-400 mb-8 text-center max-w-xl text-lg">
        AI 驅動的 Polymarket 錢包分析平台。追蹤異常內線、盈利錢包與自動信號推播。
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl text-lg font-semibold transition-colors"
        >
          進入 Dashboard
        </Link>
        <a
          href="https://t.me/Polytracking"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-800 hover:bg-slate-700 px-8 py-3 rounded-xl text-lg font-semibold transition-colors"
        >
          前往 Telegram 頻道
        </a>
      </div>
    </main>
  )
}
