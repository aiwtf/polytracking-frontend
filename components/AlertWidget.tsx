"use client";

import { useEffect, useState } from "react";

export default function AlertWidget({ onOpenWallet }: { onOpenWallet?: (wallet: string) => void }) {
  const [alerts, setAlerts] = useState<{ id: number; text: string }[]>([]);

  useEffect(() => {
    let idCounter = 0;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = base.replace('http', 'ws') + '/ws/alerts';
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (ev) => {
        const text = String(ev.data || '');
        idCounter += 1;
        const id = idCounter;
        setAlerts(prev => [{ id, text }, ...prev].slice(0, 3));
        setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 5000);
      };
    } catch {}
    return () => { try { ws?.close(); } catch { /* noop */ } };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 space-y-2">
      {alerts.map(a => (
        <div key={a.id} className="bg-indigo-900/90 border border-indigo-700 text-indigo-100 px-4 py-2 rounded shadow-lg">
          {a.text}
        </div>
      ))}
    </div>
  );
}
