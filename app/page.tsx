export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-10">
      <h1 className="text-4xl font-bold mb-4">PolyTracking</h1>
      <p className="text-gray-400 mb-8 text-center max-w-xl">
        AI 驅動的 Polymarket 錢包分析平台。追蹤異常內線、盈利錢包與自動信號推播。
      </p>
      <a
        href="https://t.me/yourchannel"
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-lg"
      >
        前往 Telegram 頻道
      </a>
    </main>
  )
}
