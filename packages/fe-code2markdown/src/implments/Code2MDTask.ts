import { AsyncExecutor } from '@qlover/fe-corekit';
import Code2MDContext, { Code2MDContextOptions } from './Code2MDContext';
import TypeDocJson from '../plugins/typeDocs';
import { Reader } from '../plugins/reader';
import { Formats } from '../plugins/formats';

export class Code2MDTask {
  protected context: Code2MDContext;

  constructor(
    options: Code2MDContextOptions,
    private executor: AsyncExecutor = new AsyncExecutor()
  ) {
    this.context = new Code2MDContext(options);

    [
      new Reader(this.context),
      new TypeDocJson(this.context),
      new Formats(this.context)
    ].forEach((plugin) => {
      this.executor.use(plugin);
    });
  }

  async run(): Promise<unknown> {
    return this.executor.exec(this.context, (context) =>
      Promise.resolve(context)
    );
  }

  async exec(): Promise<unknown> {
    return this.run();
  }
}
