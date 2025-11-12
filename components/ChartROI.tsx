"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface ChartROIProps {
  wallets: Array<{
    wallet: string;
    roi: number;
    volume: number;
    profit: number;
  }>;
}

export default function ChartROI({ wallets }: ChartROIProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl">
      <h2 className="text-xl font-semibold mb-4 text-slate-100">📊 ROI 分布圖</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={wallets}>
          <XAxis 
            dataKey="wallet" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => value.substring(0, 6) + '...'}
          />
          <YAxis tick={{ fill: '#94a3b8' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #475569',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Bar dataKey="roi" radius={[8, 8, 0, 0]}>
            {wallets.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.roi > 0 ? '#4ade80' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
