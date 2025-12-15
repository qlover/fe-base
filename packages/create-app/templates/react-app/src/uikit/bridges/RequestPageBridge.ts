import { IOCIdentifier } from '@config/IOCIdentifier';
import { RequestState } from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { aiHello } from '@/base/apis/AiApi';
import { FeApi } from '@/base/apis/feApi/FeApi';
import { UserApi } from '@/base/apis/userApi/UserApi';
import {
  RequestPageBridgeInterface,
  RequestPageStateInterface
} from '@/base/port/RequestPageBridgeInterface';
import type { LoggerInterface } from '@qlover/logger';

function createDefaultState(): RequestPageStateInterface {
  return {
    helloState: new RequestState(),
    ipInfoState: new RequestState(),
    randomUserState: new RequestState(),
    abortState: new RequestState(),
    apiCatchResultState: new RequestState()
  };
}

export type RequestControllerState = ReturnType<typeof createDefaultState>;

@injectable()
export class RequestPageBridge extends RequestPageBridgeInterface {
  constructor(
    @inject(FeApi) protected feApi: FeApi,
    @inject(UserApi) protected userApi: UserApi,
    @inject(IOCIdentifier.Logger) protected logger: LoggerInterface
  ) {
    super(createDefaultState);
  }

  public override onHello = async () => {
    if (this.state.helloState.loading) {
      return;
    }

    this.emitState({ helloState: new RequestState(true) });

    try {
      const result = await aiHello({
        messages: [{ role: 'user', content: 'Hello, world!' }]
      });
      this.emitState({ helloState: new RequestState(false, result).end() });
    } catch (error) {
      this.logger.error(error);
      this.emitState({
        helloState: new RequestState(false, null, error).end()
      });
    }
  };

  public override onIpInfo = async () => {
    if (this.state.ipInfoState.loading) {
      return;
    }

    this.emitState({ ipInfoState: new RequestState(true) });

    try {
      const result = await this.feApi.getIpInfo();
      this.emitState({ ipInfoState: new RequestState(false, result).end() });
    } catch (error) {
      this.logger.error(error);
      this.emitState({
        ipInfoState: new RequestState(false, null, error).end()
      });
    }
  };

  public override onRandomUser = async () => {
    if (this.state.randomUserState.loading) {
      return;
    }

    this.emitState({ randomUserState: new RequestState(true) });
    try {
      const result = await this.userApi.getRandomUser();
      this.emitState({
        randomUserState: new RequestState(false, result).end()
      });
    } catch (error) {
      this.logger.error(error);
      this.emitState({
        randomUserState: new RequestState(false, null, error).end()
      });
    }
  };

  public override onTriggerApiCatchResult = async () => {
    if (this.state.apiCatchResultState.loading) {
      return;
    }

    this.emitState({ apiCatchResultState: new RequestState(true) });
    try {
      const result = await this.userApi.testApiCatchResult();
      this.emitState({
        apiCatchResultState: new RequestState(false, result).end()
      });
    } catch (error) {
      this.emitState({
        apiCatchResultState: new RequestState(false, null, error).end()
      });
    }
  };

  public override onTriggerAbortRequest = async () => {
    if (this.state.abortState.loading) {
      this.stopAbortRequest();
      return;
    }

    this.emitState({ abortState: new RequestState(true) });
    try {
      await this.userApi.request({
        method: 'GET',
        url: 'https://api.example.com/users',
        disabledMock: true,
        requestId: 'onTriggerAbortRequest'
      });
    } catch (error) {
      this.emitState({
        abortState: new RequestState(false, null, error).end()
      });
    }
  };

  public override stopAbortRequest = async () => {
    this.userApi.stop({
      requestId: 'onTriggerAbortRequest'
    });
  };
}
