import { describe, expect, it } from 'vitest';
import {
  buildIlikeOrString,
  escapeIlikePattern
} from '@qlover/next-kit/common';

describe('PostgrestIlikeOrUtil (via next-kit)', () => {
  it('escapes ILIKE wildcards and wraps with quotes', () => {
    expect(escapeIlikePattern('a%b_c')).toBe(`"%a\\%b\\_c%"`);
  });

  it('builds multi-column or string', () => {
    expect(
      buildIlikeOrString({
        columns: ['email', 'display_name'],
        query: 'foo'
      })
    ).toBe('email.ilike."%foo%",display_name.ilike."%foo%"');
  });
});
