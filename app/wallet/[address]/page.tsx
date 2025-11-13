"use client";
import { useEffect, useState } from 'react';
import { getWalletDetail, getLeaderboard } from '@/lib/api/polymarket';
import { useParams } from 'next/navigation';

interface WalletDetail { wallet: string; roiHistory: { date: string; roi: number; trades: number; win_rate: number; volume: number; }[]; recentTrades: { market: string; side: string; amount: number; priceBefore: number; priceAfter: number; timestamp: string; }[]; }

export default function WalletPage() {
  const params = useParams();
  const address = params?.address as string;
  const [detail, setDetail] = useState<WalletDetail | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if (!address) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getWalletDetail(address);
        setDetail(data);
        const lb = await getLeaderboard(200);
        const row = (lb||[]).find((r:any)=> r.wallet===address);
        setScore(row? row.smartscore : null);
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    })();
  },[address]);

  if (!address) return <div className='p-6 text-slate-300 text-center mt-20'>No address provided.</div>;
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6'>
      <div className='max-w-6xl mx-auto space-y-8'>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👛</div>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-3'>Wallet Analytics</h1>
          <div className='font-mono text-sm text-slate-400 bg-slate-900/50 border border-slate-800/50 rounded-lg px-4 py-3 inline-block break-all max-w-full'>{address}</div>
        </div>
        {loading && <div className='text-center py-16'><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}
        {detail && (
          <>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-sm border border-blue-800/30 rounded-xl p-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
                <div className='text-slate-400 text-xs font-semibold mb-2'>⭐ SmartScore</div>
                <div className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent'>{score!==null? score.toFixed(1): '—'}</div>
                <div className='text-slate-500 text-[10px] mt-1'>Today</div>
              </div>
              <div className='bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
                <div className='text-slate-400 text-xs font-semibold mb-2'>📊 Total Trades</div>
                <div className='text-3xl font-bold text-slate-200'>{detail.roiHistory.reduce((a,b)=> a + (b.trades||0),0)}</div>
                <div className='text-slate-500 text-[10px] mt-1'>Last 90 days</div>
              </div>
              <div className='bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 backdrop-blur-sm border border-emerald-800/30 rounded-xl p-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
                <div className='text-slate-400 text-xs font-semibold mb-2'>💹 Avg ROI</div>
                <div className='text-3xl font-bold text-emerald-400'>{(detail.roiHistory.reduce((a,b)=> a + b.roi,0)/Math.max(1,detail.roiHistory.length)).toFixed(1)}%</div>
                <div className='text-slate-500 text-[10px] mt-1'>90-day average</div>
              </div>
              <div className='bg-gradient-to-br from-violet-900/30 to-violet-900/10 backdrop-blur-sm border border-violet-800/30 rounded-xl p-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
                <div className='text-slate-400 text-xs font-semibold mb-2'>💰 Volume</div>
                <div className='text-3xl font-bold text-violet-400'>${detail.roiHistory.reduce((a,b)=> a + (b.volume||0),0).toLocaleString()}</div>
                <div className='text-slate-500 text-[10px] mt-1'>Total 90d</div>
              </div>
            </div>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 shadow-xl'>
                <div className='font-bold text-base mb-4 flex items-center gap-2'>
                  <span>📈</span>
                  <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">ROI History</span>
                  <span className="text-slate-500 text-xs font-normal">(Last 90 days)</span>
                </div>
                <div className='max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar'>
                  {detail.roiHistory.map((r,i)=>(
                    <div key={i} className='flex justify-between items-center text-sm hover:bg-slate-800/30 px-3 py-2 rounded-lg transition-colors'>
                      <span className="text-slate-400 font-medium">{r.date}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs">{r.trades} trades</span>
                        <span className='font-bold text-emerald-400'>{r.roi.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className='bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 shadow-xl'>
                <div className='font-bold text-base mb-4 flex items-center gap-2'>
                  <span>🔥</span>
                  <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Recent Trades</span>
                </div>
                <div className='max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar'>
                  {detail.recentTrades.slice(0,30).map((t,i)=>(
                    <div key={i} className='hover:bg-slate-800/30 px-3 py-2 rounded-lg transition-colors'>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold text-sm ${t.side==='YES'?'text-emerald-400':'text-purple-400'}`}>{t.side}</span>
                        <span className="font-semibold text-slate-200">${(t.amount||0).toLocaleString()}</span>
                      </div>
                      <div className='text-slate-400 text-xs truncate' title={t.market}>{t.market}</div>
                      <div className="text-slate-600 text-[10px] mt-1">Before: {t.priceBefore.toFixed(3)} → After: {t.priceAfter.toFixed(3)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}