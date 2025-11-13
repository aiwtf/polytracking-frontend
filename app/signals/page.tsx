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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 bg-clip-text text-transparent mb-3">🚨 Smart Signals</h1>
          <p className="text-slate-400 text-base mb-6">Telegram-worthy trades with SmartScore ≥ 70 • Auto-refresh every 60s</p>
          <a href="https://t.me/Polytracking" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <span>📱 加入 Telegram 獲取即時訊號</span>
          </a>
        </div>
        {loading && <div className="text-center py-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}
        <div className="space-y-4">
          {trades.map((t,i)=>{
            const ts = new Date(t.timestamp).toLocaleTimeString(undefined,{hour12:false,hour:'2-digit',minute:'2-digit'});
            return (
              <div key={i} className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5 shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Score: {t.smartscore.toFixed(1)}</div>
                      <div className="text-slate-500 text-xs">{ts}</div>
                    </div>
                    <div className="font-mono text-sm text-blue-400 mb-2 hover:text-blue-300 transition-colors">{t.wallet.slice(0,8)}...{t.wallet.slice(-4)}</div>
                    <div className="text-slate-300 text-sm leading-relaxed" title={t.market}>{t.market}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xl font-bold mb-1 ${t.side==='YES'? 'text-emerald-400':'text-purple-400'}`}>{t.side}</div>
                    <div className="text-2xl font-bold text-slate-200">${(t.amount_usdc||0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && trades.length===0 && (
            <div className="text-center py-16 bg-slate-900/30 border border-slate-800/30 rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-slate-400 text-sm">No signals with score ≥ 70 found at the moment.</div>
              <div className="text-slate-500 text-xs mt-2">Check back soon!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
