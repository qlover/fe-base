import { OpenAIClient } from '@lib/openAiApi/OpenAIClient';
import { FeController } from '@lib/fe-react-controller';
import { FeApi } from '@/base/apis/feApi/FeApi';
import { logger } from '@/core/globals';
import { UserApi } from '@/base/apis/userApi/UserApi';

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
    }
  };
}

export type RequestControllerState = ReturnType<typeof createDefaultState>;

export class RequestController extends FeController<RequestControllerState> {
  constructor(
    private readonly aiApi: OpenAIClient,
    private readonly feApi: FeApi,
    private readonly userApi: UserApi
  ) {
    super(createDefaultState);
  }

  onHello = async () => {
    this.setState({ helloState: { loading: true, result: '', error: null } });

    try {
      const result = await this.aiApi.completion({
        messages: [{ role: 'user', content: 'Hello, world!' }]
      });
      this.setState({ helloState: { loading: false, result, error: null } });
    } catch (error) {
      logger.error(error);
      this.setState({ helloState: { loading: false, result: null, error } });
    }
  };

  onIpInfo = async () => {
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
        disabledMock: true
      });
    } catch (error) {
      this.setState({ abortState: { loading: false, result: null, error } });
    }
  };

  stopAbortRequest = async () => {
    this.userApi.stop({ disabledMock: true, method: 'GET', url: 'https://api.example.com/users' });
  };
}
