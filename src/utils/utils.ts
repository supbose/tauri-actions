/**
 * General utility functions
 * Common utilities used across the project
 */

import * as fs from 'fs';
import * as path from 'path';

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
 * Join multiple URL segments into a properly formatted URL
 * Handles trailing/leading slashes to avoid double slashes
 * @param segments - URL segments to join
 * @returns Formatted URL with proper slashes
 * 
 * @example
 * joinUrl('https://cdn.example.com/', 'download', 'windows', 'v1.0.0', 'app.exe')
 * // Returns: 'https://cdn.example.com/download/windows/v1.0.0/app.exe'
 * 
 * @example
 * joinUrl('https://cdn.com/', '/download/', '/windows/')
 * // Returns: 'https://cdn.com/download/windows/'
 */
export function joinUrl(...segments: string[]): string {
  if (segments.length === 0) return '';
  
  // Filter out empty segments
  const validSegments = segments.filter(s => s && s.trim() !== '');
  
  if (validSegments.length === 0) return '';
  
  // Handle the first segment (may be a full URL with protocol)
  let result = validSegments[0];
  
  // Remove trailing slash from first segment (unless it's just "/" or a protocol-only URL)
  if (result.length > 1 && result.endsWith('/')) {
    result = result.slice(0, -1);
  }
  
  // Process remaining segments
  for (let i = 1; i < validSegments.length; i++) {
    let segment = validSegments[i];
    
    // Remove leading and trailing slashes from current segment
    segment = segment.replace(/^\/+/, '').replace(/\/+$/, '');
    
    if (segment) {
      result += '/' + segment;
    }
  }
  
  return result;
}

/**
 * Format and normalize a URL path
 * Ensures proper slashes and removes duplicates
 * @param url - URL to format
 * @returns Normalized URL
 * 
 * @example
 * formatUrl('https://cdn.example.com//download//windows/v1.0.0//')
 * // Returns: 'https://cdn.example.com/download/windows/v1.0.0/'
 */
export function formatUrl(url: string): string {
  if (!url) return url;
  
  // Replace multiple consecutive slashes with single slash
  // But preserve the double slash in protocol (e.g., https://)
  const parts = url.split('://');
  if (parts.length === 2) {
    const protocol = parts[0];
    const rest = parts[1].replace(/\/{2,}/g, '/');
    return `${protocol}://${rest}`;
  }
  
  return url.replace(/\/{2,}/g, '/');
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
 * Format a date as ISO 8601 UTC string with milliseconds
 * @param date - Date object or timestamp
 * @param timezone - Timezone string (e.g., Asia/Shanghai, UTC)
 * @returns Formatted datetime string (e.g., 2026-05-13T16:03:06.555Z)
 */
export function formatDateTimeWithTimezone(date: Date | number, timezone: string = 'Asia/Shanghai'): string {
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
  
  const year = partMap.get('year')!;
  const month = partMap.get('month')!;
  const day = partMap.get('day')!;
  let hour = partMap.get('hour')!;
  const minute = partMap.get('minute')!;
  const second = partMap.get('second')!;
  const ms = String(dateObj.getUTCMilliseconds()).padStart(3, '0');

  if (hour === '24') {
    hour = '00';
  }

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}Z`;
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
 * Get ISO 8601 string with timezone offset
 * @param date - Date object or timestamp
 * @param timeZone - Timezone string (e.g., Asia/Shanghai, UTC)
 * @returns ISO 8601 string with timezone offset (e.g., 2026-05-13T16:03:06.555+08:00)
 */
export function getISOWithTimeZone(date: Date | number,timeZone: string = 'Asia/Shanghai') : string {
  const dateObj = typeof date === 'number' ? new Date(date) : date;

  // 使用 Intl.DateTimeFormat 获取指定时区的各个时间部分
  const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA 语言环境默认使用 YYYY-MM-DD 格式
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timeZone,
    timeZoneName: 'longOffset' // 获取如 "GMT+8" 或 "GMT" 的时区名称
  });

  const parts = formatter.formatToParts(dateObj);
  const partValues = {};
  parts.forEach(p => (partValues as any)[p.type] = p.value);

  // 提取并拼接成 ISO 格式
  const { year, month, day, hour, minute, second, timeZoneName } = partValues as any;

  // 将 "GMT+8" 或 "GMT-5" 等格式转换为标准的 "+08:00" 或 "-05:00"
  let offset = 'Z';
  if (timeZoneName !== 'GMT') {
    const match = timeZoneName.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (match) {
      const sign = match[1];
      const hours = match[2].padStart(2, '0');
      const minutes = match[3] || '00';
      offset = `${sign}${hours}:${minutes}`;
    }
  }

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
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
 * Get local signature for a file from local directory
 * @param localUploadDir - Local directory containing signature files
 * @param fileName - File name to find signature for
 * @returns Signature content or empty string
 */
export function getLocalSignature(localUploadDir: string | undefined, fileName: string): string {
  if (!localUploadDir || !fs.existsSync(localUploadDir)) {
    return '';
  }

  const sigFilePath = path.join(localUploadDir, fileName + '.sig');
  
  // 优先精确匹配
  if (fs.existsSync(sigFilePath)) {
    const signature = fs.readFileSync(sigFilePath, 'utf-8').trim();
    console.log(`Loaded local signature for ${fileName}: ${signature.substring(0, 50)}...`);
    return signature;
  }
  
  // 精确匹配没找到，尝试查找任意 .sig 文件
  const allSigFiles = fs.readdirSync(localUploadDir).filter(f => f.toLowerCase().endsWith('.sig'));
  if (allSigFiles.length > 0) {
    const fallbackSigFile = path.join(localUploadDir, allSigFiles[0]);
    const signature = fs.readFileSync(fallbackSigFile, 'utf-8').trim();
    console.log(`No exact signature found for ${fileName}, using fallback: ${allSigFiles[0]}`);
    return signature;
  }
  
  console.log(`No local signature found for ${fileName}: ${sigFilePath}`);
  return '';
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

/**
 * Get default Tauri-supported file extensions for all platforms
 * @returns Array of default file extensions
 */
export function getDefaultTauriExtensions(): string[] {
  return [
    // Windows
    '.exe',      // Windows installer
    '.msi',      // Windows installer
    '.zip',      // Windows portable
    // macOS
    '.dmg',      // macOS disk image
    '.pkg',      // macOS installer
    '.app',      // macOS application bundle
    // Linux
    '.deb',      // Debian/Ubuntu
    '.rpm',      // Red Hat/Fedora
    '.AppImage', // Portable Linux
    '.tar.gz',   // Linux archive
    '.tar.bz2',  // Linux archive
    '.tar.xz',   // Linux archive
    // Cross-platform
    '.zip',      // Cross-platform archive
    '.7z',       // Cross-platform archive
    '.sig',      // Signature file
  ];
}

/**
 * Tauri supported target platforms
 */
export type TauriTarget = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'wasm32';

/**
 * Tauri supported OS platforms
 */
export type TauriOS = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'freebsd' | 'openbsd' | 'netbsd';

/**
 * Platform mapping from Tauri target to OS identifier
 */
const TAURI_TARGET_OS_MAP: Record<TauriTarget, TauriOS> = {
  'windows': 'windows',
  'macos': 'macos',
  'linux': 'linux',
  'ios': 'ios',
  'android': 'android',
  'wasm32': 'linux', // WebAssembly targets inherit from host Linux environment
};

/**
 * OS display names
 */
const OS_DISPLAY_NAMES: Record<TauriOS, string> = {
  'windows': 'Windows',
  'macos': 'macOS',
  'linux': 'Linux',
  'ios': 'iOS',
  'android': 'Android',
  'freebsd': 'FreeBSD',
  'openbsd': 'OpenBSD',
  'netbsd': 'NetBSD',
};

/**
 * Target file extensions mapping
 */
const TARGET_EXTENSIONS: Record<TauriTarget, string[]> = {
  'windows': ['.exe', '.msi', '.zip'],
  'macos': ['.dmg', '.pkg', '.app', '.tar.gz'],
  'linux': ['.deb', '.rpm', '.AppImage', '.tar.gz', '.tar.bz2', '.tar.xz'],
  'ios': ['.ipa', '.app'],
  'android': ['.apk', '.aab'],
  'wasm32': ['.wasm', '.js'],
};

/**
 * Get Tauri target from file extension
 * @param extension - File extension (e.g., '.exe', '.dmg', '.deb')
 * @returns Tauri target or null if unknown
 */
export function getTauriTargetFromExtension(extension: string): TauriTarget | null {
  const ext = extension.toLowerCase();
  
  for (const [target, extensions] of Object.entries(TARGET_EXTENSIONS)) {
    if (extensions.some(e => e.toLowerCase() === ext)) {
      return target as TauriTarget;
    }
  }
  
  return null;
}

/**
 * Get OS from Tauri target
 * @param target - Tauri target platform
 * @returns Corresponding OS platform
 */
export function getOSFromTarget(target: TauriTarget): TauriOS {
  return TAURI_TARGET_OS_MAP[target] || 'linux';
}

/**
 * Check if a Tauri target is a desktop platform
 * @param target - Tauri target
 * @returns True if desktop platform (windows/macos/linux)
 */
export function isDesktopTarget(target: TauriTarget): boolean {
  return target === 'windows' || target === 'macos' || target === 'linux';
}

/**
 * Check if a Tauri target is a mobile platform
 * @param target - Tauri target
 * @returns True if mobile platform (ios/android)
 */
export function isMobileTarget(target: TauriTarget): boolean {
  return target === 'ios' || target === 'android';
}

/**
 * Check if a Tauri target is a web platform
 * @param target - Tauri target
 * @returns True if web platform (wasm32)
 */
export function isWebTarget(target: TauriTarget): boolean {
  return target === 'wasm32';
}

/**
 * Get supported file extensions for a Tauri target
 * @param target - Tauri target platform
 * @returns Array of file extensions
 */
export function getTargetExtensions(target: TauriTarget): string[] {
  return [...(TARGET_EXTENSIONS[target] || [])];
}

/**
 * Get display name for an OS
 * @param os - OS platform
 * @returns Human-readable display name
 */
export function getOSDisplayName(os: TauriOS): string {
  return OS_DISPLAY_NAMES[os] || os;
}

/**
 * Get display name for a Tauri target
 * @param target - Tauri target platform
 * @returns Human-readable display name
 */
export function getTargetDisplayName(target: TauriTarget): string {
  return getOSDisplayName(getOSFromTarget(target));
}

/**
 * Validate if a string is a valid Tauri target
 * @param value - Value to check
 * @returns True if valid Tauri target
 */
export function isValidTauriTarget(value: string): value is TauriTarget {
  const validTargets: TauriTarget[] = ['windows', 'macos', 'linux', 'ios', 'android', 'wasm32'];
  return validTargets.includes(value as TauriTarget);
}

/**
 * Validate if a string is a valid Tauri OS
 * @param value - Value to check
 * @returns True if valid Tauri OS
 */
export function isValidTauriOS(value: string): value is TauriOS {
  const validOS: TauriOS[] = ['windows', 'macos', 'linux', 'ios', 'android', 'freebsd', 'openbsd', 'netbsd'];
  return validOS.includes(value as TauriOS);
}

/**
 * Check if current platform matches the target
 * @param target - Tauri target to check against
 * @returns True if current OS matches the target
 */
export function matchesCurrentPlatform(target: TauriTarget): boolean {
  const currentOS = getOSIdentifier();
  const targetOS = getOSFromTarget(target);
  
  // Special case for wasm32 - matches any platform since it runs in browser
  if (target === 'wasm32') {
    return true;
  }
  
  return currentOS === targetOS;
}

/**
 * OS detection patterns for filename/path matching
 */
const OS_PATTERNS: Record<string, RegExp[]> = {
  'windows': [
    /[-_]win(?:dows)?[-_]/i,
    /[-_]x64[-_]/i,
    /[-_]x86[-_]/i,
    /\.exe$/i,
    /\.msi$/i,
    /\bwin32\b/i,
    /\bwindows\b/i,
  ],
  'macos': [
    /[-_]mac(?:os)?[-_]/i,
    /[-_]darwin[-_]/i,
    /[-_]aarch64[-_]/i,
    /\.dmg$/i,
    /\.pkg$/i,
    /\.app$/i,
    /\bmacos\b/i,
    /\bapple\b/i,
  ],
  'linux': [
    /[-_]linux[-_]/i,
    /[-_]ubuntu[-_]/i,
    /[-_]debian[-_]/i,
    /[-_]fedora[-_]/i,
    /\.deb$/i,
    /\.rpm$/i,
    /\.AppImage$/i,
    /\.tar\.(?:gz|bz2|xz)$/i,
    /\blinux-gnu\b/i,
    /\blinux-musl\b/i,
  ],
  'ios': [
    /[-_]ios[-_]/i,
    /\biphone\b/i,
    /\bipad\b/i,
    /\.ipa$/i,
    /\.app$/i,
    /-ios-/i,
  ],
  'android': [
    /[-_]android[-_]/i,
    /[-_]arm(?:64)?[-_]/i,
    /\.apk$/i,
    /\.aab$/i,
    /-android-/i,
  ],
};

/**
 * Auto-detect OS platform from filename or file path
 * @param filename - Filename or path to analyze
 * @returns Detected OS platform or null if unknown
 * 
 * @example
 * autoDetectOS('myapp-v1.0.0-windows-x64.exe') // returns 'windows'
 * autoDetectOS('myapp-v1.0.0-macos.dmg')      // returns 'macos'
 * autoDetectOS('myapp-v1.0.0-linux.AppImage')  // returns 'linux'
 */
export function autoDetectOS(filename: string): TauriOS | null {
  if (!filename) return null;
  
  const lowerFilename = filename.toLowerCase();
  
  // Check patterns for each OS
  for (const [os, patterns] of Object.entries(OS_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerFilename)) {
        return os as TauriOS;
      }
    }
  }
  
  return null;
}

/**
 * Auto-detect Tauri target from filename or file path
 * @param filename - Filename or path to analyze
 * @returns Detected Tauri target or null if unknown
 * 
 * @example
 * autoDetectTarget('myapp-v1.0.0-windows-x64.exe') // returns 'windows'
 * autoDetectTarget('myapp-v1.0.0-macos.dmg')        // returns 'macos'
 * autoDetectTarget('myapp-v1.0.0-linux.tar.gz')     // returns 'linux'
 */
export function autoDetectTarget(filename: string): TauriTarget | null {
  const os = autoDetectOS(filename);
  if (!os) return null;
  
  // Map OS to default target (some OS map directly to targets)
  const osToTargetMap: Record<TauriOS, TauriTarget | null> = {
    'windows': 'windows',
    'macos': 'macos',
    'linux': 'linux',
    'ios': 'ios',
    'android': 'android',
    'freebsd': 'linux',  // Treat as Linux
    'openbsd': 'linux',  // Treat as Linux
    'netbsd': 'linux',   // Treat as Linux
  };
  
  return osToTargetMap[os] || null;
}

/**
 * Get auto-detected OS with fallback to current system OS
 * @param filename - Filename or path to analyze (optional)
 * @returns Detected OS or current system OS
 */
export function getAutoOS(filename?: string): TauriOS {
  if (filename) {
    const detected = autoDetectOS(filename);
    if (detected) return detected;
  }
  
  // Fallback to current system OS
  return getOSIdentifier() as TauriOS;
}

/**
 * Get auto-detected target with fallback to current system target
 * @param filename - Filename or path to analyze (optional)
 * @returns Detected target or current system target
 */
export function getAutoTarget(filename?: string): TauriTarget | null {
  if (filename) {
    const detected = autoDetectTarget(filename);
    if (detected) return detected;
  }
  
  // Fallback to current system target based on OS
  return getOSIdentifier() as TauriTarget;
}
