import { FeScriptContext } from '@qlover/scripts-context';
import merge from 'lodash/merge';
import get from 'lodash/get';

export default class ScriptContext<T> extends FeScriptContext<T> {
  constructor(context: Partial<FeScriptContext<T>>) {
    super(context);
  }

  setConfig(config: Partial<T>): void {
    this.options = merge(this.options, config);
  }

  getConfig<T = unknown>(key: string | string[], defaultValue?: T): T {
    return get(this.options, key, defaultValue);
  }
}
