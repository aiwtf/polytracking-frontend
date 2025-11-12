'use client';

import { useEffect, useState } from 'react';
import { getSmartMoneyTrades, SmartMoneyTrade } from '@/lib/api/polymarket';

async function subscribeFree(chatId: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://polytracking-backend-tv7j.onrender.com';
  const url = `${API_BASE}/api/subscribe_tg?chat_id=${encodeURIComponent(chatId)}&mode=free`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('subscribe failed');
  return res.json();
}

export default function SignalsPage() {
  const [trades, setTrades] = useState<SmartMoneyTrade[]>([]);
  const [sortBy, setSortBy] = useState<'smartscore' | 'confidence'>('smartscore');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
  const data = await getSmartMoneyTrades(10);
  data.sort((a,b) => (Number(b[sortBy] ?? 0)) - (Number(a[sortBy] ?? 0)));
  setTrades(data as SmartMoneyTrade[]);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [sortBy]);

  const onSubscribe = async () => {
    const chatId = window.prompt('輸入你的 Telegram chat_id（可用 @userinfobot 取得）');
    if (!chatId) return;
    try {
      await subscribeFree(chatId);
      alert('已訂閱 Free 推播（延遲 5 分鐘）。可再申請 VIP 取得即時推播。');
    } catch (e: any) {
      alert('訂閱失敗：' + (e?.message || 'unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Smart Signals</h1>

        <div className="bg-white/10 border border-white/20 rounded-lg p-6 mb-6">
          <p className="text-gray-200 mb-4">
            🚨 想即時收到聰明錢下注通知？加入 Telegram 頻道或綁定你的帳號接收私訊。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://t.me/Polytracking"
              target="_blank"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
            >
              加入 @Polytracking 頻道
            </a>
            <button
              onClick={onSubscribe}
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
            >
              立即註冊（Free，延遲 5 分鐘）
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl text-white font-semibold">最新 10 筆 SmartMoney 交易</h2>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setSortBy('smartscore')}
              className={`px-3 py-1 rounded ${sortBy==='smartscore'?'bg-indigo-600 text-white':'bg-indigo-900 text-indigo-300'} hover:bg-indigo-700`}
            >Sort: SmartScore</button>
            <button
              onClick={() => setSortBy('confidence')}
              className={`px-3 py-1 rounded ${sortBy==='confidence'?'bg-indigo-600 text-white':'bg-indigo-900 text-indigo-300'} hover:bg-indigo-700`}
            >Sort: Confidence</button>
          </div>
        </div>
        {loading ? (
          <div className="text-gray-300">Loading...</div>
        ) : err ? (
          <div className="text-red-300">Error: {err}</div>
        ) : trades.length === 0 ? (
          <div className="text-gray-300">目前沒有資料</div>
        ) : (
          <div className="space-y-3">
            {trades.map((t, i) => {
              const time = new Date(t.timestamp);
              return (
                <div
                  key={i}
                  className="group relative bg-white/10 border border-white/20 rounded p-4 hover:bg-white/20 transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-white font-mono text-sm">
                      {t.wallet.slice(0, 10)}...{t.wallet.slice(-6)}
                    </div>
                    <div className="text-gray-400 text-xs">{time.toLocaleString()}</div>
                  </div>
                  <div className="text-gray-200 mt-2 line-clamp-2">{t.market}</div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded ${t.side?.toLowerCase() === 'yes' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {t.side} ${(t.amount_usdc || 0).toFixed(0)}
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      Score: {t.smartscore?.toFixed(1)}
                    </span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                      Conf: {(t.confidence ?? 0).toFixed(0)}%
                    </span>
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                      Strength: {(t.strength ?? 0).toFixed(0)}
                    </span>
                    {t.insider_flag && (
                      <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">INSIDER</span>
                    )}
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      Entry: {(t.entry_timing_score * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                      Risk: {t.risk_label || '—'}
                    </span>
                    <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded">
                      TargetROI: {(t.target_roi ?? 0).toFixed(0)}%
                    </span>
                  </div>
                  {/* Hover card */}
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition absolute left-0 top-full mt-2 w-full bg-slate-900/95 border border-indigo-700 rounded p-4 shadow-xl text-xs text-indigo-100 space-y-1">
                    <div><b>Alpha Index:</b> {(t.alpha_score ?? 0).toFixed(2)}</div>
                    <div><b>Confidence:</b> {(t.confidence ?? 0).toFixed(0)}%</div>
                    <div><b>Strength:</b> {(t.strength ?? 0).toFixed(1)}</div>
                    <div><b>Risk Level:</b> {t.risk_label}</div>
                    <div><b>Target ROI:</b> {(t.target_roi ?? 0).toFixed(0)}%</div>
                    <div><b>WinRate:</b> {Math.round((t.win_rate ?? 0)*100)}% | <b>Avg ROI:</b> {Math.round((t.avg_roi ?? 0)*100)}%</div>
                    <div><b>Volume:</b> ${ (t.volume ?? 0).toFixed(0) } | <b>Trades:</b> {t.trades_count ?? 0}</div>
                    <div><b>Rank:</b> {t.rank ?? '—'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
