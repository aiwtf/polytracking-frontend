'use client';
import { useEffect, useState } from 'react';
import { getSmartMoneyTrades } from '@/lib/api/polymarket';

interface Trade { wallet: string; market: string; amount_usdc: number; side: string; timestamp: string; smartscore: number; }

export default function SignalsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const data = await getSmartMoneyTrades(50);
      setTrades(data.filter((t:any)=> t.smartscore >= 70).slice(0,20));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); const id=setInterval(load,60000); return ()=>clearInterval(id); },[]);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Signals</h1>
        <p className="text-slate-400 mb-4">Latest Telegram-worthy smart trades (Score ≥ 70). Refreshes every 60s.</p>
        <a href="https://t.me/Polytracking" target="_blank" className="inline-block mb-6 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm">加入 Telegram 獲取即時訊號</a>
        {loading && <div className="text-slate-400">Loading...</div>}
        <div className="space-y-2">
          {trades.map((t,i)=>{
            const ts = new Date(t.timestamp).toLocaleTimeString(undefined,{hour12:false});
            return (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded p-3 text-xs flex justify-between">
                <div className="flex-1 mr-2 truncate" title={t.market}>
                  <div className="font-mono">{t.wallet.slice(0,8)}...{t.wallet.slice(-4)}</div>
                  <div className="text-slate-400 truncate">{t.market}</div>
                </div>
                <div className="text-right w-32">
                  <div className={t.side==='YES'?'text-green-400':'text-purple-300'}>{t.side} ${(t.amount_usdc||0).toFixed(0)}</div>
                  <div className="text-blue-400">{t.smartscore.toFixed(1)}</div>
                  <div className="text-slate-500">{ts}</div>
                </div>
              </div>
            );
          })}
          {!loading && trades.length===0 && <div className="text-slate-500 text-xs">No signals ≥ 70 found.</div>}
        </div>
      </div>
    </div>
  );
}
