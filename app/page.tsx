"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Activity,
  Search,
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle
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
    } catch (err: any) {
      setError("Unable to connect to PolyTracking Backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 15000); // 15s polling for status
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
          notify_1pct: false, // Default off
          notify_5pct: true,  // Default >5% on
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

  // 核心功能：單獨更新某個門檻的開關
  const toggleNotification = async (assetId: string, type: 'notify_1pct' | 'notify_5pct' | 'notify_10pct', currentValue: boolean) => {
    // Optimistic UI Update (先讓介面變色，再送請求)
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
      // Revert if failed
      setMarkets(markets.map(m =>
        m.asset_id === assetId ? { ...m, [type]: currentValue } : m
      ));
      alert("Failed to update setting");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1.5 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">PolyTracking</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <div className={`w-2 h-2 rounded-full ${!error ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {error ? "OFFLINE" : "LIVE"}
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Add Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Add New Market</h2>
          <form onSubmit={handleAddMarket} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Market Title (e.g. Will Trump Win?)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Asset ID / Token ID"
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={adding}
                className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {adding ? "Adding..." : "Watch"}
              </button>
            </div>
          </form>
        </div>

        {/* Watchlist */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h2 className="text-xl font-bold">Watchlist</h2>
            <span className="text-gray-400 text-sm">{markets.length} active</span>
          </div>

          {markets.map((market) => (
            <div key={market.asset_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">

              {/* Left: Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                  {market.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{market.title}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1 break-all">ID: {market.asset_id.slice(0, 6)}...{market.asset_id.slice(-4)}</p>
                </div>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">

                {/* Notification Toggles */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => toggleNotification(market.asset_id, 'notify_1pct', market.notify_1pct)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${market.notify_1pct ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    &gt;1%
                  </button>
                  <button
                    onClick={() => toggleNotification(market.asset_id, 'notify_5pct', market.notify_5pct)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${market.notify_5pct ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    &gt;5%
                  </button>
                  <button
                    onClick={() => toggleNotification(market.asset_id, 'notify_10pct', market.notify_10pct)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${market.notify_10pct ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    &gt;10%
                  </button>
                </div>

                <div className="w-px h-8 bg-gray-200 mx-2"></div>

                <button
                  onClick={() => handleDeleteMarket(market.asset_id)}
                  className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {markets.length === 0 && !loading && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No markets tracked yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
