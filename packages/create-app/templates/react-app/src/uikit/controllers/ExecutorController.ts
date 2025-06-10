import { FeApi } from '@/base/apis/feApi/FeApi';
import cloneDeep from 'lodash/cloneDeep';
import {
  ExecutorPlugin,
  RequestAdapterResponse,
  RequestAdapterFetchConfig
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';

class ExecutorControllerState implements StoreStateInterface {
  helloState = {
    loading: false,
    result: null as Record<string, unknown> | null,
    error: null as unknown
  };
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
export class ExecutorController extends StoreInterface<ExecutorControllerState> {
  selector = {
    helloState: (state: ExecutorControllerState) => state.helloState
  };

  constructor(@inject(FeApi) private feApi: FeApi) {
    super(ExecutorController.create);

    // FIXME: not cloneDeep, create a new instance
    this.feApi = cloneDeep(feApi);

    this.feApi.usePlugin(TestPlugin);
  }

  static create(): ExecutorControllerState {
    return new ExecutorControllerState();
  }

  onTestPlugins = async () => {
    this.emit({
      ...this.state,
      helloState: {
        loading: true,
        result: null,
        error: null
      }
    });

    try {
      const res = await this.feApi.get('/api/v1/executor/test', {
        responseType: 'text'
      });

      this.emit({
        ...this.state,
        helloState: {
          loading: false,
          result: res,
          error: null
        }
      });
    } catch (error) {
      this.emit({
        ...this.state,
        helloState: {
          loading: false,
          result: null,
          error
        }
      });
    }
  };
}
