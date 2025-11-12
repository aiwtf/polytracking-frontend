"use client";

import { useEffect, useState } from "react";
import { getSmartMoneyTrades } from "@/lib/api/polymarket";
import { formatAddress, formatNumber } from "@/lib/utils/format";

interface TradeRow {
  trader: string;
  alias?: string;
  market: string;
  amount_usdc: number;
  side: string;
  timestamp: string;
  smartscore?: number;
  insider_flag?: boolean;
  entry_timing_score?: number;
}

export default function SmartMoneyPage() {
  const [rows, setRows] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch smart money trades (already filtered by top 100 leaderboard)
  async function load() {
    setLoading(true);
    try {
      const trades = await getSmartMoneyTrades(50);
      setRows(trades);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60000); // refresh every 60s
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🧠 聰明錢最新動態</h1>
        <p className="text-slate-400 mb-6">顯示最近交易的可能聰明錢行為（每 60 秒自動刷新）</p>
        {loading && rows.length === 0 && (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        )}
        {!loading && rows.length === 0 && (
          <div className="py-10 text-center text-slate-400">No data</div>
        )}
        {rows.length > 0 && (
          <div className="overflow-x-auto bg-slate-900 rounded-lg border border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="text-left py-2 px-3">Rank</th>
                  <th className="text-left py-2 px-3">Trader</th>
                  <th className="text-left py-2 px-3">Market</th>
                  <th className="text-right py-2 px-3">Amount (USDC)</th>
                  <th className="text-right py-2 px-3">Side</th>
                  <th className="text-left py-2 px-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const isInsider = r.insider_flag;
                  const ts = new Date(r.timestamp);
                  const timeStr = ts.toLocaleTimeString(undefined, { hour12: false });
                  const amountFmt = r.amount_usdc >= 1000
                    ? `$${(r.amount_usdc / 1000).toFixed(1)}K`
                    : formatNumber(r.amount_usdc, 2);
                  return (
                    <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                      <td className="py-2 px-3 font-mono">
                        <span>{formatAddress(r.trader, 8, 6)}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {isInsider && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-red-900/60 text-red-300 border border-red-700/50">INSIDER</span>
                          )}
                          {typeof r.smartscore === 'number' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-900/50 text-blue-300 border border-blue-700/40">Score {r.smartscore.toFixed(1)}</span>
                          )}
                          {typeof r.entry_timing_score === 'number' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">Entry {(r.entry_timing_score * 100).toFixed(0)}%</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 max-w-[220px] truncate" title={r.market}>{r.market || '-'}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{amountFmt}</td>
                      <td className="py-2 px-3 text-right uppercase">
                        <span className={r.side === 'YES' ? 'text-green-400' : 'text-purple-300'}>{r.side}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{timeStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <footer className="mt-8 text-xs text-slate-500">資料來源 /api/trades/recent • 自動刷新 • 實驗性頁面</footer>
      </div>
    </div>
  );
}