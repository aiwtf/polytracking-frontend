/**
 * 格式化錢包地址
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * 格式化數字（加千分位）
 */
export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * 格式化貨幣
 */
export function formatCurrency(amount: number, currency = 'USDC'): string {
  return `${formatNumber(amount)} ${currency}`;
}

/**
 * 格式化時間
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 格式化相對時間
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date().getTime();
  const then = new Date(date).getTime();
  const diff = now - then;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  if (hours < 24) return `${hours} 小時前`;
  return `${days} 天前`;
}
