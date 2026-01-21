import { describe, it, expect } from 'vitest';
import { isAbsoluteUrl } from '../../../src/request/utils/isAbsoluteUrl';

describe('isAbsoluteUrl', () => {
  it('should return true for http:// URLs', () => {
    expect(isAbsoluteUrl('http://example.com')).toBe(true);
    expect(isAbsoluteUrl('http://api.example.com/users')).toBe(true);
    expect(isAbsoluteUrl('http://localhost:3000')).toBe(true);
    expect(isAbsoluteUrl('http://192.168.1.1:8080/api')).toBe(true);
  });

  it('should return true for https:// URLs', () => {
    expect(isAbsoluteUrl('https://example.com')).toBe(true);
    expect(isAbsoluteUrl('https://api.example.com/users')).toBe(true);
    expect(isAbsoluteUrl('https://localhost:3000')).toBe(true);
    expect(isAbsoluteUrl('https://secure.example.com/data')).toBe(true);
  });

  it('should return false for relative URLs with leading slash', () => {
    expect(isAbsoluteUrl('/users')).toBe(false);
    expect(isAbsoluteUrl('/api/v1/users')).toBe(false);
    expect(isAbsoluteUrl('/')).toBe(false);
  });

  it('should return false for relative URLs without leading slash', () => {
    expect(isAbsoluteUrl('users')).toBe(false);
    expect(isAbsoluteUrl('api/users')).toBe(false);
    expect(isAbsoluteUrl('./users')).toBe(false);
    expect(isAbsoluteUrl('../users')).toBe(false);
  });

  it('should return false for protocol-relative URLs', () => {
    expect(isAbsoluteUrl('//cdn.example.com/file.js')).toBe(false);
    expect(isAbsoluteUrl('//example.com')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isAbsoluteUrl('')).toBe(false);
  });

  it('should return false for other protocols', () => {
    expect(isAbsoluteUrl('ftp://example.com/file')).toBe(false);
    expect(isAbsoluteUrl('ws://example.com/socket')).toBe(false);
    expect(isAbsoluteUrl('file:///path/to/file')).toBe(false);
    expect(isAbsoluteUrl('mailto:user@example.com')).toBe(false);
  });

  it('should handle URLs with query parameters and hash', () => {
    expect(isAbsoluteUrl('https://example.com/users?page=1')).toBe(true);
    expect(isAbsoluteUrl('http://example.com/docs#section')).toBe(true);
    expect(
      isAbsoluteUrl('https://example.com/search?q=test&sort=asc#results')
    ).toBe(true);
  });

  it('should handle edge cases', () => {
    expect(isAbsoluteUrl('http://')).toBe(true);
    expect(isAbsoluteUrl('https://')).toBe(true);
    expect(isAbsoluteUrl('http:/')).toBe(false);
    expect(isAbsoluteUrl('https:/')).toBe(false);
    expect(isAbsoluteUrl('http')).toBe(false);
    expect(isAbsoluteUrl('https')).toBe(false);
  });
});
