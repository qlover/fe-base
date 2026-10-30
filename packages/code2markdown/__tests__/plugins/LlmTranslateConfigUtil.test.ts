import { describe, expect, it } from 'vitest';
import {
  buildLocalizedMarkdownPath,
  buildLlmTranslateSystemPrompt,
  encodeLlmTranslateBatchPrompt,
  hasLlmTranslateConfigIntent,
  isLocalizedMarkdownPath,
  mapWithConcurrency,
  normalizeNonNegativeInt,
  normalizePositiveInt,
  normalizeLlmTranslateLocales,
  packLlmTranslateUnits,
  parseLlmTranslateBatchResponse,
  parseRetryAfterMs,
  resolveLlmTranslateConfig,
  LLM_TRANSLATE_FILE_END_MARKER,
  type LlmTranslateUnitType
} from '../../src/plugins/LlmTranslateConfigUtil';

function unit(
  partial: Partial<LlmTranslateUnitType> &
    Pick<LlmTranslateUnitType, 'id' | 'content'>
): LlmTranslateUnitType {
  const content = partial.content;
  return {
    id: partial.id,
    sourcePath: partial.sourcePath ?? `src/${partial.id}.doc.md`,
    outPath: partial.outPath ?? `src/${partial.id}.en.doc.md`,
    locale: partial.locale ?? 'en',
    content,
    charCount: partial.charCount ?? content.length
  };
}

describe('LlmTranslateConfigUtil', () => {
  it('normalizeLlmTranslateLocales 去重并 trim', () => {
    expect(normalizeLlmTranslateLocales('en, ja, en')).toEqual(['en', 'ja']);
    expect(normalizeLlmTranslateLocales([' en ', ''])).toEqual(['en']);
    expect(normalizeLlmTranslateLocales(undefined)).toEqual([]);
  });

  it('normalizePositiveInt 回落默认', () => {
    expect(normalizePositiveInt(undefined, 3)).toBe(3);
    expect(normalizePositiveInt(0, 3)).toBe(3);
    expect(normalizePositiveInt(2.8, 1)).toBe(2);
  });

  it('normalizeNonNegativeInt 允许 0', () => {
    expect(normalizeNonNegativeInt(undefined, 0)).toBe(0);
    expect(normalizeNonNegativeInt(0, 5)).toBe(0);
    expect(normalizeNonNegativeInt(-1, 5)).toBe(5);
    expect(normalizeNonNegativeInt(12.9, 0)).toBe(12);
  });

  it('parseRetryAfterMs 支持秒与日期', () => {
    expect(parseRetryAfterMs('8')).toBe(8000);
    expect(parseRetryAfterMs(null)).toBeNull();
    const now = Date.parse('Wed, 21 Oct 2015 07:28:00 GMT');
    expect(parseRetryAfterMs('Wed, 21 Oct 2015 07:28:10 GMT', now)).toBe(
      10_000
    );
  });

  it('resolve 带上 batch/force 默认值', () => {
    const result = resolveLlmTranslateConfig(
      { locales: ['en'], model: 'm' },
      {
        OPENAI_BASE_URL: 'https://api.groq.com/openai/v1/',
        OPENAI_API_KEY: 'gsk'
      }
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.baseUrl).toBe('https://api.groq.com/openai/v1');
      expect(result.config.batchSize).toBe(1);
      expect(result.config.maxBatchChars).toBe(24000);
      expect(result.config.maxFileChars).toBe(16000);
      expect(result.config.force).toBe(false);
      expect(result.config.requestDelayMs).toBe(0);
      expect(result.config.rateLimitRetries).toBe(0);
    }
  });

  it('force / batchSize / delay / retries 可从配置读入', () => {
    const result = resolveLlmTranslateConfig(
      {
        locales: ['en'],
        model: 'm',
        baseUrl: 'https://x',
        apiKey: 'k',
        force: true,
        batchSize: 3,
        maxBatchChars: 1000,
        maxFileChars: 500,
        requestDelayMs: 10000,
        rateLimitRetries: 3
      },
      {}
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.force).toBe(true);
      expect(result.config.batchSize).toBe(3);
      expect(result.config.maxBatchChars).toBe(1000);
      expect(result.config.maxFileChars).toBe(500);
      expect(result.config.requestDelayMs).toBe(10000);
      expect(result.config.rateLimitRetries).toBe(3);
    }
  });

  it('hasLlmTranslateConfigIntent 识别 locales', () => {
    expect(hasLlmTranslateConfigIntent(undefined)).toBe(false);
    expect(hasLlmTranslateConfigIntent({ locales: ['en'] })).toBe(true);
  });

  it('buildLocalizedMarkdownPath / isLocalizedMarkdownPath', () => {
    expect(buildLocalizedMarkdownPath('src/Button.doc.md', 'en')).toBe(
      'src/Button.en.doc.md'
    );
    expect(isLocalizedMarkdownPath('Button.en.doc.md')).toBe(true);
    expect(isLocalizedMarkdownPath('Button.doc.md')).toBe(false);
  });

  it('buildLlmTranslateSystemPrompt 批量时要求保留 FILE 标记', () => {
    const prompt = buildLlmTranslateSystemPrompt('en', {}, 3);
    expect(prompt.includes('FILE')).toBe(true);
    expect(prompt.includes('ALL Chinese')).toBe(true);
  });

  it('packLlmTranslateUnits 按字符预算装箱并隔离超大文件', () => {
    const units = [
      unit({ id: '0', content: 'a'.repeat(10) }),
      unit({ id: '1', content: 'b'.repeat(100) }),
      unit({ id: '2', content: 'c'.repeat(10_000), charCount: 10_000 })
    ];
    const packed = packLlmTranslateUnits(units, {
      batchSize: 3,
      maxBatchChars: 200,
      maxFileChars: 500
    });
    expect(packed.oversized.map((item) => item.id)).toEqual(['2']);
    expect(packed.batches.length).toBeGreaterThanOrEqual(1);
    const flat = packed.batches.flat().map((item) => item.id);
    expect(flat.sort()).toEqual(['0', '1']);
    for (const batch of packed.batches) {
      expect(batch.length).toBeLessThanOrEqual(3);
      const chars = batch.reduce((sum, item) => sum + item.charCount, 0);
      expect(chars).toBeLessThanOrEqual(200);
    }
  });

  it('超大单文件不会和其它文件混包', () => {
    const units = [
      unit({ id: '0', content: 'tiny' }),
      unit({ id: '1', content: 'x'.repeat(1000), charCount: 1000 })
    ];
    const packed = packLlmTranslateUnits(units, {
      batchSize: 5,
      maxBatchChars: 5000,
      maxFileChars: 100
    });
    expect(packed.oversized.map((item) => item.id)).toEqual(['1']);
    expect(packed.batches).toEqual([[units[0]]]);
  });

  it('encode / parse 批量往返', () => {
    const units = [
      unit({ id: '0', content: '# A\n中文', sourcePath: 'a.doc.md' }),
      unit({ id: '1', content: '# B\n你好', sourcePath: 'b.doc.md' })
    ];
    const encoded = encodeLlmTranslateBatchPrompt(units);
    expect(encoded.includes('id="0"')).toBe(true);
    expect(encoded.includes(LLM_TRANSLATE_FILE_END_MARKER)).toBe(true);

    const fakeResponse = [
      '<<<FILE id="0" path="a.doc.md">',
      '# A\nChinese',
      '<<<END FILE>>>',
      '<<<FILE id="1" path="b.doc.md">',
      '# B\nHello',
      '<<<END FILE>>>'
    ].join('\n');
    const parsed = parseLlmTranslateBatchResponse(fakeResponse, units);
    expect(parsed.get('0')).toContain('Chinese');
    expect(parsed.get('1')).toContain('Hello');
  });

  it('单文件无标记时整段作为译文', () => {
    const units = [unit({ id: '0', content: '# 头像' })];
    const parsed = parseLlmTranslateBatchResponse('# Avatar\n', units);
    expect(parsed.get('0')).toBe('# Avatar\n');
  });

  it('mapWithConcurrency 保序', async () => {
    const result = await mapWithConcurrency([1, 2, 3], 2, async (value) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return value * 2;
    });
    expect(result).toEqual([2, 4, 6]);
  });
});
