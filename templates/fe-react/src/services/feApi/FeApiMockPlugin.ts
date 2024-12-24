import {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterFetchConfig
} from 'packages/fe-utils/common';

export class FeApiMockPlugin implements ExecutorPlugin {
  readonly pluginName = 'FeApiMockPlugin';

  onBefore({ parameters }: ExecutorContext<RequestAdapterFetchConfig>) {
    console.log('FeApiMockPlugin onBefore', parameters);
  }
}
