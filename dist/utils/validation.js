export function isValidUrl(url) {
    if (!url)
        return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch {
        return false;
    }
}
export function isValidPath(path) {
    if (!path)
        return false;
    const dangerousPatterns = [/\.\./g, /[<>:"|?*]/g, /\0/g];
    return !dangerousPatterns.some(pattern => pattern.test(path));
}
export function isValidVersion(version) {
    if (!version)
        return false;
    return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(version);
}
export function isValidTimezone(timezone) {
    if (!timezone)
        return false;
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    }
    catch {
        return false;
    }
}
export function isValidFtpHost(host) {
    if (!host)
        return false;
    const hostPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return hostPattern.test(host);
}
export function validateInputs(inputs) {
    const errors = [];
    const warnings = [];
    if (!inputs.sourceDir) {
        warnings.push('source-dir is empty, using default');
    }
    else if (!isValidPath(inputs.sourceDir)) {
        errors.push('source-dir contains invalid characters or path traversal');
    }
    if (!inputs.targetRoot) {
        warnings.push('target-root is empty, using default');
    }
    else if (!isValidPath(inputs.targetRoot)) {
        errors.push('target-root contains invalid characters or path traversal');
    }
    if (!inputs.configFile) {
        warnings.push('config-file is empty, using default');
    }
    else if (!isValidPath(inputs.configFile)) {
        errors.push('config-file contains invalid characters or path traversal');
    }
    const validFtpModes = ['disabled', 'ci', 'use'];
    if (!validFtpModes.includes(inputs.enableFtp)) {
        errors.push(`enable-ftp must be one of: ${validFtpModes.join(', ')}`);
    }
    if (inputs.enableFtp === 'use') {
        if (!inputs.ftpHost) {
            errors.push('ftp-host is required when enable-ftp is "use"');
        }
        else if (!isValidFtpHost(inputs.ftpHost)) {
            errors.push('ftp-host format is invalid');
        }
        if (!inputs.ftpUsername) {
            errors.push('ftp-username is required when enable-ftp is "use"');
        }
        if (!inputs.ftpPassword) {
            warnings.push('ftp-password is empty, FTP upload may fail');
        }
    }
    if (inputs.ftpServerDir && !isValidPath(inputs.ftpServerDir)) {
        errors.push('ftp-server-dir contains invalid characters');
    }
    const validUploadModes = ['disabled', 'ci', 'use'];
    if (!validUploadModes.includes(inputs.uploadLatest)) {
        errors.push(`upload-latest must be one of: ${validUploadModes.join(', ')}`);
    }
    if (inputs.uploadLatest === 'use' && !inputs.githubToken) {
        warnings.push('github-token is recommended when upload-latest is "use"');
    }
    if (!inputs.cdnBaseUrl) {
        warnings.push('cdn-base-url is empty, using default');
    }
    else if (!isValidUrl(inputs.cdnBaseUrl)) {
        errors.push('cdn-base-url must be a valid HTTP/HTTPS URL');
    }
    else if (!inputs.cdnBaseUrl.endsWith('/')) {
        warnings.push('cdn-base-url should end with "/"');
    }
    if (!inputs.timezone) {
        warnings.push('timezone is empty, using default (Asia/Shanghai)');
    }
    else if (!isValidTimezone(inputs.timezone)) {
        errors.push(`timezone "${inputs.timezone}" is not a valid IANA timezone`);
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
export function sanitizeLogMessage(message, sensitiveKeys = ['password', 'token', 'secret', 'key']) {
    let sanitized = message;
    for (const key of sensitiveKeys) {
        const pattern = new RegExp(`(${key}[=:]\\s*)([^\\s,}]+)`, 'gi');
        sanitized = sanitized.replace(pattern, '$1[HIDDEN]');
    }
    return sanitized;
}
export function createActionError(message, code, details) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
}
//# sourceMappingURL=validation.js.map