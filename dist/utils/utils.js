export function pad(n, length = 2) {
    return n.toString().padStart(length, '0');
}
export function ensureTrailingSlash(url) {
    if (!url)
        return url;
    return url.endsWith('/') ? url : `${url}/`;
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
//# sourceMappingURL=utils.js.map