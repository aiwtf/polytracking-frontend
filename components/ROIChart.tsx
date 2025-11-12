"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ROIDataPoint {
  date: string;
  roi: number;
}

interface ROIChartProps {
  data: ROIDataPoint[];
}

export default function ROIChart({ data }: ROIChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 mt-6">
        <h2 className="text-lg font-semibold mb-3">📈 ROI 趨勢圖</h2>
        <p className="text-slate-400 text-center py-8">暫無趨勢數據</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 mt-6">
      <h2 className="text-lg font-semibold mb-3">📈 ROI 趨勢圖</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            stroke="#475569"
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            stroke="#475569"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'ROI']}
          />
          <Line 
            type="monotone" 
            dataKey="roi" 
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
