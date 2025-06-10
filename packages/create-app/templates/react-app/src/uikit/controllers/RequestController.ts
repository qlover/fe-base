import { inject, injectable } from 'inversify';
import { FeApi } from '@/base/apis/feApi/FeApi';
import { logger } from '@/core/globals';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { aiHello } from '@/base/apis/AiApi';
import { StoreInterface } from '@/base/port/StoreInterface';

function createDefaultState() {
  return {
    helloState: {
      loading: false,
      result: null as unknown,
      error: null as unknown
    },
    ipInfoState: {
      loading: false,
      result: null as unknown,
      error: null as unknown
    },
    randomUserState: {
      loading: false,
      result: null as unknown,
      error: null as unknown
    },
    abortState: {
      loading: false,
      result: null as unknown,
      error: null as unknown
    },
    apiCatchResultState: {
      loading: false,
      result: null as unknown,
      error: null as unknown
    }
  };
}

export type RequestControllerState = ReturnType<typeof createDefaultState>;

@injectable()
export class RequestController extends StoreInterface<RequestControllerState> {
  constructor(
    @inject(FeApi) private readonly feApi: FeApi,
    @inject(UserApi) private readonly userApi: UserApi
  ) {
    super(createDefaultState);
  }

  setState(state: Partial<RequestControllerState>): void {
    this.emit({ ...this.state, ...state });
  }

  onHello = async () => {
    if (this.state.helloState.loading) {
      return;
    }

    this.setState({ helloState: { loading: true, result: '', error: null } });

    try {
      const result = await aiHello({
        messages: [{ role: 'user', content: 'Hello, world!' }]
      });
      this.setState({ helloState: { loading: false, result, error: null } });
    } catch (error) {
      logger.error(error);
      this.setState({ helloState: { loading: false, result: null, error } });
    }
  };

  onIpInfo = async () => {
    if (this.state.ipInfoState.loading) {
      return;
    }

    this.setState({
      ipInfoState: { loading: true, result: null, error: null }
    });

    try {
      const result = await this.feApi.getIpInfo();
      this.setState({ ipInfoState: { loading: false, result, error: null } });
    } catch (error) {
      logger.error(error);
      this.setState({ ipInfoState: { loading: false, result: null, error } });
    }
  };

  onRandomUser = async () => {
    if (this.state.randomUserState.loading) {
      return;
    }

    this.setState({
      randomUserState: { loading: true, result: null, error: null }
    });
    try {
      const result = await this.userApi.getRandomUser();
      this.setState({
        randomUserState: { loading: false, result, error: null }
      });
    } catch (error) {
      logger.error(error);
      this.setState({
        randomUserState: { loading: false, result: null, error }
      });
    }
  };

  onTriggerApiCatchResult = async () => {
    if (this.state.apiCatchResultState.loading) {
      return;
    }

    this.setState({
      apiCatchResultState: { loading: true, result: null, error: null }
    });
    try {
      const result = await this.userApi.testApiCatchResult();
      this.setState({
        apiCatchResultState: {
          loading: false,
          result,
          error: result.apiCatchResult
        }
      });
    } catch (error) {
      this.setState({
        apiCatchResultState: { loading: false, result: null, error }
      });
    }
  };

  onTriggerAbortRequest = async () => {
    if (this.state.abortState.loading) {
      this.stopAbortRequest();
      return;
    }

    this.setState({ abortState: { loading: true, result: null, error: null } });
    try {
      await this.userApi.request({
        method: 'GET',
        url: 'https://api.example.com/users',
        disabledMock: true,
        requestId: 'onTriggerAbortRequest'
      });
    } catch (error) {
      this.setState({ abortState: { loading: false, result: null, error } });
    }
  };

  stopAbortRequest = async () => {
    this.userApi.stop({
      requestId: 'onTriggerAbortRequest'
    });
  };
}
