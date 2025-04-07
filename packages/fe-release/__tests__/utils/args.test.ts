import { describe, it, expect } from 'vitest';
import { reduceOptions } from '../../src/utils/args';

describe('args utils', () => {
  describe('reduceOptions', () => {
    it('should transform flat options correctly', () => {
      const options = {
        name: 'test',
        version: '1.0.0',
        debug: true
      };

      const result = reduceOptions(options);

      expect(result).toEqual({
        name: 'test',
        version: '1.0.0',
        debug: true
      });
    });

    it('should transform nested options correctly', () => {
      const options = {
        'git.push': true,
        'git.commit': false,
        'npm.publish': true
      };

      const result = reduceOptions(options);

      expect(result).toEqual({
        git: {
          push: true,
          commit: false
        },
        npm: {
          publish: true
        }
      });
    });

    it('should handle mixed flat and nested options', () => {
      const options = {
        name: 'test',
        'git.push': true,
        'config.path': './config.json',
        debug: true
      };

      const result = reduceOptions(options);

      expect(result).toEqual({
        name: 'test',
        git: {
          push: true
        },
        config: {
          path: './config.json'
        },
        debug: true
      });
    });

    it('should handle deeply nested options', () => {
      const options = {
        'config.git.remote.name': 'origin',
        'config.git.remote.url': 'https://github.com/user/repo.git'
      };

      const result = reduceOptions(options);

      expect(result).toEqual({
        config: {
          git: {
            remote: {
              name: 'origin',
              url: 'https://github.com/user/repo.git'
            }
          }
        }
      });
    });
  });
});
