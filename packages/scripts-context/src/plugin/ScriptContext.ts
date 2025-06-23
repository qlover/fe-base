import { FeScriptContext } from '../implement/ScriptContext';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Env } from '@qlover/env-loader';
import { ScriptShared } from './ScriptShared';

const DEFAULT_ENV_ORDER = ['.env.local', '.env'];

type StoreType = Record<string, unknown>;

export default class ScriptContext<
  Opt extends ScriptShared
> extends FeScriptContext<Opt> {
  /**
   * 插件保存数据中心
   */
  protected store: StoreType;

  constructor(opts: Partial<FeScriptContext<Opt>> = {}) {
    super(opts);
    const { feConfig, options } = this;
    const { rootPropName } = options;

    // don't use deep merge, because the shared options will be overwritten by the default options
    this.store = this.getDefaultStore(rootPropName!, feConfig);

    // set default options
    this.setOptions(this.getDefaultOptions(options));
  }

  get env(): Env {
    if (!this.options.env) {
      throw new Error('Environment is not initialized');
    }
    return this.options.env;
  }

  protected getDefaultStore(
    rootPropName: string | string[],
    feConfig: Record<string, unknown>
  ): StoreType {
    // set context props
    const rootProp = rootPropName ? get(feConfig, rootPropName) : feConfig;
    // Handle case where rootProp is a primitive value
    const isObject = typeof rootProp === 'object' && rootProp !== null;
    const rootPropObject = isObject ? rootProp : {};
    if (!isObject) {
      this.logger.warn(
        `rootProp ${rootPropName} is not an object, it will be overwritten by the default options`
      );
    }

    return rootPropObject as StoreType;
  }

  protected getDefaultOptions(options: Opt): Opt {
    const env = this.options.env;
    const rootPath = options.rootPath || process.cwd();
    const sourceBranch =
      options.sourceBranch ||
      env?.get('FE_RELEASE_BRANCH') ||
      env?.get('FE_RELEASE_SOURCE_BRANCH') ||
      'master';

    const defaultOptions = {
      ...options,
      // use currentBranch by default
      sourceBranch,
      rootPath,
      env:
        env ||
        Env.searchEnv({
          logger: this.logger,
          preloadList: this.feConfig.envOrder || DEFAULT_ENV_ORDER
        })
    };

    return defaultOptions;
  }

  setOptions(options: Partial<Opt>): void {
    this.options = merge(this.options, options);
  }

  getEnv(key: string, defaultValue?: string): string | undefined {
    return this.env.get(key) ?? defaultValue;
  }

  setStore(config: Partial<Opt>): void {
    this.store = merge(this.store, config);
  }

  getStore<T = unknown>(key?: string | string[], defaultValue?: T): T {
    if (!key) {
      return this.store as T;
    }

    return get(this.store, key, defaultValue);
  }
}
