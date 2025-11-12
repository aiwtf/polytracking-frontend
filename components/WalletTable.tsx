"use client";
import Link from "next/link";

interface Wallet {
  wallet: string;
  roi: number;
  profit: number;
  trades: number;
  volume: number;
  winRate?: number;
  smartscore?: number;
  insider?: boolean;
  hft?: boolean;
}

interface WalletTableProps {
  wallets: Wallet[];
}

export default function WalletTable({ wallets }: WalletTableProps) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 mt-6">
      <h2 className="text-lg font-semibold mb-3">💰 錢包排行榜</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="text-left py-2 px-2">排名</th>
              <th className="text-left py-2 px-2">地址</th>
              <th className="text-right py-2 px-2">ROI</th>
              <th className="text-right py-2 px-2">利潤</th>
              <th className="text-right py-2 px-2">交易數</th>
              <th className="text-right py-2 px-2">勝率</th>
              <th className="text-right py-2 px-2">Score</th>
              <th className="text-left py-2 px-2">Badges</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((w, i) => (
              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                <td className="py-3 px-2 text-slate-400">#{i + 1}</td>
                <td className="py-3 px-2">
                  <Link href={`/dashboard/${w.wallet}`}>
                    <span className="text-blue-400 hover:underline font-mono">
                      {w.wallet.slice(0, 8)}...{w.wallet.slice(-6)}
                    </span>
                  </Link>
                </td>
                <td className={`text-right py-3 px-2 font-semibold ${w.roi > 0 ? "text-green-400" : "text-red-400"}`}>
                  {w.roi > 0 ? "+" : ""}{w.roi.toFixed(2)}%
                </td>
                <td className="text-right py-3 px-2 text-slate-300">
                  {w.profit.toFixed(2)} USDC
                </td>
                <td className="text-right py-3 px-2 text-slate-300">
                  {w.trades}
                </td>
                <td className="text-right py-3 px-2 text-slate-300">
                  {(w.winRate || 0).toFixed(1)}%
                </td>
                <td className="text-right py-3 px-2 text-slate-300">
                  {typeof w.smartscore === 'number' ? w.smartscore.toFixed(1) : '-'}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2 justify-start">
                    {w.insider && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-900/60 text-red-300 border border-red-700/50">INSIDER</span>
                    )}
                    {w.hft && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-900/60 text-amber-300 border border-amber-700/50">HFT</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {wallets.length === 0 && (
        <p className="text-slate-400 text-center py-8">暫無錢包數據</p>
      )}
    </div>
  );
}
