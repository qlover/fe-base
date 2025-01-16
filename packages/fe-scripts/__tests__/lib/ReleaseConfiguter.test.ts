import { ReleaseConfiger } from '../../src/lib/release/ReleaseConfiguter';
import { ReleaseContext } from '../../src/lib/Release';
import { FeScriptContext } from '../../src/lib/FeScriptContext';

describe('ReleaseConfiger', () => {
  let context: ReleaseContext;
  let configer: ReleaseConfiger;

  beforeEach(() => {
    context = new FeScriptContext({
      options: {
        releaseBranch: 'main',
        releaseEnv: 'production',
        path: 'dist'
      }
    });
    configer = new ReleaseConfiger(context);
  });

  test('should initialize with context', () => {
    expect(configer.context).toBe(context);
  });

  test('should get dry run PR number', () => {
    expect(configer.dryRunPRNumber).toBe('999999');
  });

  test('should get logger instance', () => {
    expect(configer.logger).toBe(context.logger);
  });

  test('should get shell instance', () => {
    expect(configer.shell).toBe(context.shell);
  });

  test('should get release base branch', () => {
    expect(configer.releaseBaseBranch).toBe('main');
  });

  test('should get release environment', () => {
    expect(configer.releaseEnv).toBe('production');
  });

  // test('should initialize front-end configuration', () => {
  //   const feConfig = configer.initFEConfig({}, context);
  //   expect(feConfig.release.packagesDirectories).toBe('dist');
  // });

  test('should throw error if user info is not found', () => {
    jest.spyOn(configer, 'getPkg').mockReturnValueOnce({});
    expect(() => configer.getUserInfo()).toThrow('Not round repo or owner!!!');
  });

  // Add more tests for other methods as needed
});
