const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getStatus() {
  try {
    const res = await fetch(`${API_BASE}/`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch status:", error);
    return null;
  }
}

export async function getHealth() {
  try {
    const res = await fetch(`${API_BASE}/healthz`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch health:", error);
    return { ok: false };
  }
}

export async function getWallets() {
  try {
    const res = await fetch(`${API_BASE}/api/wallets`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch wallets:", error);
    return [];
  }
}

export async function getWalletDetail(address: string) {
  try {
    const res = await fetch(`${API_BASE}/api/wallet/${address}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch wallet detail:", error);
    return null;
  }
}

export async function getRecentTrades() {
  try {
    const res = await fetch(`${API_BASE}/api/trades/recent`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch recent trades:", error);
    return [];
  }
}

export async function getSummary() {
  try {
    const res = await fetch(`${API_BASE}/api/summary`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    return null;
  }
}

export async function getLeaderboard(limit: number = 100) {
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard?limit=${limit}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

// SmartMoney trades: get recent trades from top 100 leaderboard wallets
export type SmartMoneyTrade = {
  wallet: string;
  market: string;
  amount_usdc: number;
  side: string;
  timestamp: string;
  smartscore: number;
  insider_flag: boolean;
  entry_timing_score: number;
  // v2.1 metrics
  alpha_score?: number;
  confidence?: number; // percent
  strength?: number;   // 0..100
  risk_label?: 'Low' | 'Moderate' | 'High';
  target_roi?: number; // percent estimate
  // optional wallet fields
  win_rate?: number;  // 0..1
  avg_roi?: number;   // fraction
  volume?: number;
  trades_count?: number;
  rank?: number;
};

export async function getSmartMoneyTrades(limit: number = 50): Promise<SmartMoneyTrade[]> {
  try {
    const res = await fetch(`${API_BASE}/api/smartmoney?limit=${limit}`);
    const data = await res.json();
    // backend now includes enhanced metrics for v2.1
    return (Array.isArray(data) ? data : []).map((r: any) => ({
      wallet: r.wallet || "",
      market: r.market || "",
      amount_usdc: r.amount_usdc ?? 0,
      side: r.side,
      timestamp: r.timestamp,
      smartscore: r.smartscore ?? 0,
      insider_flag: !!r.insider_flag,
      entry_timing_score: r.entry_timing_score ?? 0,
      alpha_score: r.alpha_score,
      confidence: r.confidence,
      strength: r.strength,
      risk_label: r.risk_label,
      target_roi: r.target_roi,
      win_rate: r.win_rate,
      avg_roi: r.avg_roi,
      volume: r.volume,
      trades_count: r.trades_count,
      rank: r.rank,
    }));
  } catch (error) {
    console.error("Failed to fetch smart money trades:", error);
    return [];
  }
}

// Subscribe Telegram user (free or vip)
export async function subscribeTelegram(chatId: string, mode: 'free' | 'vip' = 'free') {
  try {
    const url = `${API_BASE}/api/subscribe_tg?chat_id=${encodeURIComponent(chatId)}&mode=${mode}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to subscribe telegram:', error);
    throw error;
  }
}
