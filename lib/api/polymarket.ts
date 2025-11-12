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

// 未來可以新增更多 API，例如 /api/analysis
