export function formatTimeAgo(dateStrOrTimestamp?: string | number): string {
  if (!dateStrOrTimestamp) return 'Just now';
  
  if (typeof dateStrOrTimestamp === 'string') {
    if (dateStrOrTimestamp === 'Just now' || dateStrOrTimestamp.includes('ago')) {
      return dateStrOrTimestamp;
    }
  }

  const date = new Date(dateStrOrTimestamp);
  if (isNaN(date.getTime())) {
    return String(dateStrOrTimestamp);
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
