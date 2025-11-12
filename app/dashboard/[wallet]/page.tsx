"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getWalletDetail } from "@/lib/api/polymarket";
import ROIChart from "@/components/ROIChart";
import ActivityTimeline from "@/components/ActivityTimeline";

export default function WalletDetailPage() {
  const params = useParams();
  const wallet = params.wallet as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) return;
    
    setLoading(true);
    getWalletDetail(wallet).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [wallet]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard" className="text-blue-400 hover:underline mb-4 inline-block">
            ← 返回 Dashboard
          </Link>
          <div className="bg-slate-900 rounded-xl p-8 text-center">
            <p className="text-slate-400">無法載入錢包數據</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard" className="text-blue-400 hover:underline mb-4 inline-block">
          ← 返回 Dashboard
        </Link>
        
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-slate-800 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2 font-mono">{wallet}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-slate-400 text-sm">ROI</p>
              <p className={`text-2xl font-bold ${data.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.roi > 0 ? '+' : ''}{data.roi.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">勝率</p>
              <p className="text-2xl font-bold text-slate-200">
                {(data.winRate || 0).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">總利潤</p>
              <p className={`text-2xl font-bold ${data.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.profit.toFixed(2)} USDC
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">交易數</p>
              <p className="text-2xl font-bold text-slate-200">
                {data.trades}
              </p>
            </div>
          </div>
        </div>

        <ROIChart data={data.history || []} />
        
        <ActivityTimeline trades={data.trades || []} />
      </div>
    </div>
  );
}
