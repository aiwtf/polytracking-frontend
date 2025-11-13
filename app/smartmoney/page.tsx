"use client";
import { useEffect, useState } from "react";
import { getLeaderboard, getSmartMoneyTrades, getWalletDetail, getRecentTrades } from "@/lib/api/polymarket";

interface LeaderRow { rank: number; wallet: string; smartscore: number; win_rate: number; avg_roi: number; entry_timing: number; recent_volume: number; }
interface Trade { wallet: string; market: string; amount_usdc: number; side: string; timestamp: string; smartscore?: number; }
interface WalletDetail { wallet: string; roiHistory: { date: string; roi: number; trades: number; win_rate: number; volume: number; }[]; recentTrades: { market: string; side: string; amount: number; priceBefore: number; priceAfter: number; timestamp: string; }[]; }

export default function SmartMoneyPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [recent, setRecent] = useState<Trade[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [walletDetail, setWalletDetail] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    try {
      const [lb, sm, rc] = await Promise.all([
        getLeaderboard(50),
        getSmartMoneyTrades(50),
        getRecentTrades(50),
      ]);
      setLeaderboard(lb);
      setTrades(sm);
      setRecent(rc.map((r: any) => ({ ...r })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); const id = setInterval(loadAll, 60000); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (!selected) { setWalletDetail(null); return; }
    (async () => { const data = await getWalletDetail(selected); setWalletDetail(data); })();
  }, [selected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">Smart Money Intelligence</h1>
          <p className="text-slate-400 text-sm">Real-time tracking of Polymarket's top performers</p>
        </div>
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">🏆 Leaderboard</h2>
              {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            </div>
            {loading && leaderboard.length === 0 && <div className="text-slate-400 text-sm text-center py-8">Loading...</div>}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-blue-900/10 transition-all hover:shadow-blue-900/20">
              <table className="w-full text-xs">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-800/80 text-slate-300">
                  <tr>
                    <th className="p-3 text-left font-semibold">#</th>
                    <th className="p-3 text-left font-semibold">Wallet</th>
                    <th className="p-3 text-right font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(r => (
                    <tr key={r.wallet} onClick={() => setSelected(r.wallet)} className={`cursor-pointer transition-all duration-200 hover:bg-slate-800/60 hover:shadow-inner ${selected===r.wallet?'bg-gradient-to-r from-blue-900/30 to-violet-900/20 border-l-2 border-blue-500':''}`}> 
                      <td className="p-3 text-slate-400">{r.rank}</td>
                      <td className="p-3 font-mono text-slate-300 hover:text-blue-400 transition-colors">{r.wallet.slice(0,8)}...{r.wallet.slice(-4)}</td>
                      <td className="p-3 text-right font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{r.smartscore.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">⚡ Recent Smart Trades</h2>
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar">
              {trades.map((t,i) => {
                const ts = new Date(t.timestamp).toLocaleTimeString(undefined,{hour12:false});
                return (
                  <div key={i} className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-lg p-4 shadow-lg hover:shadow-xl hover:border-slate-700 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-3">
                        <div className="font-mono text-sm text-blue-400 mb-1">{t.wallet.slice(0,8)}...{t.wallet.slice(-4)}</div>
                        <div className="text-slate-300 text-xs leading-relaxed truncate" title={t.market}>{t.market}</div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className={`font-semibold text-sm ${t.side==='YES'? 'text-green-400':'text-purple-400'}`}>{t.side} ${(t.amount_usdc||0).toFixed(0)}</div>
                        <div className="bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-bold px-2 py-1 rounded-full">{t.smartscore?.toFixed(1)}</div>
                        <div className="text-slate-500 text-xs">{ts}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-3 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">📊 Wallet Detail</h2>
            {!selected && <div className="text-slate-400 text-xs bg-slate-900/30 border border-slate-800/30 rounded-lg p-4 text-center">← Select a wallet</div>}
            {walletDetail && (
              <div className="space-y-3">
                <div className="text-xs font-mono bg-gradient-to-r from-blue-900/20 to-violet-900/20 border border-slate-800/50 rounded-lg p-2 break-all">{walletDetail.wallet}</div>
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-lg p-4 shadow-lg">
                  <div className="font-semibold text-sm mb-3 text-slate-200">💰 ROI History</div>
                  <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                    {walletDetail.roiHistory.slice(-30).map((r,i)=>(
                      <div key={i} className="flex justify-between items-center text-xs hover:bg-slate-800/30 px-2 py-1 rounded transition-colors">
                        <span className="text-slate-400">{r.date.slice(5)}</span>
                        <span className="font-semibold text-green-400">{r.roi.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-lg p-4 shadow-lg">
                  <div className="font-semibold text-sm mb-3 text-slate-200">🔥 Recent Trades</div>
                  <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                    {walletDetail.recentTrades.slice(0,30).map((t,i)=>(
                      <div key={i} className="flex justify-between items-center text-xs hover:bg-slate-800/30 px-2 py-1 rounded transition-colors">
                        <span className="truncate flex-1 text-slate-300" title={t.market}>{t.market.slice(0,16)}...</span>
                        <span className={`font-semibold ml-2 ${t.side==='YES'?'text-green-400':'text-purple-400'}`}>{t.side} ${(t.amount||0).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-[10px] text-slate-600">🔄 Auto-refresh 60s • MVP ⚡</div>
    </div>
  );
}