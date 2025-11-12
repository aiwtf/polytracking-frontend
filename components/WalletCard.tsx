interface WalletCardProps {
  data: {
    wallet: string;
    roi: number;
    volume: number;
    profit: number;
  };
}

export default function WalletCard({ data }: WalletCardProps) {
  const isAbnormal = Math.abs(data.roi) > 300;
  
  return (
    <div className="bg-slate-800 p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <p className="text-slate-400 text-sm mb-2 font-mono">{data.wallet}</p>
      <h2 className={`text-xl font-bold ${data.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
        ROI: {data.roi}%
      </h2>
      <p className="text-slate-300 mt-2">利潤: {data.profit.toFixed(2)} USDC</p>
      <p className="text-slate-300">投注量: {data.volume.toFixed(2)} USDC</p>
      {isAbnormal && (
        <div className="mt-3 px-3 py-1 bg-red-900/50 text-red-300 rounded-lg text-sm">
          ⚠️ 異常行為偵測
        </div>
      )}
    </div>
  );
}
