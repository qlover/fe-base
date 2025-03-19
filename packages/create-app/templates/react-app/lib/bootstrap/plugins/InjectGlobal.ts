import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '../BootstrapExecutorPlugin';

export class InjectGlobal implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectGlobal';

  constructor(
    private sources: Record<string, unknown>,
    private target?: string | Record<string, unknown>
  ) {}

  onBefore(context: BootstrapContext): void {
    // if target is provided, inject globals to target
    if (typeof this.target === 'string') {
      Object.assign(context.parameters.root!, {
        [this.target]: Object.freeze(Object.assign({}, this.sources))
      });
      return;
    }

    const target = this.target || context.parameters.root;

    if (typeof target !== 'object' || target === null) {
      throw new Error('target must be an object');
    }

    // inject globals to root
    for (const key in this.sources) {
      const element = this.sources[key];
      Object.assign(target, { [key]: element });
    }
  }

  onSuccess({ parameters: { logger } }: BootstrapContext): void {
    logger.debug(
      `InjectGlobal success! You can use \`window.${this.target}\` to access the globals`
    );
  }
}
