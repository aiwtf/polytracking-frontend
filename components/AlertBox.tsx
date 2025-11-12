interface AlertBoxProps {
  healthy: boolean;
}

export default function AlertBox({ healthy }: AlertBoxProps) {
  return (
    <div
      className={`p-4 rounded-xl font-medium ${
        healthy 
          ? "bg-green-900/30 text-green-300 border border-green-700" 
          : "bg-red-900/30 text-red-300 border border-red-700"
      }`}
    >
      {healthy ? "✅ 系統運行正常" : "⚠️ 後端暫時無回應"}
    </div>
  );
}
