"use client";

interface Trade {
  timestamp: string;
  marketTitle: string;
  profit: number;
  outcome: string;
  amount: number;
}

interface ActivityTimelineProps {
  trades: Trade[];
}

export default function ActivityTimeline({ trades }: ActivityTimelineProps) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">🧾 最新下注活動</h2>
      <div className="space-y-3">
        {trades.map((trade, i) => (
          <div key={i} className="flex items-start gap-4 border-l-2 border-slate-700 pl-4 py-2 hover:border-blue-500 transition">
            <div className="flex-shrink-0 text-slate-500 text-xs mt-1">
              {new Date(trade.timestamp).toLocaleString('zh-TW', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate">
                {trade.marketTitle}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {trade.outcome} • {trade.amount.toFixed(2)} USDC
              </p>
            </div>
            <div className={`flex-shrink-0 font-semibold text-sm ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      {trades.length === 0 && (
        <p className="text-slate-400 text-center py-8">暫無交易記錄</p>
      )}
    </div>
  );
}
