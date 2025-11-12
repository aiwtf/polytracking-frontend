"use client";

import { useEffect, useMemo, useState } from "react";
import { getLeaderboard, getWallets } from "@/lib/api/polymarket";
import { formatNumber } from "@/lib/utils/format";

interface Row {
  rank: number;
  wallet: string;
  smartscore: number;
  roi?: number; // %
  winRate?: number; // %
  volume?: number;
  trades?: number;
  insider?: boolean;
}

export default function SmartMoneyTable({ onSelect }: { onSelect: (wallet: string) => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [sortBy, setSortBy] = useState<"score" | "roi">("score");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [lb, ws] = await Promise.all([getLeaderboard(100), getWallets()]);
      const byWallet: Record<string, any> = {};
      for (const w of ws || []) byWallet[(w.wallet || "").toLowerCase()] = w;
      const mapped = (lb || []).map((r: any) => {
        const w = byWallet[(r.wallet || "").toLowerCase()] || {};
        const reasons = r?.reasons || {};
        return {
          rank: r.rank,
          wallet: r.wallet,
          smartscore: Number(r.smartscore ?? 0),
          roi: typeof w.roi === 'number' ? w.roi : undefined,
          winRate: typeof w.winRate === 'number' ? w.winRate : undefined,
          volume: w.volume,
          trades: w.trades,
          insider: Boolean(reasons?.insider || reasons?.insider_flag === true),
        } as Row;
      });
      setRows(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() => {
    const arr = [...rows];
    if (sortBy === "roi") arr.sort((a,b) => (b.roi ?? -Infinity) - (a.roi ?? -Infinity));
    else arr.sort((a,b) => (b.smartscore ?? 0) - (a.smartscore ?? 0));
    return arr;
  }, [rows, sortBy]);

  return (
    <div className="bg-white/10 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Smart Money Leaderboard</h3>
        <div className="text-sm text-slate-300 flex gap-2">
          <button onClick={() => setSortBy('score')} className={`px-2 py-1 rounded ${sortBy==='score'?'bg-indigo-600 text-white':'bg-slate-800 text-slate-300'}`}>Score</button>
          <button onClick={() => setSortBy('roi')} className={`px-2 py-1 rounded ${sortBy==='roi'?'bg-indigo-600 text-white':'bg-slate-800 text-slate-300'}`}>ROI</button>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2 pr-3">Rank</th>
              <th className="text-left py-2 pr-3">Wallet</th>
              <th className="text-right py-2 pr-3">SmartScore</th>
              <th className="text-right py-2 pr-3">ROI%</th>
              <th className="text-right py-2 pr-3">WinRate</th>
              <th className="text-right py-2 pr-3">Volume</th>
              <th className="text-right py-2">Trades</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-slate-400 py-8">Loading...</td></tr>
            ) : (
              sorted.map((r, i) => (
                <tr key={i} onClick={() => onSelect(r.wallet)} className="cursor-pointer hover:bg-white/5">
                  <td className="py-2 pr-3 text-slate-200">#{r.rank}</td>
                  <td className="py-2 pr-3 text-white font-mono">{r.wallet.slice(0,10)}...{r.wallet.slice(-6)} {r.insider && <span className="ml-2 text-xs text-red-300">INSIDER</span>}</td>
                  <td className="py-2 pr-3 text-right text-indigo-300">{r.smartscore.toFixed(1)}</td>
                  <td className="py-2 pr-3 text-right">{typeof r.roi==='number' ? r.roi.toFixed(0)+'%' : '—'}</td>
                  <td className="py-2 pr-3 text-right">{typeof r.winRate==='number' ? r.winRate.toFixed(0)+'%' : '—'}</td>
                  <td className="py-2 pr-3 text-right">{r.volume ? '$'+formatNumber(r.volume) : '—'}</td>
                  <td className="py-2 text-right">{r.trades ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
