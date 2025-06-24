import { ScriptPlugin } from '@qlover/scripts-context';
import Code2MDContext from '../implments/Code2MDContext';

export class Formats extends ScriptPlugin<Code2MDContext> {
  constructor(context: Code2MDContext) {
    super(context, 'Formats');
  }

  async onBefore(): Promise<void> {
    this.logger.info(this.context.options.formatProject);
  }
}
