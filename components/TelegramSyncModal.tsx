"use client";

import { useState } from "react";
import { subscribeTelegram } from "@/lib/api/polymarket";

export default function TelegramSyncModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [chatId, setChatId] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  if (!open) return null;

  const submit = async () => {
    try {
      await subscribeTelegram(chatId, 'free');
      setStatus('success');
      setTimeout(onClose, 1000);
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-white text-lg font-semibold mb-2">立即訂閱信號通知</h3>
        <p className="text-slate-400 text-sm mb-4">輸入你的 Telegram chat_id（用 @userinfobot 取得）。</p>
        <input
          value={chatId}
          onChange={e=>setChatId(e.target.value)}
          placeholder="123456789"
          className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-white/10 focus:outline-none"
        />
        <div className="flex gap-2 mt-4">
          <button onClick={submit} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded">綁定 Free（延遲5分鐘）</button>
          <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded">取消</button>
        </div>
        {status==='success' && <div className="text-green-400 text-sm mt-3">已綁定成功！</div>}
        {status==='error' && <div className="text-red-400 text-sm mt-3">綁定失敗，請稍後重試。</div>}
      </div>
    </div>
  );
}
