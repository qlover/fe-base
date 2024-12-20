import { AiApi } from '../services';
import { BaseController } from './BaseController';

function createDefaultState() {
  return {
    helloState: {
      loading: false,
      result: null as unknown,
      error: null
    }
  };
}

export type RequestControllerState = ReturnType<typeof createDefaultState>;

export class RequestController extends BaseController<RequestControllerState> {
  constructor(private readonly aiApi: AiApi) {
    super(createDefaultState());
  }

  onHello = async () => {
    this.setState({ helloState: { loading: true, result: '', error: null } });

    const result = await this.aiApi.hello();

    this.setState({ helloState: { loading: false, result, error: null } });
  }
}
