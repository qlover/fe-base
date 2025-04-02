import type { OptionValues } from 'commander';
import set from 'lodash/set';

export function reduceOptions(opts: OptionValues): OptionValues {
  return Object.entries(opts).reduce((acc, [key, value]) => {
    set(acc, key, value);
    return acc;
  }, {});
}
