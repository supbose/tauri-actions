/**
 * Input validation utilities
 * Provides strict validation for action inputs
 */

import { ActionInputs, ValidationResult } from '../types';

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate path format (no dangerous characters)
 * @param path - Path to validate
 * @returns True if valid path
 */
export function isValidPath(path: string): boolean {
  if (!path) return false;
  
  // Check for path traversal
  if (path.includes('..')) {
    return false;
  }
  
  // Check for null bytes
  if (path.includes('\0')) {
    return false;
  }
  
  // Check for dangerous characters (excluding : which is needed for Windows paths)
  // Allow : only if it's part of a Windows drive letter (e.g., C:)
  const dangerousPatterns = [/[<>"|?*]/g];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(path)) {
      return false;
    }
  }
  
  // Special handling for : - only allow it as part of Windows drive letter (e.g., C:)
  const colonMatches = path.match(/:/g);
  if (colonMatches && colonMatches.length > 0) {
    // If there's a colon, it should be at position 1 (like C:) or not exist at all
    // For Windows paths like C:\path or C:/path
    if (!/^[A-Za-z]:[\\/]/.test(path)) {
      // Colon exists but not as a drive letter
      return false;
    }
  }
  
  return true;
}

/**
 * Validate version format (semver)
 * @param version - Version string to validate
 * @returns True if valid semver format
 */
export function isValidVersion(version: string): boolean {
  if (!version) return false;
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(version);
}

/**
 * Validate timezone string
 * @param timezone - Timezone to validate
 * @returns True if valid IANA timezone
 */
export function isValidTimezone(timezone: string): boolean {
  if (!timezone) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate FTP host format
 * @param host - Host to validate
 * @returns True if valid host
 */
export function isValidFtpHost(host: string): boolean {
  if (!host) return false;
  const hostPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return hostPattern.test(host);
}

/**
 * Validate action inputs
 * @param inputs - Action inputs to validate
 * @returns Validation result with errors and warnings
 */
export function validateInputs(inputs: ActionInputs): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!inputs.sourceDir) {
    warnings.push('source-dir is empty, using default');
  } else if (!isValidPath(inputs.sourceDir)) {
    errors.push('source-dir contains invalid characters or path traversal');
  }

  if (!inputs.targetRoot) {
    warnings.push('target-root is empty, using default');
  } else if (!isValidPath(inputs.targetRoot)) {
    errors.push('target-root contains invalid characters or path traversal');
  }

  if (!inputs.configFile) {
    warnings.push('config-file is empty, using default');
  } else if (!isValidPath(inputs.configFile)) {
    errors.push('config-file contains invalid characters or path traversal');
  }

  if (inputs.filterByVersion !== undefined && typeof inputs.filterByVersion !== 'boolean') {
    errors.push('filter-by-version must be a boolean value');
  }

  const validFtpModes = ['disabled', 'ci', 'use'];
  if (!validFtpModes.includes(inputs.enableFtp)) {
    errors.push(`enable-ftp must be one of: ${validFtpModes.join(', ')}`);
  }

  if (inputs.enableFtp === 'use') {
    if (!inputs.ftpHost) {
      errors.push('ftp-host is required when enable-ftp is "use"');
    } else if (!isValidFtpHost(inputs.ftpHost)) {
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
  } else if (!isValidUrl(inputs.cdnBaseUrl)) {
    errors.push('cdn-base-url must be a valid HTTP/HTTPS URL');
  } else if (!inputs.cdnBaseUrl.endsWith('/')) {
    warnings.push('cdn-base-url should end with "/"');
  }

  if (!inputs.timezone) {
    warnings.push('timezone is empty, using default (Asia/Shanghai)');
  } else if (!isValidTimezone(inputs.timezone)) {
    errors.push(`timezone "${inputs.timezone}" is not a valid IANA timezone`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitize log message to remove sensitive information
 * @param message - Message to sanitize
 * @param sensitiveKeys - Keys that contain sensitive data
 * @returns Sanitized message
 */
export function sanitizeLogMessage(message: string, sensitiveKeys: string[] = ['password', 'token', 'secret', 'key']): string {
  let sanitized = message;
  
  for (const key of sensitiveKeys) {
    const pattern = new RegExp(`(${key}[=:]\\s*)([^\\s,}]+)`, 'gi');
    sanitized = sanitized.replace(pattern, '$1[HIDDEN]');
  }
  
  return sanitized;
}

/**
 * Create error with additional context
 * @param message - Error message
 * @param code - Error code
 * @param details - Additional details
 * @returns Error object
 */
export function createActionError(message: string, code?: string, details?: any): Error {
  const error = new Error(message);
  (error as any).code = code;
  (error as any).details = details;
  return error;
}
