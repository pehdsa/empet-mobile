export function formatDistance(meters: number | string): string {
  const m = typeof meters === "string" ? parseFloat(meters) : meters;
  if (m < 1000) {
    return `${Math.round(m)} m`;
  }
  return `${(m / 1000).toFixed(1)} km`;
}
