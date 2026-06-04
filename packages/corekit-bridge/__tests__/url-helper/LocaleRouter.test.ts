import { LocaleRouter, type LocaleRouterMode } from '../../src/core/url-helper';

const supportedLocales = ['zh', 'en', 'jp'];

describe('LocaleRouter', () => {
  describe('LocaleRouter - path mode edge cases', () => {
    const mode: LocaleRouterMode = 'path';
    const router = new LocaleRouter({ supportedLocales, mode });

    it('should handle path with multiple slashes', () => {
      const result = router.switchLocale('/zh//dashboard//profile', 'zh', 'en');
      expect(result).toBe('/en//dashboard//profile');
    });

    it('should handle path where locale appears as substring later in path', () => {
      // "zh" appears as part of "zhengzhou" but not as prefix
      const result = router.switchLocale('/zhengzhou/zh', 'jp', 'en');
      expect(result).toBe('/en/zhengzhou/zh');
    });

    it('should handle path with URL encoded characters', () => {
      const result = router.switchLocale(
        '/zh/user%20name?q=%E4%B8%AD%E6%96%87',
        'zh',
        'jp'
      );
      expect(result).toBe('/jp/user%20name?q=%E4%B8%AD%E6%96%87');
    });

    it('should handle query string with multiple same keys', () => {
      const result = router.switchLocale(
        '/zh/search?tag=js&tag=react',
        'zh',
        'en'
      );
      expect(result).toBe('/en/search?tag=js&tag=react');
    });

    it('should handle hash containing special characters', () => {
      const result = router.switchLocale(
        '/zh/page#section-1?with=query',
        'zh',
        'jp'
      );
      expect(result).toBe('/jp/page#section-1?with=query');
    });

    it('should handle empty hash (just "#")', () => {
      const result = router.switchLocale('/zh/page#', 'zh', 'en');
      expect(result).toBe('/en/page');
    });

    it('should handle empty hash (just "#")', () => {
      const result = router.switchLocale('/zh/page#', 'zh', 'en');
      // 空 hash 没有实际意义，标准 URL 处理会去掉
      expect(result).toBe('/en/page');
    });

    it('should handle path with locale prefix but no trailing slash or end', () => {
      const result = router.switchLocale('/zh', 'zh', 'en');
      expect(result).toBe('/en');
    });

    it('should handle path with locale prefix and trailing slash', () => {
      const result = router.switchLocale('/zh/', 'zh', 'jp');
      expect(result).toBe('/jp/');
    });

    it('should handle extremely long path', () => {
      const longSegment = 'a'.repeat(1000);
      const result = router.switchLocale(`/zh/${longSegment}`, 'zh', 'en');
      expect(result).toBe(`/en/${longSegment}`);
    });
  });

  describe('LocaleRouter - query mode edge cases', () => {
    const mode: LocaleRouterMode = 'query';
    const router = new LocaleRouter({ supportedLocales, mode });

    it('should handle query string with multiple same keys including locale', () => {
      // Malformed but possible: multiple locale params
      const result = router.switchLocale(
        '/search?locale=zh&tag=js&locale=en',
        'zh',
        'jp'
      );
      // URLSearchParams.set will replace the first occurrence? Actually it replaces all values for that key
      expect(result).toBe('/search?locale=jp&tag=js');
      // Note: duplicate keys are collapsed to one by URLSearchParams.set
    });

    it('should handle query param with no value', () => {
      const result = router.switchLocale('/login?empty&name=122', 'en', 'zh');
      expect(result).toBe('/login?empty=&name=122&locale=zh');
    });

    it('should handle query param with encoded equals sign', () => {
      const result = router.switchLocale('/login?filter=foo%3Dbar', 'en', 'jp');
      expect(result).toBe('/login?filter=foo%3Dbar&locale=jp');
    });

    it('should handle query string starting with "?" but empty', () => {
      const result = router.switchLocale('/login?', 'en', 'zh');
      expect(result).toBe('/login?locale=zh');
    });

    it('should handle multiple question marks (malformed)', () => {
      // 畸形输入：第二个 '?' 应被视为普通字符，但 URLSearchParams 会截断
      // 这里按照实际合理行为断言，不追求完美处理畸形 URL
      const result = router.switchLocale('/login?foo=bar?baz=qux', 'en', 'jp');
      expect(result).toBe('/login?foo=bar&locale=jp');
    });

    it('should preserve hash that contains question mark', () => {
      // 正确格式：query 参数必须在 hash 之前
      const result = router.switchLocale(
        '/page#section?with=query',
        'en',
        'zh'
      );
      expect(result).toBe('/page?locale=zh#section?with=query');
    });

    it('should handle empty query string with hash', () => {
      const result = router.switchLocale('/page?#top', 'en', 'jp');
      expect(result).toBe('/page?locale=jp#top');
    });

    it('should handle custom localeQueryParam with special characters', () => {
      const customRouter = new LocaleRouter({
        supportedLocales,
        mode: 'query',
        localeQueryParam: 'user-locale'
      });
      const result = customRouter.switchLocale('/login?name=122', 'en', 'zh');
      expect(result).toBe('/login?name=122&user-locale=zh');
    });

    it('should replace custom param when it already exists', () => {
      const customRouter = new LocaleRouter({
        supportedLocales,
        mode: 'query',
        localeQueryParam: 'user-locale'
      });
      const result = customRouter.switchLocale(
        '/login?user-locale=en&name=122',
        'en',
        'jp'
      );
      expect(result).toBe('/login?user-locale=jp&name=122');
    });
  });

  describe('LocaleRouter - cross-mode inconsistencies and edge behavior', () => {
    it('should handle switching from path mode with no locale prefix to target', () => {
      const router = new LocaleRouter({ supportedLocales, mode: 'path' });
      const result = router.switchLocale('/products?page=2', 'en', 'zh');
      expect(result).toBe('/zh/products?page=2');
    });

    it('should handle path mode where currentPath already contains target locale', () => {
      const router = new LocaleRouter({ supportedLocales, mode: 'path' });
      // Switching from zh to en but current is already en? Test replacement
      const result = router.switchLocale('/en/profile', 'zh', 'en');
      expect(result).toBe('/en/profile'); // Replaces en with en → same
    });

    it('should handle path mode with empty string as path (treat as root)', () => {
      const router = new LocaleRouter({ supportedLocales, mode: 'path' });
      const result = router.switchLocale('', 'zh', 'en');
      expect(result).toBe('/en');
    });

    it('should handle query mode with null or undefined target', () => {
      const router = new LocaleRouter({ supportedLocales, mode: 'query' });
      // @ts-expect-error testing invalid input
      expect(() => router.switchLocale('/login', 'en', null)).toThrow();
    });

    it('should handle URL with just locale prefix and no path (path mode)', () => {
      const router = new LocaleRouter({ supportedLocales, mode: 'path' });
      const result = router.switchLocale('/zh', 'zh', 'jp');
      expect(result).toBe('/jp');
    });

    it('should handle URL with locale prefix and trailing slash with query', () => {
      const router = new LocaleRouter({ supportedLocales, mode: 'path' });
      const result = router.switchLocale('/zh/?ref=home', 'zh', 'en');
      expect(result).toBe('/en/?ref=home');
    });

    it('should not confuse locale prefix with longer matching prefix', () => {
      // supported locales: zh, en, jp. Path /zhen should not match /zh
      const router = new LocaleRouter({ supportedLocales, mode: 'path' });
      const result = router.switchLocale('/zhen/login', 'en', 'jp');
      expect(result).toBe('/jp/zhen/login');
    });

    it('should handle path mode where locale prefix regex might match empty string', () => {
      // Edge: path starts with '//'? Our regex requires leading slash then locale.
      const router = new LocaleRouter({ supportedLocales, mode: 'path' });
      const result = router.switchLocale('//zh/login', 'en', 'jp');
      expect(result).toBe('/jp//zh/login'); // Because first slash + regex doesn't match //zh
      // This might be acceptable; real-world URLs rarely start with double slash.
    });
  });

  describe('LocaleRouter - performance & large inputs', () => {
    it('should handle very large query string', () => {
      const router = new LocaleRouter({ supportedLocales, mode: 'query' });
      const largeQuery = 'a=' + 'x'.repeat(10000) + '&b=2';
      const result = router.switchLocale(`/page?${largeQuery}`, 'en', 'zh');
      expect(result).toContain('locale=zh');
      expect(result.length).toBeLessThan(10000 + 100); // sanity
    });

    it('should handle many query params (100+)', () => {
      const router = new LocaleRouter({ supportedLocales, mode: 'query' });
      const params = Array.from({ length: 200 }, (_, i) => `p${i}=${i}`).join(
        '&'
      );
      const result = router.switchLocale(`/list?${params}`, 'en', 'jp');
      expect(result).toContain('locale=jp');
      expect(result.split('&').length).toBe(201); // original 200 + locale
    });
  });
});
