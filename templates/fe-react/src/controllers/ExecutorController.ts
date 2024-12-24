import { OpenAIClient } from '@lib/openAiApi/OpenAIClient';
import { BaseController } from './BaseController';
import { logger } from '@/container';
import { FeApi } from '@/services';
import { cloneDeep } from 'lodash';
import {
  ExecutorPlugin,
  RequestAdapterResponse
} from 'packages/fe-utils/interface';
import { RequestAdapterFetchConfig } from 'packages/fe-utils/common';

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
      (returnValue as RequestAdapterResponse<any, string>).data = await (
        returnValue as RequestAdapterResponse<any, Response>
      ).data.text();
    }
  }
};

export class ExecutorController extends BaseController<ExecutorControllerState> {
  private feApi: FeApi;

  constructor(feApi: FeApi) {
    super(createDefaultState());

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
