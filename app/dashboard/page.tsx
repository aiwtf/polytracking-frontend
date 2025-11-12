"use client";

import { useState } from "react";
import StatsCards from "@/components/StatsCards";
import SmartMoneyTable from "@/components/SmartMoneyTable";
import SmartMoneyFeed from "@/components/SmartMoneyFeed";
import SmartSignalPanel from "@/components/SmartSignalPanel";
import AlertWidget from "@/components/AlertWidget";

export default function Dashboard() {
  const [selectedWallet, setSelectedWallet] = useState<string | undefined>(undefined);

  const TEST_KEY = process.env.NEXT_PUBLIC_RUN_TEST_KEY;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://polytracking-backend-tv7j.onrender.com';
  const sendTest = async () => {
    let key = TEST_KEY || (typeof window !== 'undefined' ? localStorage.getItem('RUN_TEST_KEY') || '' : '');
    if (!key && typeof window !== 'undefined') {
      key = window.prompt('請輸入 RUN_SECRET_KEY 用於測試警報：') || '';
      if (key) localStorage.setItem('RUN_TEST_KEY', key);
    }
    if (!key) return alert('未提供測試用密鑰');
    const res = await fetch(`${API_BASE}/api/test_alert?key=${encodeURIComponent(key)}`, { method: 'POST' });
    if (res.ok) alert('✅ 測試成功'); else alert('❌ 測試失敗');
  };

  return (
    <div className="min-h-screen bg-[#1A1B2F] text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SmartMoney Intelligence</h1>
          <button onClick={sendTest} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded">測試 Telegram 警報</button>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <SmartMoneyTable onSelect={setSelectedWallet} />
          </div>
          <div className="lg:col-span-1">
            <SmartMoneyFeed onSelect={setSelectedWallet} />
          </div>
          <div className="lg:col-span-1">
            <SmartSignalPanel wallet={selectedWallet} onClose={() => setSelectedWallet(undefined)} />
          </div>
        </div>

        <footer className="text-sm text-slate-400 pt-4">自動刷新 30 秒 • Telegram: @Polytracking</footer>
      </div>
      <AlertWidget onOpenWallet={setSelectedWallet} />
    </div>
  );
}
