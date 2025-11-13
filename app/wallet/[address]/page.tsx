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

  if (!address) return <div className='p-6 text-slate-300'>No address.</div>;
  return (
    <div className='min-h-screen bg-slate-950 text-slate-100 p-6'>
      <div className='max-w-5xl mx-auto space-y-6'>
        <h1 className='text-xl font-bold font-mono break-all'>{address}</h1>
        {loading && <div className='text-slate-400'>Loading...</div>}
        {detail && (
          <>
            <div className='grid md:grid-cols-4 gap-4 text-xs'>
              <div className='bg-slate-900 border border-slate-800 rounded p-3'>
                <div className='text-slate-400'>SmartScore (Today)</div>
                <div className='text-2xl font-semibold text-blue-400'>{score!==null? score.toFixed(1): '—'}</div>
              </div>
              <div className='bg-slate-900 border border-slate-800 rounded p-3'>
                <div className='text-slate-400'>Trades (90d)</div>
                <div className='text-2xl font-semibold'>{detail.roiHistory.reduce((a,b)=> a + (b.trades||0),0)}</div>
              </div>
              <div className='bg-slate-900 border border-slate-800 rounded p-3'>
                <div className='text-slate-400'>Avg ROI (90d)</div>
                <div className='text-2xl font-semibold text-green-400'>{(detail.roiHistory.reduce((a,b)=> a + b.roi,0)/Math.max(1,detail.roiHistory.length)).toFixed(1)}%</div>
              </div>
              <div className='bg-slate-900 border border-slate-800 rounded p-3'>
                <div className='text-slate-400'>Volume (90d)</div>
                <div className='text-2xl font-semibold text-emerald-400'>${detail.roiHistory.reduce((a,b)=> a + (b.volume||0),0).toFixed(0)}</div>
              </div>
            </div>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='bg-slate-900 border border-slate-800 rounded p-4 text-xs'>
                <div className='font-semibold mb-2'>ROI History (Last 90d)</div>
                <div className='max-h-80 overflow-y-auto space-y-1'>
                  {detail.roiHistory.map((r,i)=>(
                    <div key={i} className='flex justify-between'>
                      <span>{r.date}</span>
                      <span className='text-green-400'>{r.roi.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className='bg-slate-900 border border-slate-800 rounded p-4 text-xs'>
                <div className='font-semibold mb-2'>Recent Trades</div>
                <div className='max-h-80 overflow-y-auto space-y-1'>
                  {detail.recentTrades.slice(0,20).map((t,i)=>(
                    <div key={i} className='flex justify-between'>
                      <span className='truncate w-2/3' title={t.market}>{t.market}</span>
                      <span className={t.side==='YES'?'text-green-400':'text-purple-300'}>{t.side} ${(t.amount||0).toFixed(0)}</span>
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