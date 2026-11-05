import { describe, expect, it } from 'vitest';
import { parseNextOauthChangelog } from '@server/render/readNextOauthChangelog';

describe('parseNextOauthChangelog', () => {
  it('splits ## version headings into releases', () => {
    const markdown = [
      '# examples/next-oauth',
      '',
      '## 1.7.0',
      '',
      '### Minor Changes',
      '',
      '- feature a',
      '',
      '## 1.6.2',
      '',
      '- patch b'
    ].join('\n');

    const releases = parseNextOauthChangelog(markdown);

    expect(releases).toEqual([
      {
        version: '1.7.0',
        body: '### Minor Changes\n\n- feature a'
      },
      {
        version: '1.6.2',
        body: '- patch b'
      }
    ]);
  });

  it('returns empty list when no version headings exist', () => {
    expect(parseNextOauthChangelog('# title\n\nno versions')).toEqual([]);
  });
});
