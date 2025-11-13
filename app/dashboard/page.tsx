"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, getSmartMoneyTrades, getWalletDetail } from "@/lib/api/polymarket";

interface LeaderRow { rank: number; wallet: string; smartscore: number; win_rate: number; avg_roi: number; entry_timing: number; recent_volume: number; }
interface Trade { wallet: string; market: string; amount_usdc: number; side: string; timestamp: string; smartscore?: number; }
interface WalletDetail { wallet: string; roiHistory: { date: string; roi: number; trades: number; win_rate: number; volume: number; }[]; recentTrades: { market: string; side: string; amount: number; priceBefore: number; priceAfter: number; timestamp: string; }[]; }

export default function Dashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [walletDetail, setWalletDetail] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    try {
      const [lb, sm] = await Promise.all([
        getLeaderboard(30),
        getSmartMoneyTrades(40),
      ]);
      setLeaderboard(lb);
      setTrades(sm);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); const id = setInterval(loadAll, 60000); return () => clearInterval(id); }, []);
  useEffect(() => { if (!selected) { setWalletDetail(null); return; } (async () => { const data = await getWalletDetail(selected); setWalletDetail(data); })(); }, [selected]);

  // Derived stats
  const smartWallets = leaderboard.length;
  const avgScore = smartWallets ? (leaderboard.reduce((a,b)=> a + b.smartscore,0) / smartWallets).toFixed(1) : "0.0";
  const avgWinRate = smartWallets ? (leaderboard.reduce((a,b)=> a + b.win_rate,0) / smartWallets).toFixed(1) + "%" : "0%";
  const avgROI = smartWallets ? (leaderboard.reduce((a,b)=> a + b.avg_roi,0) / smartWallets).toFixed(1) + "%" : "0%";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">SmartMoney Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">聚合最新錢包分數與智能交易 • 每 60 秒自動刷新</p>
          </div>
          <a href="/smartmoney" className="text-xs bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-4 py-2 rounded-lg font-semibold shadow shadow-blue-900/40 transition">前往完整排行榜 →</a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur border border-blue-800/30 rounded-xl p-4 shadow hover:shadow-lg transition">
            <div className="text-xs text-slate-300">Smart Wallets</div>
            <div className="text-3xl font-bold mt-1 text-blue-400">{smartWallets}</div>
            <div className="text-[10px] text-slate-500 mt-1">今日追蹤數量</div>
          </div>
          <div className="bg-gradient-to-br from-violet-900/30 to-violet-900/10 backdrop-blur border border-violet-800/30 rounded-xl p-4 shadow hover:shadow-lg transition">
            <div className="text-xs text-slate-300">Avg SmartScore</div>
            <div className="text-3xl font-bold mt-1 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{avgScore}</div>
            <div className="text-[10px] text-slate-500 mt-1">平均分數</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 backdrop-blur border border-emerald-800/30 rounded-xl p-4 shadow hover:shadow-lg transition">
            <div className="text-xs text-slate-300">Avg WinRate</div>
            <div className="text-3xl font-bold mt-1 text-emerald-400">{avgWinRate}</div>
            <div className="text-[10px] text-slate-500 mt-1">平均勝率</div>
          </div>
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur border border-amber-800/30 rounded-xl p-4 shadow hover:shadow-lg transition">
            <div className="text-xs text-slate-300">Avg ROI</div>
            <div className="text-3xl font-bold mt-1 text-amber-300">{avgROI}</div>
            <div className="text-[10px] text-slate-500 mt-1">平均報酬率</div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Leaderboard */}
          <div className="md:col-span-4 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">🏆 <span>排行榜 (Top {leaderboard.length})</span> {loading && <span className="ml-2 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>}</h2>
            <div className="bg-slate-900/60 backdrop-blur border border-slate-800/50 rounded-xl overflow-hidden shadow">
              <table className="w-full text-xs">
                <thead className="bg-slate-800/80 text-slate-300">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Wallet</th>
                    <th className="p-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(r => (
                    <tr key={r.wallet} onClick={() => setSelected(r.wallet)} className={`cursor-pointer hover:bg-slate-800/50 transition ${selected===r.wallet?'bg-blue-900/40':''}`}> 
                      <td className="p-2 text-slate-400">{r.rank}</td>
                      <td className="p-2 font-mono text-slate-200">{r.wallet.slice(0,8)}...{r.wallet.slice(-4)}</td>
                      <td className="p-2 text-right font-semibold text-blue-400">{r.smartscore.toFixed(1)}</td>
                    </tr>
                  ))}
                  {!loading && leaderboard.length===0 && <tr><td colSpan={3} className="p-4 text-center text-slate-500">No data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Smart Trades */}
          <div className="md:col-span-5 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">⚡ <span>最新智能交易</span></h2>
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-2 custom-scrollbar">
              {trades.map((t,i)=>{
                const ts = new Date(t.timestamp).toLocaleTimeString(undefined,{hour12:false});
                return (
                  <div key={i} className="bg-slate-900/70 backdrop-blur border border-slate-800/50 rounded-lg p-3 flex justify-between text-xs hover:border-slate-700 transition">
                    <div className="flex-1 mr-2 min-w-0">
                      <div className="font-mono text-blue-400">{t.wallet.slice(0,8)}...{t.wallet.slice(-4)}</div>
                      <div className="text-slate-400 truncate" title={t.market}>{t.market}</div>
                    </div>
                    <div className="text-right w-28 space-y-1">
                      <div className={t.side==='YES'? 'text-emerald-400 font-semibold':'text-purple-400 font-semibold'}>{t.side} ${(t.amount_usdc||0).toFixed(0)}</div>
                      <div className="text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-violet-500 px-2 py-0.5 rounded-full inline-block">{t.smartscore?.toFixed(1)}</div>
                      <div className="text-slate-500">{ts}</div>
                    </div>
                  </div>
                );
              })}
              {!loading && trades.length===0 && <div className="text-center text-slate-500 text-xs py-8">No trades</div>}
            </div>
          </div>

          {/* Wallet Detail */}
          <div className="md:col-span-3 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">📊 <span>錢包詳情</span></h2>
            {!selected && <div className="text-xs text-slate-500 bg-slate-900/40 border border-slate-800/40 rounded-lg p-4">點選左側錢包查看詳情</div>}
            {walletDetail && (
              <div className="space-y-3">
                <div className="font-mono text-[11px] bg-slate-900/60 border border-slate-800/50 rounded p-2 break-all">{walletDetail.wallet}</div>
                <div className="bg-slate-900/70 border border-slate-800/50 rounded-lg p-3 text-xs">
                  <div className="font-semibold mb-2">ROI History</div>
                  <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                    {walletDetail.roiHistory.slice(-30).map((r,i)=>(
                      <div key={i} className="flex justify-between">
                        <span className="text-slate-400">{r.date.slice(5)}</span>
                        <span className="text-emerald-400 font-medium">{r.roi.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900/70 border border-slate-800/50 rounded-lg p-3 text-xs">
                  <div className="font-semibold mb-2">Recent Trades</div>
                  <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                    {walletDetail.recentTrades.slice(0,25).map((t,i)=>(
                      <div key={i} className="flex justify-between">
                        <span className="truncate w-2/3" title={t.market}>{t.market}</span>
                        <span className={t.side==='YES'? 'text-emerald-400':'text-purple-400'}>{t.side} ${(t.amount||0).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-center text-[10px] text-slate-600">🔄 Auto-refresh 60s • Modern Dashboard • Telegram @Polytracking</div>
      </div>
    </div>
  );
}
