import { describe, expect, it } from 'vitest';
import { PullRequestIncrementSectionParser } from '../../src/implments/PullRequestIncrementSectionParser';

describe('PullRequestIncrementSectionParser', () => {
  const parser = new PullRequestIncrementSectionParser();

  it('returns an empty map when the section is absent', () => {
    expect(parser.parse('## Summary\n\n- feat: something')).toEqual({});
  });

  it('parses package name and directory name until the next heading', () => {
    const body = [
      '## Summary',
      '',
      '## Release increments',
      '',
      '- @qlover/code2markdown: minor',
      '* fe-release: patch',
      '',
      '## Test plan',
      '',
      '- @qlover/fe-release: major'
    ].join('\n');

    expect(parser.parse(body)).toEqual({
      '@qlover/code2markdown': 'minor',
      'fe-release': 'patch'
    });
  });

  it('throws when a list item uses an unknown increment', () => {
    const body = ['## Release increments', '- @qlover/fe-release: beta'].join(
      '\n'
    );

    expect(() => parser.parse(body)).toThrow(
      'Invalid package increment "beta"'
    );
  });
});
