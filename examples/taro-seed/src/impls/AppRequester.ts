import { LifecycleExecutor } from '@qlover/fe-corekit/executor';
import { RequestExecutor } from '@qlover/fe-corekit/request';
import { EP_LOGIN_WX, EP_LOGOUT, EP_USER_INFO } from '@/config/endpotins';
import { logger, seedConfig } from '@/globals';
import type {
  LoginRequestSchema,
  UserCredentialSchema,
  UserSchema
} from '@schemas/UserSchema';
import { createTaroRequestAdapter } from '../utils/createTaroRequestAdapter';
import type { TaroRequestAdapterConfig } from '../utils/createTaroRequestAdapter';
import type { ApiMockPluginOptions } from '@qlover/corekit-bridge';
import type { ExecutorContextInterface } from '@qlover/fe-corekit';

export type AppRequesterConfig = TaroRequestAdapterConfig &
  ApiMockPluginOptions;

export type AppRequesterContext = ExecutorContextInterface<AppRequesterConfig>;

export const appRequester = new RequestExecutor(
  createTaroRequestAdapter({
    baseURL: 'https://api.qlover.com/api'
  }),
  new LifecycleExecutor<AppRequesterContext>()
);

if (!seedConfig.isProduction) {
  void import('./MockPlugin').then(({ MockPlugin }) =>
    import('@/config/mockData').then(({ mockData }) => {
      // ApiMockPlugin context is wider than AppRequesterContext; cast for use().
      appRequester.use(
        new MockPlugin({
          mockData,
          logger
        }) as never
      );
    })
  );
}

export function fetchIpinfo() {
  return appRequester.get('https://api.ipify.org?format=json', {
    disabledMock: true
  });
}

export function fetchWxLogin(code: string) {
  const [method, url] = EP_LOGIN_WX.split(' ');
  return appRequester.request<UserCredentialSchema, LoginRequestSchema>({
    method,
    url,
    data: {
      code
    }
  });
}

export function fetchUserInfo(access_token: string) {
  const [method, url] = EP_USER_INFO.split(' ');
  return appRequester.request<UserSchema, unknown>({
    method,
    url,
    headers: {
      Authorization: seedConfig.authType + ' ' + access_token
    }
  });
}

export function fetchLogout() {
  const [method, url] = EP_LOGOUT.split(' ');
  return appRequester.request<void, unknown>({
    method,
    url
  });
}
