import { describe, expect, it, vi } from 'vitest';
import { TranslateI18nUtil } from '../src/common/i18n/TranslateI18nUtil';
import { createIOCReact } from '../src/client/ioc/createIOCReact';
import type { PageI18nInterface } from '../src/common';

describe('TranslateI18nUtil', () => {
  it('maps string values through t', () => {
    const t = vi.fn((key: string) => `T:${key}`);
    expect(
      TranslateI18nUtil.translate({ title: 'page.title', n: 1 }, t)
    ).toEqual({ title: 'T:page.title', n: 1 });
  });

  it('warns on missing keys when enabled', () => {
    const warn = vi.fn();
    const t = Object.assign((key: string) => key, {
      has: () => false
    });
    const ot = TranslateI18nUtil.overrideTranslateT(t, {
      warnMissing: true,
      logger: { warn, error: vi.fn() }
    });
    expect(ot('missing.key')).toBe('missing.key');
    expect(warn).toHaveBeenCalled();
  });
});

describe('createIOCReact', () => {
  it('exposes context, useIOC, and IOCProvider', () => {
    type Map = { Logger: { info: () => void } };
    const api = createIOCReact<Map>();
    expect(api.IOCContext).toBeTruthy();
    expect(typeof api.useIOC).toBe('function');
    expect(typeof api.IOCProvider).toBe('function');
  });
});

describe('PageI18nInterface', () => {
  it('is a structural type usable as a bag', () => {
    const page: PageI18nInterface = {
      title: 't',
      description: 'd',
      content: 'c',
      keywords: 'k'
    };
    expect(page.title).toBe('t');
  });
});
