"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Activity,
} from "lucide-react";

interface Market {
  asset_id: string;
  title: string;
  is_active: boolean;
  notify_1pct: boolean;
  notify_5pct: boolean;
  notify_10pct: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polytracking-backend-tv7j.onrender.com";

// Helper to generate consistent avatar colors
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-100 text-red-600",
    "bg-orange-100 text-orange-600",
    "bg-amber-100 text-amber-600",
    "bg-green-100 text-green-600",
    "bg-emerald-100 text-emerald-600",
    "bg-teal-100 text-teal-600",
    "bg-cyan-100 text-cyan-600",
    "bg-blue-100 text-blue-600",
    "bg-indigo-100 text-indigo-600",
    "bg-violet-100 text-violet-600",
    "bg-purple-100 text-purple-600",
    "bg-fuchsia-100 text-fuchsia-600",
    "bg-pink-100 text-pink-600",
    "bg-rose-100 text-rose-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [newAssetId, setNewAssetId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/markets`);
      if (!res.ok) throw new Error("Connection failed");
      const data = await res.json();
      setMarkets(data);
      if (error) setError(""); // Clear error on success
    } catch (err: any) {
      setError("Unable to connect to PolyTracking Backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetId || !newTitle) return;

    setAdding(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/markets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: newAssetId,
          title: newTitle,
          notify_1pct: false,
          notify_5pct: true,
          notify_10pct: true
        }),
      });
      if (!res.ok) throw new Error("Failed to add market");

      setNewAssetId("");
      setNewTitle("");
      fetchMarkets();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteMarket = async (assetId: string) => {
    if (!confirm("Stop tracking this market?")) return;
    try {
      await fetch(`${API_URL}/api/markets/${assetId}`, { method: "DELETE" });
      setMarkets(markets.filter(m => m.asset_id !== assetId));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const toggleNotification = async (assetId: string, type: 'notify_1pct' | 'notify_5pct' | 'notify_10pct', currentValue: boolean) => {
    setMarkets(markets.map(m =>
      m.asset_id === assetId ? { ...m, [type]: !currentValue } : m
    ));

    try {
      await fetch(`${API_URL}/api/markets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: !currentValue }),
      });
    } catch (err) {
      setMarkets(markets.map(m =>
        m.asset_id === assetId ? { ...m, [type]: currentValue } : m
      ));
      alert("Failed to update setting");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-gray-200">

      {/* Header */}
      <header className="h-16 flex items-center bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-3xl w-full px-5 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-1.5 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PolyTracking</h1>
          </div>

          {/* Search Bar Placeholder (Visual only to match screenshot) */}
          <div className="hidden sm:flex relative w-full max-w-xs ml-auto">
            <input
              type="text"
              placeholder="Search markets..."
              className="w-full bg-white border border-gray-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none placeholder:text-gray-400 transition-all shadow-sm"
              disabled
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 sm:px-8 py-10 sm:py-12">

        {/* Hero Section (Centered) */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 mb-4 shadow-sm">
            <span className={`size-2 rounded-full ${!error ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {!error ? "System Online" : "System Offline"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4 text-gray-900">
            PolyTracking
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed">
            Track Polymarket events and get instant volatility alerts.
          </p>
        </section>

        {/* Status Card (Mimicking "Telegram alerts" card) */}
        <section className="mb-10">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Backend Status</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {error ? "Connection to backend server lost." : "Connected to PolyTracking Backend."}
                </p>
              </div>
              <div>
                <button
                  className="w-full inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all border border-gray-200 bg-white shadow-sm hover:bg-gray-50 h-10 rounded-xl px-4 text-gray-700"
                  onClick={fetchMarkets}
                >
                  {loading ? "Checking..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Add Market Form */}
        <section className="mb-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              Add New Market
            </h3>
          </div>
          <div className="w-full">
            <form onSubmit={handleAddMarket} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Market Title (e.g. Will Trump Win?)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none placeholder:text-gray-400 transition-all"
              />
              <input
                type="text"
                placeholder="Asset ID (0x...)"
                value={newAssetId}
                onChange={(e) => setNewAssetId(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none font-mono placeholder:text-gray-400 transition-all"
              />
              <button
                type="submit"
                disabled={adding}
                className="bg-black text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
              >
                {adding ? "Adding..." : "Watch"}
              </button>
            </form>
          </div>
        </section>

        {/* Watchlist */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              Your watchlist
              <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {markets.length}
              </div>
            </h3>
            <button className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl gap-2 text-xs h-9 px-4 shadow-sm">
              <Search className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {markets.map((market) => (
              <div key={market.asset_id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4">

                  {/* Top: Avatar & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 size-10 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(market.title)}`}>
                      {market.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate text-gray-900 text-sm sm:text-base">
                        {market.title}
                      </div>
                      <div className="text-xs text-gray-400 truncate font-mono mt-0.5">
                        Added on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Controls */}
                  <div className="w-full flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">

                      {/* 1% Toggle */}
                      <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={market.notify_1pct}
                          onChange={() => toggleNotification(market.asset_id, 'notify_1pct', market.notify_1pct)}
                          className="cursor-pointer size-3 accent-blue-600"
                        />
                        <span>&gt;1%</span>
                      </label>

                      {/* 5% Toggle */}
                      <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={market.notify_5pct}
                          onChange={() => toggleNotification(market.asset_id, 'notify_5pct', market.notify_5pct)}
                          className="cursor-pointer size-3 accent-purple-600"
                        />
                        <span>&gt;5%</span>
                      </label>

                      {/* 10% Toggle */}
                      <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={market.notify_10pct}
                          onChange={() => toggleNotification(market.asset_id, 'notify_10pct', market.notify_10pct)}
                          className="cursor-pointer size-3 accent-red-600"
                        />
                        <span>&gt;10%</span>
                      </label>
                    </div>

                    <button
                      onClick={() => handleDeleteMarket(market.asset_id)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all border border-gray-200 bg-white shadow-sm hover:bg-gray-50 h-9 rounded-xl px-4 text-gray-700"
                    >
                      Unwatch
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {markets.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No markets tracked</h3>
                <p className="text-xs text-gray-500 mt-1">Add a market ID above to start monitoring.</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
