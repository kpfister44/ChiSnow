// ABOUTME: Date and timestamp formatting utilities for user-friendly display
// ABOUTME: Provides relative time for recent measurements and formatted dates for older ones

/**
 * Formats a timestamp in a user-friendly way
 * - Shows relative time (e.g., "2 hours ago") for recent measurements (< 24 hours)
 * - Shows formatted date (e.g., "Jan 15, 2024 8:00 AM") for older measurements
 * - Includes timezone indication
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Use relative time for measurements less than 24 hours old
  if (diffHours < 24) {
    return formatRelativeTime(diffMs);
  }

  // Use formatted date for older measurements
  return formatFullDate(date);
}

/**
 * Formats time difference as relative time (e.g., "2 hours ago", "just now")
 */
function formatRelativeTime(diffMs: number): string {
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
}

/**
 * Formats date as full readable string with timezone
 * Example: "Jan 15, 2024 8:00 AM CST"
 */
function formatFullDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  };

  return date.toLocaleString('en-US', options);
}

/**
 * Gets just the relative time portion (for testing or display purposes)
 */
export function getRelativeTime(timestamp: string): string | null {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return formatRelativeTime(diffMs);
  }

  return null;
}
