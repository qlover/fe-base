import {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterFetchConfig
} from '@qlover/fe-utils';

export class FeApiMockPlugin implements ExecutorPlugin {
  readonly pluginName = 'FeApiMockPlugin';

  onBefore({ parameters }: ExecutorContext<RequestAdapterFetchConfig>): void {
    console.log('FeApiMockPlugin onBefore', parameters);
  }
}
