'use strict';

import TsClassMethodReturn from './TsClassMethodReturn.js';

export const configs = {
  recommended: {
    plugins: ['fe-dev'],
    rules: {
      'fe-dev/ts-class-method-return': 'error'
    }
  }
};

export const rules = {
  'ts-class-method-return': TsClassMethodReturn
};
