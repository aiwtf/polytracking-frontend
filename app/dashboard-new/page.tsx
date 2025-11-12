'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, getSummary, getSmartMoneyTrades } from '@/lib/api/polymarket';

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  smartscore: number;
  reasons: any;
}

interface SmartMoneyTrade {
  wallet: string;
  market: string;
  amount_usdc: number;
  side: string;
  timestamp: string;
  smartscore: number;
  insider_flag: boolean;
  entry_timing_score: number;
}

interface SummaryData {
  roiHistory: Array<{ date: string; roi: number; trades: number }>;
  smartMoney: {
    count: number;
    avgScore: number;
    insiderCount: number;
    insiderRatio: number;
    avgEntryTiming: number;
  };
}

export default function DashboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [trades, setTrades] = useState<SmartMoneyTrade[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const [lbData, tradesData, summaryData] = await Promise.all([
        getLeaderboard(10),
        getSmartMoneyTrades(20),
        getSummary(),
      ]);
      setLeaderboard(lbData);
      setTrades(tradesData);
      setSummary(summaryData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">PolyTracking Dashboard</h1>
          <p className="text-gray-300">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-1">Smart Wallets</div>
              <div className="text-3xl font-bold text-white">{summary.smartMoney.count}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-1">Avg Score</div>
              <div className="text-3xl font-bold text-blue-400">
                {summary.smartMoney.avgScore.toFixed(1)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-1">Insider %</div>
              <div className="text-3xl font-bold text-red-400">
                {(summary.smartMoney.insiderRatio * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-1">Avg Entry Score</div>
              <div className="text-3xl font-bold text-green-400">
                {summary.smartMoney.avgEntryTiming.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 Leaderboard */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">🏆 Top 10 Smart Wallets</h2>
            <div className="space-y-3">
              {leaderboard.map((entry, idx) => {
                const isInsider = entry.reasons?.insider_flag === true;
                const entryScore = entry.reasons?.entry_timing_score || 0;
                return (
                  <div
                    key={entry.wallet}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-4 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-400 w-8">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="text-white font-mono text-sm">
                          {entry.wallet.slice(0, 10)}...{entry.wallet.slice(-6)}
                        </div>
                        <div className="flex gap-2 mt-1">
                          {isInsider && (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                              INSIDER
                            </span>
                          )}
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                            Entry: {entryScore.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-400">
                        {entry.smartscore.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">score</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Smart Money Trades */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">⚡ Recent Smart Trades</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {trades.map((trade, idx) => {
                const time = new Date(trade.timestamp);
                return (
                  <div
                    key={idx}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-white font-mono text-xs">
                        {trade.wallet.slice(0, 8)}...{trade.wallet.slice(-4)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {time.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-2 line-clamp-2">
                      {trade.market}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          trade.side.toLowerCase() === 'yes'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {trade.side} ${(trade.amount_usdc / 1000).toFixed(1)}K
                      </span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        Score: {trade.smartscore.toFixed(1)}
                      </span>
                      {trade.insider_flag && (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                          INSIDER
                        </span>
                      )}
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        Entry: {(trade.entry_timing_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Auto-refreshes every 60 seconds | SmartScore v2 Lite | Powered by PolyTracking</p>
        </div>
      </div>
    </div>
  );
}
