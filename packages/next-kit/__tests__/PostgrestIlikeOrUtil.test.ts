import { describe, expect, it } from 'vitest';
import {
  buildIlikeOrString,
  escapeIlikePattern
} from '../src/common/utils/PostgrestIlikeOrUtil';

describe('PostgrestIlikeOrUtil', () => {
  it('escapes ILIKE wildcards and wraps with quotes', () => {
    expect(escapeIlikePattern('a%b_c')).toBe(`"%a\\%b\\_c%"`);
    expect(escapeIlikePattern('say "hi"')).toBe(`"%say \\"hi\\"%"`);
  });

  it('builds multi-column or string', () => {
    expect(
      buildIlikeOrString({
        columns: ['email', 'display_name', ''],
        query: 'foo'
      })
    ).toBe('email.ilike."%foo%",display_name.ilike."%foo%"');
  });
});
