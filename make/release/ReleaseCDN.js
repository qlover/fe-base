import { Plugin } from '@qlover/fe-release';

export default class ReleaseCDN extends Plugin {
  constructor(options) {
    super(options, 'ReleaseCDN');
  }
  onBefore() {
    console.log('ReleaseCDN onBefore');
  }
  onExec() {
    console.log('ReleaseCDN');
  }
}
