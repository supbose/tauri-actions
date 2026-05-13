import * as fs from 'fs';
import * as path from 'path';
export function pad(n, length = 2) {
    return n.toString().padStart(length, '0');
}
export function ensureTrailingSlash(url) {
    if (!url)
        return url;
    return url.endsWith('/') ? url : `${url}/`;
}
export function joinUrl(...segments) {
    if (segments.length === 0)
        return '';
    const validSegments = segments.filter(s => s && s.trim() !== '');
    if (validSegments.length === 0)
        return '';
    let result = validSegments[0];
    if (result.length > 1 && result.endsWith('/')) {
        result = result.slice(0, -1);
    }
    for (let i = 1; i < validSegments.length; i++) {
        let segment = validSegments[i];
        segment = segment.replace(/^\/+/, '').replace(/\/+$/, '');
        if (segment) {
            result += '/' + segment;
        }
    }
    return result;
}
export function formatUrl(url) {
    if (!url)
        return url;
    const parts = url.split('://');
    if (parts.length === 2) {
        const protocol = parts[0];
        const rest = parts[1].replace(/\/{2,}/g, '/');
        return `${protocol}://${rest}`;
    }
    return url.replace(/\/{2,}/g, '/');
}
export function removeTrailingSlash(url) {
    if (!url)
        return url;
    return url.endsWith('/') ? url.slice(0, -1) : url;
}
export function formatDateTimeWithTimezone(date, timezone = 'Asia/Shanghai') {
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
    const year = partMap.get('year');
    const month = partMap.get('month');
    const day = partMap.get('day');
    let hour = partMap.get('hour');
    const minute = partMap.get('minute');
    const second = partMap.get('second');
    const ms = String(dateObj.getUTCMilliseconds()).padStart(3, '0');
    if (hour === '24') {
        hour = '00';
    }
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}Z`;
}
export function formatUTCDate(date) {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.toISOString();
}
export function getISOWithTimeZone(date, timeZone = 'Asia/Shanghai') {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    const formatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: timeZone,
        timeZoneName: 'longOffset'
    });
    const parts = formatter.formatToParts(dateObj);
    const partValues = {};
    parts.forEach(p => partValues[p.type] = p.value);
    const { year, month, day, hour, minute, second, timeZoneName } = partValues;
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
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function getLocalSignature(localUploadDir, fileName) {
    if (!localUploadDir || !fs.existsSync(localUploadDir)) {
        return '';
    }
    const sigFilePath = path.join(localUploadDir, fileName + '.sig');
    if (fs.existsSync(sigFilePath)) {
        const signature = fs.readFileSync(sigFilePath, 'utf-8').trim();
        console.log(`Loaded local signature for ${fileName}: ${signature.substring(0, 50)}...`);
        return signature;
    }
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
export function safeJsonParse(str, fallback) {
    try {
        return JSON.parse(str);
    }
    catch {
        return fallback;
    }
}
export function safeJsonStringify(obj, fallback = '', space) {
    try {
        return JSON.stringify(obj, null, space);
    }
    catch {
        return fallback;
    }
}
export function truncate(str, maxLength, suffix = '...') {
    if (!str || str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
}
export function isNotNullish(value) {
    return value !== null && value !== undefined;
}
export function getOSIdentifier() {
    const platform = process.platform;
    if (platform === 'win32') {
        return 'windows';
    }
    else if (platform === 'darwin') {
        return 'macos';
    }
    else {
        return 'linux';
    }
}
export function getSystemDirectory(baseDir) {
    const os = getOSIdentifier();
    return `${os}/${baseDir}`;
}
export function isEmpty(value) {
    return value == null || value.trim() === '';
}
export function randomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof Array)
        return obj.map(item => deepClone(item));
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}
export async function retry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
                await wait(delayMs);
            }
        }
    }
    throw lastError;
}
export function groupBy(array, keyFn) {
    return array.reduce((result, item) => {
        const key = keyFn(item);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
        return result;
    }, {});
}
export function debounce(fn, delayMs) {
    let timeoutId = null;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => fn(...args), delayMs);
    };
}
export function throttle(fn, delayMs) {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delayMs) {
            lastCall = now;
            fn(...args);
        }
    };
}
export function getDefaultTauriExtensions() {
    return [
        '.exe',
        '.msi',
        '.zip',
        '.dmg',
        '.pkg',
        '.app',
        '.deb',
        '.rpm',
        '.AppImage',
        '.tar.gz',
        '.tar.bz2',
        '.tar.xz',
        '.zip',
        '.7z',
        '.sig',
    ];
}
const TAURI_TARGET_OS_MAP = {
    'windows': 'windows',
    'macos': 'macos',
    'linux': 'linux',
    'ios': 'ios',
    'android': 'android',
    'wasm32': 'linux',
};
const OS_DISPLAY_NAMES = {
    'windows': 'Windows',
    'macos': 'macOS',
    'linux': 'Linux',
    'ios': 'iOS',
    'android': 'Android',
    'freebsd': 'FreeBSD',
    'openbsd': 'OpenBSD',
    'netbsd': 'NetBSD',
};
const TARGET_EXTENSIONS = {
    'windows': ['.exe', '.msi', '.zip'],
    'macos': ['.dmg', '.pkg', '.app', '.tar.gz'],
    'linux': ['.deb', '.rpm', '.AppImage', '.tar.gz', '.tar.bz2', '.tar.xz'],
    'ios': ['.ipa', '.app'],
    'android': ['.apk', '.aab'],
    'wasm32': ['.wasm', '.js'],
};
export function getTauriTargetFromExtension(extension) {
    const ext = extension.toLowerCase();
    for (const [target, extensions] of Object.entries(TARGET_EXTENSIONS)) {
        if (extensions.some(e => e.toLowerCase() === ext)) {
            return target;
        }
    }
    return null;
}
export function getOSFromTarget(target) {
    return TAURI_TARGET_OS_MAP[target] || 'linux';
}
export function isDesktopTarget(target) {
    return target === 'windows' || target === 'macos' || target === 'linux';
}
export function isMobileTarget(target) {
    return target === 'ios' || target === 'android';
}
export function isWebTarget(target) {
    return target === 'wasm32';
}
export function getTargetExtensions(target) {
    return [...(TARGET_EXTENSIONS[target] || [])];
}
export function getOSDisplayName(os) {
    return OS_DISPLAY_NAMES[os] || os;
}
export function getTargetDisplayName(target) {
    return getOSDisplayName(getOSFromTarget(target));
}
export function isValidTauriTarget(value) {
    const validTargets = ['windows', 'macos', 'linux', 'ios', 'android', 'wasm32'];
    return validTargets.includes(value);
}
export function isValidTauriOS(value) {
    const validOS = ['windows', 'macos', 'linux', 'ios', 'android', 'freebsd', 'openbsd', 'netbsd'];
    return validOS.includes(value);
}
export function matchesCurrentPlatform(target) {
    const currentOS = getOSIdentifier();
    const targetOS = getOSFromTarget(target);
    if (target === 'wasm32') {
        return true;
    }
    return currentOS === targetOS;
}
const OS_PATTERNS = {
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
export function autoDetectOS(filename) {
    if (!filename)
        return null;
    const lowerFilename = filename.toLowerCase();
    for (const [os, patterns] of Object.entries(OS_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(lowerFilename)) {
                return os;
            }
        }
    }
    return null;
}
export function autoDetectTarget(filename) {
    const os = autoDetectOS(filename);
    if (!os)
        return null;
    const osToTargetMap = {
        'windows': 'windows',
        'macos': 'macos',
        'linux': 'linux',
        'ios': 'ios',
        'android': 'android',
        'freebsd': 'linux',
        'openbsd': 'linux',
        'netbsd': 'linux',
    };
    return osToTargetMap[os] || null;
}
export function getAutoOS(filename) {
    if (filename) {
        const detected = autoDetectOS(filename);
        if (detected)
            return detected;
    }
    return getOSIdentifier();
}
export function getAutoTarget(filename) {
    if (filename) {
        const detected = autoDetectTarget(filename);
        if (detected)
            return detected;
    }
    return getOSIdentifier();
}
//# sourceMappingURL=utils.js.map