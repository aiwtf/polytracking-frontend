"use client";

import { useEffect, useState } from "react";
import { getWalletDetail } from "@/lib/api/polymarket";
import ROIChart from "@/components/ROIChart";
import TelegramSyncModal from "@/components/TelegramSyncModal";

export default function SmartSignalPanel({ wallet, onClose }: { wallet?: string; onClose?: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [openTG, setOpenTG] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!wallet) return;
      setLoading(true);
      try {
        const d = await getWalletDetail(wallet);
        setDetail(d);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [wallet]);

  if (!wallet) {
    return (
      <div className="bg-white/10 border border-white/10 rounded-xl p-4 min-h-[400px]">
        <div className="text-slate-300">選擇左側錢包或中間交易以查看詳情</div>
      </div>
    );
  }

  const recent = detail?.recentTrades || [];

  return (
    <div className="bg-white/10 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">SmartSignal Panel</h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        )}
      </div>

      <div className="text-slate-300 text-sm font-mono">{wallet}</div>

      {loading ? (
        <div className="text-slate-400 py-6">Loading...</div>
      ) : (
        <>
          <ROIChart data={detail?.roiHistory || []} />

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-semibold">近期交易</div>
              <div className="flex gap-2">
                <a
                  className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded"
                  target="_blank"
                  href={`https://polymarket.com/trader/${wallet}`}
                >查看 Polymarket Profile</a>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {recent.length === 0 ? (
                <div className="text-slate-400">沒有交易資料</div>
              ) : recent.map((t: any, i: number) => (
                <div key={i} className="text-sm text-slate-200 bg-white/5 border border-white/10 rounded p-2">
                  <div className="truncate">{t.market}</div>
                  <div className="text-xs text-slate-400">{t.side} ${Math.round(t.amount)} • {new Date(t.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <button onClick={() => setOpenTG(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded">立即訂閱信號通知</button>
          </div>
        </>
      )}

      <TelegramSyncModal open={openTG} onClose={() => setOpenTG(false)} />
    </div>
  );
}
