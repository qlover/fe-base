import { FeApi } from '@/base/apis/feApi/FeApi';
import cloneDeep from 'lodash/cloneDeep';
import {
  ExecutorPlugin,
  RequestAdapterResponse,
  RequestAdapterFetchConfig
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import {
  ExecutorPageBridgeInterface,
  ExecutorPageStateInterface
} from '@/base/port/ExecutorPageBridgeInterface';
import { RequestState } from '@qlover/corekit-bridge';

class ExecutorPageBridgeState implements ExecutorPageStateInterface {
  helloState = new RequestState();
}

const TestPlugin: ExecutorPlugin<RequestAdapterFetchConfig> = {
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

    this.feApi.usePlugin(TestPlugin);
  }

  override onTestPlugins = async () => {
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
