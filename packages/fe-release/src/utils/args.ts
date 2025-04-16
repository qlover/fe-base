import type { OptionValues } from 'commander';
import set from 'lodash/set';

export function reduceOptions(
  opts: OptionValues,
  commonKey?: string
): OptionValues {
  return Object.entries(opts).reduce((acc, [key, value]) => {
    if (key.includes('.')) {
      set(acc, key, value);
    } else {
      set(acc, commonKey ? `${commonKey}.${key}` : key, value);
    }

    return acc;
  }, {});
}
