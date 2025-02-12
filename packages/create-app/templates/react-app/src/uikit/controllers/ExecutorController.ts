import { FeController } from '@lib/fe-react-controller';
import { FeApi } from '@/base/apis/feApi';
import cloneDeep from 'lodash/cloneDeep';
import {
  ExecutorPlugin,
  RequestAdapterResponse,
  RequestAdapterFetchConfig
} from '@qlover/fe-utils';

function createDefaultState() {
  return {
    helloState: {
      loading: false,
      result: null as unknown,
      error: null as unknown
    }
  };
}

export type ExecutorControllerState = ReturnType<typeof createDefaultState>;

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

export class ExecutorController extends FeController<ExecutorControllerState> {
  private feApi: FeApi;

  constructor(feApi: FeApi) {
    super(createDefaultState);

    this.feApi = cloneDeep(feApi);

    this.feApi.usePlugin(TestPlugin);
  }

  onTestPlugins = async () => {
    console.log('onTestPlugins');

    const res = await this.feApi.get('/api/v1/executor/test', {
      responseType: 'text'
    });

    console.log('res', res);
  };
}
