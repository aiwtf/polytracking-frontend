"use client";

import { useEffect, useRef, useState } from "react";
import { getSmartMoneyTrades, SmartMoneyTrade } from "@/lib/api/polymarket";

export default function SmartMoneyFeed({ onSelect }: { onSelect: (wallet: string) => void }) {
  const [items, setItems] = useState<SmartMoneyTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const lastIds = useRef<Set<string>>(new Set());

  const load = async () => {
    try {
      const data = await getSmartMoneyTrades(30);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-white/10 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Live Smart Trades</h3>
        <div className="text-xs text-slate-400">auto-refresh 30s</div>
      </div>
      {loading ? (
        <div className="text-slate-400 py-6">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-slate-400 py-6">No data</div>
      ) : (
        <div className="space-y-2">
          {items.map((t, i) => (
            <div
              key={i}
              onClick={() => onSelect(t.wallet)}
              className={`cursor-pointer rounded-md p-3 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-between ${t.smartscore>85?'ring-1 ring-orange-400/60':''}`}
            >
              <div className="min-w-0">
                <div className="text-white text-sm truncate">{t.market}</div>
                <div className="text-slate-400 text-xs font-mono truncate">{t.wallet.slice(0,10)}...{t.wallet.slice(-6)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${t.side?.toLowerCase()==='yes'?'bg-green-500/20 text-green-300':'bg-red-500/20 text-red-300'}`}>
                  {t.side} ${Math.round(t.amount_usdc||0)}
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Score {t.smartscore.toFixed(1)}</span>
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Conf {(t.confidence??0).toFixed(0)}%</span>
                <span className="text-xs text-orange-300">{t.smartscore>85?'🔥':''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
