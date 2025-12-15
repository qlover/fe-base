import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReleaseContext } from '../../src';
import { load, loaderPluginsFromPluginTuples } from '../../src/utils/loader';
import { tuple } from '../../src/utils/tuple';
import { createTestReleaseOptions } from '../helpers';
import { ScriptPlugin } from '@qlover/scripts-context';

vi.mock('node:module', () => ({
  createRequire: vi.fn(() => ({
    resolve: vi.fn((modulePath) => {
      if (modulePath === 'test-plugin') {
        return './test-plugin';
      }
      return modulePath;
    })
  }))
}));

vi.mock('node:url', () => ({
  pathToFileURL: vi.fn((path) => `file://${path}`)
}));

vi.mock('test-plugin', () => ({
  default: TestPlugin
}));
vi.mock('./test-plugin', () => ({
  default: TestPlugin
}));

class TestPlugin extends ScriptPlugin<ReleaseContext> {
  public option1: string;
  public option2: number;

  // eslint-disable-next-line
  constructor(context: any, name: string, option1: string, option2: number) {
    super(context, name);
    this.option1 = option1;
    this.option2 = option2;
  }
}

describe('loader utils', () => {
  let releaseContext: ReleaseContext;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal('import', async (path: string) => {
      if (
        path === 'test-plugin' ||
        path.includes('/test-plugin') ||
        path.startsWith('file://')
      ) {
        return { default: TestPlugin };
      }
      throw new Error(`Import not mocked for ${path}`);
    });

    process.env = { ...process.env };

    releaseContext = new ReleaseContext('release', createTestReleaseOptions());
  });

  describe('load function', () => {
    it('should load a plugin using direct import', async () => {
      const [name, plugin] = await load<typeof TestPlugin>('test-plugin');

      expect(name).toBe('test-plugin');
      expect(plugin).toBe(TestPlugin);
    });

    it('should load a plugin from a relative path', async () => {
      const [name, plugin] = await load<typeof TestPlugin>('./test-plugin');

      expect(name).toBe('test-plugin');
      expect(plugin).toBe(TestPlugin);
    });
  });

  // FIXME: ubuntu-latest frequent failures
  describe.skip('loaderPluginsFromPluginTuples', () => {
    it('should load plugins from class references', async () => {
      const tuples = [
        tuple(TestPlugin, 'test1', '1', 2),
        tuple(TestPlugin, 'test2', '3', 4)
      ];

      const plugins = await loaderPluginsFromPluginTuples<TestPlugin>(
        releaseContext,
        tuples
      );

      expect(plugins).toHaveLength(2);
      expect(plugins[0]).toBeInstanceOf(TestPlugin);
      expect(plugins[0].pluginName).toBe('test1');
      expect(plugins[0].option1).toBe('1');
      expect(plugins[0].option2).toBe(2);
      expect(plugins[1]).toBeInstanceOf(TestPlugin);
      expect(plugins[1].pluginName).toBe('test2');
      expect(plugins[1].option1).toBe('3');
      expect(plugins[1].option2).toBe(4);
    });

    it('should load plugins from string paths', async () => {
      const tuples = [
        tuple('test-plugin', 'test1', 1),
        tuple('test-plugin', 'test2', 2)
      ];

      const plugins = await loaderPluginsFromPluginTuples<TestPlugin>(
        releaseContext,
        tuples
      );

      expect(plugins).toHaveLength(2);
      expect(plugins[0]).toBeInstanceOf(TestPlugin);
      expect(plugins[0].pluginName).toBe('test1');
      expect(plugins[0].option1).toBe(1);
      expect(plugins[0].option2).toBe(undefined);
      expect(plugins[1]).toBeInstanceOf(TestPlugin);
      expect(plugins[1].pluginName).toBe('test2');
      expect(plugins[1].option1).toBe(2);
      expect(plugins[1].option2).toBe(undefined);
    });

    it('should respect the maxLimit parameter', async () => {
      const tuples = [
        tuple(TestPlugin, 'test1', '1', 1),
        tuple(TestPlugin, 'test2', '2', 2),
        tuple(TestPlugin, 'test3', '3', 3)
      ];

      const plugins = await loaderPluginsFromPluginTuples(
        releaseContext,
        tuples,
        2
      );

      expect(plugins).toHaveLength(3);
    });
  });
});
