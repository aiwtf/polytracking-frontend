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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-4">
          <h1 className="text-xl font-bold">Smart Money Leaderboard</h1>
          {loading && leaderboard.length === 0 && <div className="text-slate-400">Loading...</div>}
          <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Wallet</th>
                  <th className="p-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(r => (
                  <tr key={r.wallet} onClick={() => setSelected(r.wallet)} className={`cursor-pointer hover:bg-slate-800 ${selected===r.wallet?'bg-slate-800/70':''}`}> 
                    <td className="p-2 text-slate-400">{r.rank}</td>
                    <td className="p-2 font-mono">{r.wallet.slice(0,8)}...{r.wallet.slice(-4)}</td>
                    <td className="p-2 text-right text-blue-400 font-semibold">{r.smartscore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:col-span-5 space-y-4">
          <h2 className="text-xl font-semibold">Recent Smart Trades</h2>
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {trades.map((t,i) => {
              const ts = new Date(t.timestamp).toLocaleTimeString(undefined,{hour12:false});
              return (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded p-3 text-xs flex justify-between">
                  <div className="flex-1 mr-2">
                    <div className="font-mono text-slate-300">{t.wallet.slice(0,8)}...{t.wallet.slice(-4)}</div>
                    <div className="text-slate-400 truncate" title={t.market}>{t.market}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={t.side==='YES'? 'text-green-400':'text-purple-300'}>{t.side} ${(t.amount_usdc||0).toFixed(0)}</div>
                    <div className="text-blue-400">{t.smartscore?.toFixed(1)}</div>
                    <div className="text-slate-500">{ts}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-xl font-semibold">Wallet Detail</h2>
          {!selected && <div className="text-slate-400 text-xs">Select a wallet from the leaderboard.</div>}
          {walletDetail && (
            <div className="space-y-3">
              <div className="text-xs font-mono">{walletDetail.wallet}</div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2 text-xs">
                <div className="font-semibold mb-1">ROI History</div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {walletDetail.roiHistory.slice(-30).map((r,i)=>(
                    <div key={i} className="flex justify-between">
                      <span>{r.date.slice(5)}</span>
                      <span className="text-green-400">{r.roi.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2 text-xs">
                <div className="font-semibold mb-1">Recent Trades</div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {walletDetail.recentTrades.slice(0,30).map((t,i)=>(
                    <div key={i} className="flex justify-between">
                      <span className="truncate" title={t.market}>{t.market.slice(0,18)}</span>
                      <span className={t.side==='YES'?'text-green-400':'text-purple-300'}>{t.side} ${(t.amount||0).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 text-center text-[10px] text-slate-600">Auto-refresh 60s • MVP build</div>
    </div>
  );
}