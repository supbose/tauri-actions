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
export function formatDateTimeWithTimezone(date, timezone) {
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
export function formatUTCDate(date) {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.toISOString();
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
//# sourceMappingURL=utils.js.map