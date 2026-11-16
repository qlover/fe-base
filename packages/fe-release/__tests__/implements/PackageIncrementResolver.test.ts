import { describe, expect, it } from 'vitest';
import { PackageIncrementResolver } from '../../src/implments/PackageIncrementResolver';

const workspace = {
  name: '@qlover/code2markdown',
  path: 'packages/code2markdown'
};

describe('PackageIncrementResolver', () => {
  it('returns undefined when the package is not configured', () => {
    const resolver = new PackageIncrementResolver({
      packageIncrements: { '@qlover/fe-release': 'patch' }
    });

    expect(resolver.resolve(workspace)).toBeUndefined();
  });

  it('matches package name, then path, then directory name', () => {
    expect(
      new PackageIncrementResolver({
        packageIncrements: { '@qlover/code2markdown': 'major' }
      }).resolve(workspace)
    ).toBe('major');

    expect(
      new PackageIncrementResolver({
        packageIncrements: { 'packages/code2markdown': 'minor' }
      }).resolve(workspace)
    ).toBe('minor');

    expect(
      new PackageIncrementResolver({
        packageIncrements: { code2markdown: 'patch' }
      }).resolve(workspace)
    ).toBe('patch');
  });

  it('prefers the package name when several keys match', () => {
    const resolver = new PackageIncrementResolver({
      packageIncrements: {
        '@qlover/code2markdown': 'major',
        'packages/code2markdown': 'minor',
        code2markdown: 'patch'
      }
    });

    expect(resolver.resolve(workspace)).toBe('major');
  });

  it('throws when a configured increment is not patch, minor, or major', () => {
    expect(
      () =>
        new PackageIncrementResolver({
          packageIncrements: { '@qlover/code2markdown': 'beta' }
        })
    ).toThrow('Invalid package increment "beta"');
  });
});
