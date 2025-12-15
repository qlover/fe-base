import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '../BootstrapExecutorPlugin';

export interface InjectGlobalConfig {
  sources: Record<string, unknown>;

  /**
   * If target is string, will be append to plugin context root
   * If target is object, will be inject to target
   */
  target?: string | Record<string, unknown>;
}

export class InjectGlobal implements BootstrapExecutorPlugin {
  public readonly pluginName = 'InjectGlobal';

  constructor(protected config: InjectGlobalConfig) {}

  public onBefore(context: BootstrapContext): void {
    const { sources, target } = this.config;
    // if target is provided, inject globals to target
    if (typeof target === 'string') {
      Object.assign(context.parameters.root!, {
        [target]: Object.freeze(Object.assign({}, sources))
      });
      return;
    }

    const _target = target || context.parameters.root;

    if (typeof _target !== 'object' || _target === null) {
      throw new Error('target must be an object');
    }

    // inject globals to root
    for (const key in sources) {
      const element = sources[key];
      Object.assign(_target, { [key]: element });
    }
  }
}
