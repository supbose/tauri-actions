/**
 * General utility functions
 * Common utilities used across the project
 */

/**
 * Pad a number with leading zeros
 * @param n - Number to pad
 * @param length - Desired string length (default: 2)
 * @returns Padded string
 */
export function pad(n: number, length: number = 2): string {
  return n.toString().padStart(length, '0');
}

/**
 * Ensure URL/path ends with trailing slash
 * @param url - URL or path to normalize
 * @returns Normalized URL/path
 */
export function ensureTrailingSlash(url: string): string {
  if (!url) return url;
  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Remove trailing slash from URL/path
 * @param url - URL or path to normalize
 * @returns Normalized URL/path
 */
export function removeTrailingSlash(url: string): string {
  if (!url) return url;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Format date/time with specified timezone to ISO 8601 format
 * @param date - Date object or timestamp
 * @param timezone - Timezone string (e.g., Asia/Shanghai, UTC)
 * @returns Formatted datetime string (e.g., 2024-01-15T10:30:00+08:00)
 */
export function formatDateTimeWithTimezone(date: Date | number, timezone: string): string {
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(dateObj);
  const partMap = new Map(parts.map(p => [p.type, p.value]));
  
  const year = partMap.get('year') || dateObj.getUTCFullYear().toString();
  const month = partMap.get('month') || pad(dateObj.getUTCMonth() + 1);
  const day = partMap.get('day') || pad(dateObj.getUTCDate());
  const hour = partMap.get('hour') || pad(dateObj.getUTCHours());
  const minute = partMap.get('minute') || pad(dateObj.getUTCMinutes());
  const second = partMap.get('second') || pad(dateObj.getUTCSeconds());
  
  const offsetDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
  const utcDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'UTC' }));
  const diffMs = offsetDate.getTime() - utcDate.getTime();
  const offsetMinutes = Math.round(diffMs / 60000);
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetMins = pad(Math.abs(offsetMinutes) % 60);
  
  return `${year}-${month}-${day}T${hour}:${minute}:${second}${offsetSign}${offsetHours}:${offsetMins}`;
}

/**
 * Format a date as ISO 8601 string in UTC
 * @param date - Date object or timestamp
 * @returns ISO 8601 string (e.g., 2024-01-15T10:30:00.000Z)
 */
export function formatUTCDate(date: Date | number): string {
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Wait for specified milliseconds
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after specified delay
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON, with fallback value
 * @param str - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T = any>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify JSON, with fallback
 * @param obj - Object to stringify
 * @param fallback - Fallback string if stringification fails
 * @param space - Indentation (default: undefined)
 * @returns JSON string or fallback
 */
export function safeJsonStringify(obj: any, fallback: string = '', space?: number | string): string {
  try {
    return JSON.stringify(obj, null, space);
  } catch {
    return fallback;
  }
}

/**
 * Truncate a string to specified length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: ...)
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Check if value is not null or undefined
 * @param value - Value to check
 * @returns True if value is not null and not undefined
 */
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Get the current operating system identifier
 * @returns OS identifier: 'windows', 'macos', or 'linux'
 */
export function getOSIdentifier(): 'windows' | 'macos' | 'linux' {
  const platform = process.platform;
  if (platform === 'win32') {
    return 'windows';
  } else if (platform === 'darwin') {
    return 'macos';
  } else {
    return 'linux';
  }
}

/**
 * Get the system directory prefix for FTP upload
 * @param baseDir - Base directory (e.g., 'download', 'updater')
 * @returns System-specific directory path (e.g., 'windows/download', 'macos/updater')
 */
export function getSystemDirectory(baseDir: string): string {
  const os = getOSIdentifier();
  return `${os}/${baseDir}`;
}

/**
 * Check if value is an empty string, null, or undefined
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: string | null | undefined): boolean {
  return value == null || value.trim() === '';
}

/**
 * Generate a random string
 * @param length - Length of string (default: 8)
 * @param chars - Character set (default: alphanumeric)
 * @returns Random string
 */
export function randomString(length: number = 8, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Retry an asynchronous function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param delayMs - Initial delay in ms (default: 1000)
 * @returns Promise with result
 */
export async function retry<T>(fn: () => Promise<T>, maxRetries: number = 3, delayMs: number = 1000): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await wait(delayMs);
      }
    }
  }
  
  throw lastError;
}

/**
 * Group array items by a key
 * @param array - Array to group
 * @param keyFn - Function to get grouping key
 * @returns Grouped object
 */
export function groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

/**
 * Create a debounced function
 * @param fn - Function to debounce
 * @param delayMs - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Create a throttled function
 * @param fn - Function to throttle
 * @param delayMs - Minimum delay between calls
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delayMs: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delayMs) {
      lastCall = now;
      fn(...args);
    }
  };
}
