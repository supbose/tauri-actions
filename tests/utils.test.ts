import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  pad,
  ensureTrailingSlash,
  removeTrailingSlash,
  formatUrl,
  joinUrl,
  formatDateTimeWithTimezone,
  formatUTCDate,
  safeJsonParse,
  safeJsonStringify,
  truncate,
  isNotNullish,
  isEmpty,
  randomString,
  deepClone,
  groupBy,
  debounce,
  throttle,
  wait
} from '../src/utils/utils';

describe('Utils Module Tests', () => {
  describe('pad', () => {
    it('should pad single digit numbers with leading zeros', () => {
      expect(pad(1)).toBe('01');
      expect(pad(5)).toBe('05');
      expect(pad(9)).toBe('09');
    });

    it('should pad to custom length', () => {
      expect(pad(1, 3)).toBe('001');
      expect(pad(12, 4)).toBe('0012');
    });

    it('should handle multi-digit numbers', () => {
      expect(pad(12)).toBe('12');
      expect(pad(123)).toBe('123');
    });
  });

  describe('ensureTrailingSlash', () => {
    it('should add trailing slash if not present', () => {
      expect(ensureTrailingSlash('https://example.com')).toBe('https://example.com/');
      expect(ensureTrailingSlash('/path/to/dir')).toBe('/path/to/dir/');
    });

    it('should not modify strings already ending with slash', () => {
      expect(ensureTrailingSlash('https://example.com/')).toBe('https://example.com/');
      expect(ensureTrailingSlash('/path/to/dir/')).toBe('/path/to/dir/');
    });

    it('should handle empty strings', () => {
      expect(ensureTrailingSlash('')).toBe('');
    });
  });

  describe('removeTrailingSlash', () => {
    it('should remove trailing slash if present', () => {
      expect(removeTrailingSlash('https://example.com/')).toBe('https://example.com');
      expect(removeTrailingSlash('/path/to/dir/')).toBe('/path/to/dir');
    });

    it('should not modify strings without trailing slash', () => {
      expect(removeTrailingSlash('https://example.com')).toBe('https://example.com');
      expect(removeTrailingSlash('/path/to/dir')).toBe('/path/to/dir');
    });

    it('should handle empty strings', () => {
      expect(removeTrailingSlash('')).toBe('');
    });
  });

  describe('joinUrl', () => {
    it('should join URL segments correctly', () => {
      expect(joinUrl('https://cdn.example.com/', 'download', 'windows', 'v1.0.0', 'app.exe'))
        .toBe('https://cdn.example.com/download/windows/v1.0.0/app.exe');
    });

    it('should handle trailing and leading slashes', () => {
      expect(joinUrl('https://cdn.com/', '/download/', '/windows/'))
        .toBe('https://cdn.com/download/windows');
    });

    it('should preserve protocol double slash', () => {
      expect(joinUrl('https://example.com', 'path', 'to', 'file'))
        .toBe('https://example.com/path/to/file');
    });

    it('should handle empty segments', () => {
      expect(joinUrl('https://cdn.com', '', 'download', '', 'windows'))
        .toBe('https://cdn.com/download/windows');
    });

    it('should handle empty input', () => {
      expect(joinUrl()).toBe('');
      expect(joinUrl('')).toBe('');
      expect(joinUrl('', '')).toBe('');
    });

    it('should handle single segment', () => {
      expect(joinUrl('https://example.com/')).toBe('https://example.com');
      expect(joinUrl('/path/to/dir/')).toBe('/path/to/dir');
    });

    it('should handle Chinese file names', () => {
      expect(joinUrl('https://cdn.example.com/', 'download', 'windows', 'v0.0.5', '青数客户端_0.0.5_x64-setup.exe'))
        .toBe('https://cdn.example.com/download/windows/v0.0.5/青数客户端_0.0.5_x64-setup.exe');
    });

    it('should handle serverDir with trailing slash', () => {
      expect(joinUrl('https://cdn2.ali.yiruan.wang/', '/download/', 'windows', 'v0.0.5', '青数客户端_0.0.5_x64-setup.exe'))
        .toBe('https://cdn2.ali.yiruan.wang/download/windows/v0.0.5/青数客户端_0.0.5_x64-setup.exe');
    });
  });

  describe('formatUrl', () => {
    it('should remove double slashes', () => {
      expect(formatUrl('https://cdn.example.com//download//windows/v1.0.0//'))
        .toBe('https://cdn.example.com/download/windows/v1.0.0/');
    });

    it('should preserve protocol double slash', () => {
      expect(formatUrl('https://example.com//path//to//file'))
        .toBe('https://example.com/path/to/file');
    });

    it('should handle http protocol', () => {
      expect(formatUrl('http://cdn.com//download//app.exe'))
        .toBe('http://cdn.com/download/app.exe');
    });

    it('should handle paths without protocol', () => {
      expect(formatUrl('//download//windows//'))
        .toBe('/download/windows/');
    });

    it('should handle single slashes', () => {
      expect(formatUrl('https://example.com/path/to/file'))
        .toBe('https://example.com/path/to/file');
    });

    it('should handle empty string', () => {
      expect(formatUrl('')).toBe('');
    });

    it('should handle URL with Chinese characters', () => {
      expect(formatUrl('https://cdn2.ali.yiruan.wang//download//windows//v0.0.5//青数客户端_0.0.5_x64-setup.exe'))
        .toBe('https://cdn2.ali.yiruan.wang/download/windows/v0.0.5/青数客户端_0.0.5_x64-setup.exe');
    });
  });

  describe('formatDateTimeWithTimezone', () => {
    it('should format date with Shanghai timezone', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTimeWithTimezone(date, 'Asia/Shanghai');
      expect(result).toMatch(/^2024-01-15T\d{2}:30:00\+08:00$/);
    });

    it('should format date with UTC timezone', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTimeWithTimezone(date, 'UTC');
      expect(result).toMatch(/^2024-01-15T10:30:00\+00:00$/);
    });

    it('should handle Date object input', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTimeWithTimezone(date, 'UTC');
      expect(result).toMatch(/^2024-01-15T10:30:00/);
    });

    it('should format date with New York timezone', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTimeWithTimezone(date, 'America/New_York');
      expect(result).toMatch(/^2024-01-15T05:30:00-05:00$/);
    });
  });

  describe('formatUTCDate', () => {
    it('should format date as ISO string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatUTCDate(date)).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should handle Date object input', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatUTCDate(date);
      expect(result).toMatch(/^2024-01-15T\d{2}:30:00/);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      expect(safeJsonParse('{"key": "value"}', {})).toEqual({ key: 'value' });
      expect(safeJsonParse('[1, 2, 3]', [])).toEqual([1, 2, 3]);
    });

    it('should return fallback for invalid JSON', () => {
      expect(safeJsonParse('invalid json', { default: true })).toEqual({ default: true });
      expect(safeJsonParse('undefined', [])).toEqual([]);
    });

    it('should handle nested JSON', () => {
      const json = '{"user": {"name": "test", "age": 25}}';
      expect(safeJsonParse(json, {})).toEqual({ user: { name: 'test', age: 25 } });
    });
  });

  describe('safeJsonStringify', () => {
    it('should stringify valid objects', () => {
      expect(safeJsonStringify({ key: 'value' })).toBe('{"key":"value"}');
      expect(safeJsonStringify([1, 2, 3])).toBe('[1,2,3]');
    });

    it('should return fallback for circular references', () => {
      const obj: any = { self: null };
      obj.self = obj;
      expect(safeJsonStringify(obj, '{}')).toBe('{}');
    });

    it('should format output with indentation', () => {
      expect(safeJsonStringify({ key: 'value' }, '', 2)).toBe('{\n  "key": "value"\n}');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('This is a very long string', 10)).toBe('This is...');
      expect(truncate('1234567890', 5)).toBe('12...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Short', 10)).toBe('Short');
      expect(truncate('Exact', 5)).toBe('Exact');
    });

    it('should use custom suffix', () => {
      const result = truncate('Long string test', 11, '>>>');
      expect(result).toBe('Long str>>>');
    });
  });

  describe('isNotNullish', () => {
    it('should return true for non-null values', () => {
      expect(isNotNullish('value')).toBe(true);
      expect(isNotNullish(0)).toBe(true);
      expect(isNotNullish(false)).toBe(true);
      expect(isNotNullish({})).toBe(true);
    });

    it('should return false for null and undefined', () => {
      expect(isNotNullish(null)).toBe(false);
      expect(isNotNullish(undefined)).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty values', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty(null as any)).toBe(true);
      expect(isEmpty(undefined as any)).toBe(true);
      expect(isEmpty('   ')).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(isEmpty('value')).toBe(false);
    });
  });

  describe('randomString', () => {
    it('should generate string of default length', () => {
      expect(randomString()).toHaveLength(8);
    });

    it('should generate string of custom length', () => {
      expect(randomString(16)).toHaveLength(16);
      expect(randomString(4)).toHaveLength(4);
    });

    it('should use custom character set', () => {
      const result = randomString(10, '01');
      expect(result).toMatch(/^[01]+$/);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone('string')).toBe('string');
      expect(deepClone(123)).toBe(123);
      expect(deepClone(true)).toBe(true);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, 3];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it('should clone objects', () => {
      const obj = { key: 'value', nested: { a: 1 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.nested).not.toBe(obj.nested);
    });

    it('should clone Date objects', () => {
      const date = new Date('2024-01-15');
      const cloned = deepClone(date);
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('groupBy', () => {
    it('should group array items by key', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 }
      ];
      const grouped = groupBy(items, item => item.type);
      expect(grouped).toEqual({
        a: [{ type: 'a', value: 1 }, { type: 'a', value: 3 }],
        b: [{ type: 'b', value: 2 }]
      });
    });

    it('should handle empty array', () => {
      const grouped = groupBy([], (item: any) => item.type);
      expect(grouped).toEqual({});
    });
  });

  describe('wait', () => {
    it('should wait for specified milliseconds', async () => {
      const start = Date.now();
      await wait(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(150);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const fn = debounce(() => { callCount++; }, 50);

      fn();
      fn();
      fn();

      expect(callCount).toBe(0);

      await wait(100);
      expect(callCount).toBe(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const fn = throttle(() => { callCount++; }, 50);

      fn();
      fn();
      fn();

      expect(callCount).toBe(1);

      await wait(100);
      fn();
      expect(callCount).toBe(2);
    });
  });
});
