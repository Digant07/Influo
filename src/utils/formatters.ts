export function formatFollowers(count: number, decimals: number = 1): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(decimals) + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(decimals) + "K";
  }
  return count.toString();
}

export function formatEngagementRate(rate: number | undefined): string {
  if (rate === undefined) return "N/A";
  return (rate * 100).toFixed(2) + "%";
}

export function formatNumber(count: number): string {
  return count.toLocaleString();
}
