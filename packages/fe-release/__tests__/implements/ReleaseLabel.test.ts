import { describe, it, expect } from 'vitest';
import { ReleaseLabel } from '../../src/implments/ReleaseLabel';

describe('ReleaseLabel', () => {
  describe('pick', () => {
    it('should be defined', () => {
      const releaseLabel = new ReleaseLabel({
        changePackagesLabel: 'change:${name}',
        packagesDirectories: ['packages/fe-release']
      });

      const result = releaseLabel.pick([
        'packages/fe-release/src/implments/ReleaseLabel.ts',
        'packages/fe-release/src/implments/ReleaseLabel2.ts',
        'packages/fe-corekit/src/implments/ReleaseLabel2.ts'
      ]);

      expect(result).toEqual(['packages/fe-release']);
    });

    it('should be defined', () => {
      const releaseLabel = new ReleaseLabel({
        changePackagesLabel: 'change:${name}',
        packagesDirectories: ['packages/fe-release']
      });

      const result = releaseLabel.pick([
        'packages/fe-corekit/src/implments/ReleaseLabel.ts',
        'packages/fe-corekit/src/implments/ReleaseLabel2.ts',
        'packages/fe-corekit/src/implments/ReleaseLabel2.ts'
      ]);

      expect(result).toEqual([]);
    });

    it('should be defined', () => {
      const releaseLabel = new ReleaseLabel({
        changePackagesLabel: 'change:${name}',
        packagesDirectories: ['packages/fe-release', 'packages/fe-corekit']
      });

      const result = releaseLabel.pick([
        'packages/fe-release/src/implments/ReleaseLabel.ts',
        'packages/fe-release/src/implments/ReleaseLabel2.ts',
        'packages/fe-corekit/src/implments/ReleaseLabel2.ts'
      ]);

      expect(result).toEqual(['packages/fe-release', 'packages/fe-corekit']);
    });

    it('should be defined', () => {
      const releaseLabel = new ReleaseLabel({
        changePackagesLabel: 'change:${name}',
        packagesDirectories: ['packages/fe-release', 'packages/fe-corekit']
      });

      const result = releaseLabel.pick([
        'packages/fe-release/src/implments/ReleaseLabel.ts',
        'packages/fe-release/src/implments/ReleaseLabel2.ts',
        'packages/fe-corekit/src/implments/ReleaseLabel2.ts'
      ]);

      expect(result).toEqual(['packages/fe-release', 'packages/fe-corekit']);
      expect(releaseLabel.toChangeLabels(result)).toEqual([
        'change:packages/fe-release',
        'change:packages/fe-corekit'
      ]);
    });
    it('Pick 也可以获取其他数据，不一定是路径', () => {
      const releaseLabel = new ReleaseLabel({
        changePackagesLabel: 'change:${name}',
        packagesDirectories: []
      });

      const result = releaseLabel.pick(
        ['change:packages/fe-release', 'change:packages/fe-corekit'],
        ['change:packages/fe-release']
      );

      expect(result).toEqual(['change:packages/fe-release']);
    });

    it('Pick 也可以获取其他数据，不一定是路径', () => {
      const releaseLabel = new ReleaseLabel({
        changePackagesLabel: 'change:${name}',
        packagesDirectories: []
      });

      const result = releaseLabel.pick(
        ['abc', 'ab1', 'aad', 'abd'],
        ['ab', 'dbs']
      );

      expect(result).toEqual(['ab']);
    });
  });

  describe('toChangeLabels', () => {
    it('应该在未来版本可以支持 workspace 转标签', () => {
      const releaseLabel = new ReleaseLabel({
        changePackagesLabel: 'change:${name}',
        packagesDirectories: ['packages/fe-release', 'packages/fe-corekit']
      });

      const result = releaseLabel.pick([
        'packages/fe-release/src/implments/ReleaseLabel.ts',
        'packages/fe-release/src/implments/ReleaseLabel2.ts',
        'packages/fe-corekit/src/implments/ReleaseLabel2.ts'
      ]);

      expect(result).toEqual(['packages/fe-release', 'packages/fe-corekit']);

      const workspaces = [
        {
          name: '@qlover/fe-release',
          version: '1.0.0',
          path: 'packages/fe-release'
        },
        {
          name: '@qlover/fe-corekit',
          version: '12.0.0',
          path: 'packages/fe-corekit'
        }
      ];

      expect(
        releaseLabel.toChangeLabels(workspaces.map((w) => w.name))
      ).toEqual(['change:@qlover/fe-release', 'change:@qlover/fe-corekit']);
    });
  });
});
