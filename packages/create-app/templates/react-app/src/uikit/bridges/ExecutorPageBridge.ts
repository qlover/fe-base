import { RequestState } from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import cloneDeep from 'lodash/cloneDeep';
import { FeApi } from '@/base/apis/feApi/FeApi';
import {
  ExecutorPageBridgeInterface,
  ExecutorPageStateInterface
} from '@/base/port/ExecutorPageBridgeInterface';
import type {
  RequestAdapterResponse,
  RequestAdapterFetchConfig,
  LifecyclePluginInterface,
  ExecutorContextInterface
} from '@qlover/fe-corekit';

class ExecutorPageBridgeState implements ExecutorPageStateInterface {
  public helloState = new RequestState();
}

const TestPlugin: LifecyclePluginInterface<
  ExecutorContextInterface<RequestAdapterFetchConfig, unknown>
> = {
  pluginName: 'test',
  async onSuccess({ parameters, returnValue }) {
    if (
      parameters.responseType === 'text' &&
      (returnValue as RequestAdapterResponse).data instanceof Response
    ) {
      (returnValue as RequestAdapterResponse<unknown, string>).data = await (
        returnValue as RequestAdapterResponse<unknown, Response>
      ).data.text();
    }
  }
};

@injectable()
export class ExecutorPageBridge extends ExecutorPageBridgeInterface {
  constructor(@inject(FeApi) protected feApi: FeApi) {
    super(() => new ExecutorPageBridgeState());

    // FIXME: not cloneDeep, create a new instance
    this.feApi = cloneDeep(feApi);

    this.feApi.use({
      pluginName: 'test',
      onSuccess: TestPlugin.onSuccess
    });
  }

  public override onTestPlugins = async () => {
    this.emit({
      ...this.state,
      helloState: new RequestState(true)
    });

    try {
      const res = await this.feApi.get('/api/v1/executor/test', {
        responseType: 'text'
      });

      this.emit({
        ...this.state,
        helloState: new RequestState(false, res).end()
      });
    } catch (error) {
      this.emit({
        ...this.state,
        helloState: new RequestState(false, null, error).end()
      });
    }
  };
}
