import { describe, expect, it } from 'vitest';
import { NEXT_KIT_COMMON } from '../src/common';
import { NEXT_KIT_SERVER } from '../src/server';
import { NEXT_KIT_BROWSER } from '../src/browser';

describe('@qlover/next-kit entries', () => {
  it('exports common marker', () => {
    expect(NEXT_KIT_COMMON).toBe('common');
  });

  it('exports server marker', () => {
    expect(NEXT_KIT_SERVER).toBe('server');
  });

  it('exports browser marker', () => {
    expect(NEXT_KIT_BROWSER).toBe('browser');
  });
});
