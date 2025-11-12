"use client";

import { useEffect, useState } from "react";
import { getSummary } from "@/lib/api/polymarket";

export default function StatsCards() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const s = await getSummary();
      setStats(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const smart = stats?.smartMoney || {};
  const cards = [
    { title: "Smart Wallets", value: smart.count ?? 0, hint: "今日追蹤錢包數" },
    { title: "Avg SmartScore", value: (smart.avgScore ?? 0).toFixed(1), hint: "今日平均分數" },
    { title: "Insider %", value: ((smart.insiderRatio ?? 0) * 100).toFixed(0) + "%", hint: "今日 Insider 比例" },
    { title: "Entry Timing", value: ((smart.avgEntryTiming ?? 0) * 100).toFixed(0) + "%", hint: "今日平均進場早度" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-slate-300">{c.title}</div>
          <div className="text-2xl font-bold text-white mt-1">{loading ? "—" : c.value}</div>
          <div className="text-xs text-slate-400 mt-1">{c.hint}</div>
        </div>
      ))}
    </div>
  );
}
