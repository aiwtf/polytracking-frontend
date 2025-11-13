// MVP API client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://polytracking-backend-tv7j.onrender.com";

export async function getLeaderboard(limit: number = 100) {
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard?limit=${limit}`);
    return await res.json();
  } catch (e) {
    console.error('leaderboard error', e); return [];
  }
}

export async function getSmartMoneyTrades(limit: number = 50) {
  try {
    const res = await fetch(`${API_BASE}/api/smartmoney?limit=${limit}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) { console.error('smartmoney error', e); return []; }
}

export async function getWalletDetail(address: string) {
  try {
    const res = await fetch(`${API_BASE}/api/wallet/${address}`);
    return await res.json();
  } catch (e) { console.error('wallet error', e); return null; }
}

export async function getRecentTrades(limit: number = 50) {
  try {
    const res = await fetch(`${API_BASE}/api/trades/recent?limit=${limit}`);
    return await res.json();
  } catch (e) { console.error('recent trades error', e); return []; }
}

export { API_BASE };
