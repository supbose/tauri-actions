import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  isValidUrl,
  isValidPath,
  isValidVersion,
  isValidTimezone,
  isValidFtpHost,
  validateInputs,
  sanitizeLogMessage,
  createActionError
} from '../src/utils/validation';
import { ActionInputs } from '../src/types';

describe('Validation Module Tests', () => {
  describe('isValidUrl', () => {
    it('should validate correct HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
    });

    it('should validate correct HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
      expect(isValidUrl('https://cdn.example.com/')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });
  });

  describe('isValidPath', () => {
    it('should validate correct paths', () => {
      expect(isValidPath('/path/to/dir')).toBe(true);
      expect(isValidPath('relative/path')).toBe(true);
      expect(isValidPath('path/to/dir')).toBe(true);
      expect(isValidPath('./local/path')).toBe(true);
      expect(isValidPath('C:/Windows/System32')).toBe(true);
      expect(isValidPath('C:\\Windows\\System32')).toBe(true);
      expect(isValidPath('D:/projects/my-app')).toBe(true);
      expect(isValidPath('D:\\a\\tarui-updaer\\tarui-updaer/src-tauri/target/release/bundle/')).toBe(true);
    });

    it('should reject paths with dangerous characters', () => {
      expect(isValidPath('/path/../etc/passwd')).toBe(false);
      expect(isValidPath('path/..//etc/passwd')).toBe(false);
      expect(isValidPath('path/with<special>chars')).toBe(false);
      expect(isValidPath('path/with:colon')).toBe(false);
      expect(isValidPath('path/with|pipe')).toBe(false);
      expect(isValidPath('path/with?mark')).toBe(false);
      expect(isValidPath('path/with*star')).toBe(false);
    });

    it('should reject empty paths', () => {
      expect(isValidPath('')).toBe(false);
    });
  });

  describe('isValidVersion', () => {
    it('should validate semver versions', () => {
      expect(isValidVersion('1.0.0')).toBe(true);
      expect(isValidVersion('1.2.3')).toBe(true);
      expect(isValidVersion('10.20.30')).toBe(true);
      expect(isValidVersion('1.0.0-alpha')).toBe(true);
      expect(isValidVersion('1.0.0+build123')).toBe(true);
      expect(isValidVersion('1.0.0-alpha+build123')).toBe(true);
    });

    it('should reject invalid versions', () => {
      expect(isValidVersion('')).toBe(false);
      expect(isValidVersion('1.0')).toBe(false);
      expect(isValidVersion('v1.0.0')).toBe(false);
      expect(isValidVersion('1.0.0.0')).toBe(false);
      expect(isValidVersion('invalid')).toBe(false);
    });
  });

  describe('isValidTimezone', () => {
    it('should validate valid IANA timezones', () => {
      expect(isValidTimezone('UTC')).toBe(true);
      expect(isValidTimezone('Asia/Shanghai')).toBe(true);
      expect(isValidTimezone('America/New_York')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
      expect(isValidTimezone('Asia/Tokyo')).toBe(true);
    });

    it('should reject invalid timezones', () => {
      expect(isValidTimezone('')).toBe(false);
      expect(isValidTimezone('Invalid/Timezone')).toBe(false);
      expect(isValidTimezone('EST')).toBe(true); // EST is accepted by Intl
    });
  });

  describe('isValidFtpHost', () => {
    it('should validate correct FTP hosts', () => {
      expect(isValidFtpHost('ftp.example.com')).toBe(true);
      expect(isValidFtpHost('example.com')).toBe(true);
      expect(isValidFtpHost('sub.domain.example.com')).toBe(true);
      expect(isValidFtpHost('ftp-server')).toBe(true);
    });

    it('should reject invalid FTP hosts', () => {
      expect(isValidFtpHost('')).toBe(false);
      expect(isValidFtpHost('-invalid.com')).toBe(false);
      expect(isValidFtpHost('invalid-.com')).toBe(false);
    });
  });

  describe('validateInputs', () => {
    let validInputs: ActionInputs;

    beforeEach(() => {
      validInputs = {
        sourceDir: 'src-tauri/target/release/bundle/',
        targetRoot: 'src-tauri/target/release/fabu/',
        configFile: 'src-tauri/tauri.conf.json',
        filterByVersion: true,
        fileExtensions: [],
        enableFtp: 'disabled',
        ftpHost: '',
        ftpUsername: '',
        ftpPassword: '',
        ftpServerDir: '',
        uploadLatest: 'disabled',
        githubToken: '',
        cdnBaseUrl: 'https://cdn.example.com/',
        timezone: 'Asia/Shanghai'
      };
    });

    it('should validate correct inputs', () => {
      const result = validateInputs(validInputs);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should add warning for empty source-dir', () => {
      validInputs.sourceDir = '';
      const result = validateInputs(validInputs);
      expect(result.warnings).toContain('source-dir is empty, using default');
    });

    it('should add warning for empty cdn-base-url', () => {
      validInputs.cdnBaseUrl = '';
      const result = validateInputs(validInputs);
      expect(result.warnings).toContain('cdn-base-url is empty, using default');
    });

    it('should add warning for cdn-base-url without trailing slash', () => {
      validInputs.cdnBaseUrl = 'https://cdn.example.com';
      const result = validateInputs(validInputs);
      expect(result.warnings).toContain('cdn-base-url should end with "/"');
    });

    it('should add warning for empty timezone', () => {
      validInputs.timezone = '';
      const result = validateInputs(validInputs);
      expect(result.warnings).toContain('timezone is empty, using default (Asia/Shanghai)');
    });

    it('should reject invalid enable-ftp mode', () => {
      (validInputs as any).enableFtp = 'invalid';
      const result = validateInputs(validInputs);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('enable-ftp must be one of');
    });

    it('should require ftp-host when enable-ftp is use', () => {
      validInputs.enableFtp = 'use';
      const result = validateInputs(validInputs);
      expect(result.errors).toContain('ftp-host is required when enable-ftp is "use"');
    });

    it('should require ftp-username when enable-ftp is use', () => {
      validInputs.enableFtp = 'use';
      validInputs.ftpHost = 'ftp.example.com';
      const result = validateInputs(validInputs);
      expect(result.errors).toContain('ftp-username is required when enable-ftp is "use"');
    });

    it('should validate ftp-host format when enable-ftp is use', () => {
      validInputs.enableFtp = 'use';
      validInputs.ftpHost = '-invalid';
      validInputs.ftpUsername = 'user';
      const result = validateInputs(validInputs);
      expect(result.errors).toContain('ftp-host format is invalid');
    });

    it('should recommend github-token when upload-latest is use', () => {
      validInputs.uploadLatest = 'use';
      validInputs.githubToken = '';
      const result = validateInputs(validInputs);
      expect(result.warnings).toContain('github-token is recommended when upload-latest is "use"');
    });

    it('should reject invalid timezone', () => {
      validInputs.timezone = 'Invalid/Timezone';
      const result = validateInputs(validInputs);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('timezone');
    });

    it('should reject invalid cdn-base-url', () => {
      validInputs.cdnBaseUrl = 'not-a-url';
      const result = validateInputs(validInputs);
      expect(result.errors).toContain('cdn-base-url must be a valid HTTP/HTTPS URL');
    });
  });

  describe('sanitizeLogMessage', () => {
    it('should hide sensitive information', () => {
      const message = 'Connecting to server with password=secret123';
      const sanitized = sanitizeLogMessage(message);
      expect(sanitized).toBe('Connecting to server with password=[HIDDEN]');
    });

    it('should hide token information', () => {
      const message = 'Auth token: ghp_abc123xyz';
      const sanitized = sanitizeLogMessage(message);
      expect(sanitized).toBe('Auth token: [HIDDEN]');
    });

    it('should hide multiple sensitive fields', () => {
      const message = 'password=secret token=abc123 key=xyz789';
      const sanitized = sanitizeLogMessage(message);
      expect(sanitized).toContain('password=[HIDDEN]');
      expect(sanitized).toContain('token=[HIDDEN]');
      expect(sanitized).toContain('key=[HIDDEN]');
    });

    it('should not modify messages without sensitive data', () => {
      const message = 'Uploading files to server';
      const sanitized = sanitizeLogMessage(message);
      expect(sanitized).toBe('Uploading files to server');
    });

    it('should handle case-insensitive matching', () => {
      const message = 'PASSWORD=secret TOKEN=abc';
      const sanitized = sanitizeLogMessage(message);
      expect(sanitized).toBe('PASSWORD=[HIDDEN] TOKEN=[HIDDEN]');
    });

    it('should use custom sensitive keys', () => {
      const message = 'api_key=secret123';
      const sanitized = sanitizeLogMessage(message, ['api_key']);
      expect(sanitized).toBe('api_key=[HIDDEN]');
    });
  });

  describe('createActionError', () => {
    it('should create error with message', () => {
      const error = createActionError('Something went wrong');
      expect(error.message).toBe('Something went wrong');
      expect((error as any).code).toBeUndefined();
      expect((error as any).details).toBeUndefined();
    });

    it('should create error with code', () => {
      const error = createActionError('Validation failed', 'VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect((error as any).code).toBe('VALIDATION_ERROR');
    });

    it('should create error with details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = createActionError('Validation failed', 'VALIDATION_ERROR', details);
      expect(error.message).toBe('Validation failed');
      expect((error as any).code).toBe('VALIDATION_ERROR');
      expect((error as any).details).toEqual(details);
    });
  });
});
