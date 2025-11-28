"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Activity,
  RefreshCw,
  AlertTriangle,
  Server,
  Copy,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";

interface Market {
  asset_id: string;
  title: string;
  is_active: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polytracking-backend-tv7j.onrender.com";

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendOnline, setBackendOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Form State
  const [newAssetId, setNewAssetId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  // UI State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMarkets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/markets`);
      if (!res.ok) throw new Error("Failed to fetch markets");
      const data = await res.json();
      setMarkets(data);
      setBackendOnline(true);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    // Poll backend status every 30s
    const interval = setInterval(fetchMarkets, 30000);
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
        body: JSON.stringify({ asset_id: newAssetId, title: newTitle }),
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
    if (!confirm("Are you sure you want to remove this target?")) return;

    try {
      const res = await fetch(`${API_URL}/api/markets/${assetId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete market");
      fetchMarkets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const truncateId = (id: string) => {
    if (id.length <= 10) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">

      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <ShieldAlert className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              WAR ROOM <span className="text-emerald-500">DASHBOARD</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${backendOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <Server className="w-3 h-3" />
              {backendOnline ? "SYSTEM ONLINE" : "CONNECTION LOST"}
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Active Targets</p>
              <p className="text-2xl font-bold text-white mt-1">{markets.length}</p>
            </div>
            <Activity className="w-8 h-8 text-zinc-700" />
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Last Update</p>
              <p className="text-2xl font-bold text-white mt-1">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--:--"}
              </p>
            </div>
            <RefreshCw className={`w-8 h-8 text-zinc-700 ${loading ? 'animate-spin' : ''}`} />
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">System Status</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">OPERATIONAL</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-900/50" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Add Market Console */}
        <section className="mb-12 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          <div className="relative bg-zinc-950 border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-zinc-100">
              <Plus className="w-5 h-5 text-emerald-500" />
              DEPLOY NEW TRACKER
            </h2>
            <form onSubmit={handleAddMarket} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold tracking-wider">Asset ID</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 p-3 rounded-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-zinc-700 font-mono text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-semibold tracking-wider">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Taiwan Election 2024"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 p-3 rounded-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-zinc-700 font-mono text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={adding}
                  className="h-[46px] px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {adding ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {adding ? "INITIALIZING..." : "ACTIVATE"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Market Grid */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              LIVE FEEDS
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              {markets.length} STREAMS ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <div
                key={market.asset_id}
                className="group bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 p-5 rounded-xl transition-all hover:bg-zinc-900/50 relative overflow-hidden"
              >
                {/* Status Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">Live</span>
                </div>

                <h3 className="text-lg font-bold text-zinc-100 pr-16 truncate">{market.title}</h3>

                <div className="mt-4 space-y-3">
                  <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50 flex justify-between items-center group/id">
                    <code className="text-xs text-zinc-500 font-mono">
                      {truncateId(market.asset_id)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(market.asset_id)}
                      className="text-zinc-600 hover:text-emerald-500 transition-colors"
                      title="Copy ID"
                    >
                      {copiedId === market.asset_id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleDeleteMarket(market.asset_id)}
                    className="text-xs text-zinc-600 hover:text-red-400 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    TERMINATE
                  </button>
                </div>
              </div>
            ))}

            {markets.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-4">
                  <Activity className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-zinc-400 font-medium">No Active Targets</h3>
                <p className="text-zinc-600 text-sm mt-2">Deploy a new tracker to begin monitoring.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
