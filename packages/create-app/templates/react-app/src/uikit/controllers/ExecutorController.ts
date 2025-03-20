import { FeController } from '@lib/fe-react-controller';
import { FeApi } from '@/base/apis/feApi/FeApi';
import cloneDeep from 'lodash/cloneDeep';
import {
  ExecutorPlugin,
  RequestAdapterResponse,
  RequestAdapterFetchConfig
} from '@qlover/fe-utils';
import { inject, injectable } from 'inversify';

class ExecutorControllerState {
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
export class ExecutorController extends FeController<ExecutorControllerState> {
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
    this.setState({
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

      this.setState({
        helloState: {
          loading: false,
          result: res,
          error: null
        }
      });
    } catch (error) {
      this.setState({
        helloState: {
          loading: false,
          result: null,
          error
        }
      });
    }
  };
}
