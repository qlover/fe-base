import { getURLProperty } from '../../../src/core/user-auth/utils/getURLProperty';

describe('getURLProperty utility', () => {
  it('should return the correct value for an existing query param', () => {
    const href = 'https://example.com/?foo=bar&baz=qux';
    expect(getURLProperty(href, 'foo')).toBe('bar');
    expect(getURLProperty(href, 'baz')).toBe('qux');
  });

  it('should return an empty string when the param does not exist', () => {
    const href = 'https://example.com/?foo=bar';
    expect(getURLProperty(href, 'missing')).toBe('');
  });

  it('should return an empty string when there is no query string', () => {
    const href = 'https://example.com/';
    expect(getURLProperty(href, 'foo')).toBe('');
  });

  it('should work when the query part is after a hash', () => {
    const href = 'https://example.com/#/path?foo=bar';
    expect(getURLProperty(href, 'foo')).toBe('bar');
  });

  it('should return an empty string when there is a hash without a query part', () => {
    const href = 'https://example.com/#foo=bar';
    expect(getURLProperty(href, 'foo')).toBe('');
  });

  it('should return the first occurrence when the param appears multiple times', () => {
    const href = 'https://example.com/?foo=bar1&foo=bar2';
    expect(getURLProperty(href, 'foo')).toBe('bar1');
  });

  it('should decode encoded components', () => {
    const href = 'https://example.com/?foo=bar%20baz';
    expect(getURLProperty(href, 'foo')).toBe('bar baz');
  });

  it('should return an empty string when the value is empty', () => {
    const href = 'https://example.com/?foo=&baz=qux';
    expect(getURLProperty(href, 'foo')).toBe('');
  });

  it('should fail gracefully and return an empty string on malformed input', () => {
    const href = 'https://example.com/?foo=%E0%A4%A'; // bad percent-encoding
    expect(getURLProperty(href, 'foo')).toBe('');
  });
});
