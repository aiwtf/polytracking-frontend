"use client";

import { useEffect, useState } from "react";
import { getStatus, getHealth } from "@/lib/api/polymarket";
import WalletCard from "@/components/WalletCard";
import ChartROI from "@/components/ChartROI";
import AlertBox from "@/components/AlertBox";

interface WalletData {
  wallet: string;
  roi: number;
  volume: number;
  profit: number;
}

export default function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const [health, setHealth] = useState<{ ok: boolean } | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const s = await getStatus();
      const h = await getHealth();
      setStatus(s);
      setHealth(h);

      // 模擬假資料（後端 API 接好後再改成真實 fetch）
      setWallets([
        { wallet: "0xa2f3c8...", roi: 241, volume: 3120, profit: 312 },
        { wallet: "0x8dde41...", roi: 190, volume: 2150, profit: 215 },
        { wallet: "0x91bc7f...", roi: 512, volume: 8500, profit: 870 },
        { wallet: "0x4f82a1...", roi: -145, volume: 1200, profit: -174 },
        { wallet: "0xc3d921...", roi: 85, volume: 980, profit: 83 },
      ]);
      
      setLoading(false);
    }
    fetchData();
    
    // 每 30 秒刷新一次數據
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          🚀 PolyTracking 智能錢包分析系統
        </h1>
        <p className="text-slate-400 mb-6 text-lg">
          從 Polymarket 自動分析錢包 ROI、異常行為與 AI 投注集群。
        </p>

        {health && <AlertBox healthy={health.ok} />}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {wallets.map((w, i) => (
                <WalletCard key={i} data={w} />
              ))}
            </div>

            <div className="mt-10">
              <ChartROI wallets={wallets} />
            </div>
          </>
        )}

        <footer className="mt-10 text-sm text-slate-500 border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between">
            <span>🧠 Powered by PolyTracking AI</span>
            <a 
              href="https://t.me/Polytracking" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-400 transition-colors"
            >
              Telegram 頻道 →
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
