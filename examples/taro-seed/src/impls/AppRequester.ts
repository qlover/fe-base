import { LifecycleExecutor, RequestExecutor } from '@qlover/fe-corekit';
import { EP_LOGIN_WX, EP_LOGOUT, EP_USER_INFO } from '@/config/endpotins';
import { mockData } from '@/config/mockData';
import { logger, seedConfig } from '@/globals';
import { MockPlugin } from './MockPlugin';
import { createTaroRequestAdapter } from '../utils/createTaroRequestAdapter';
import type { TaroRequestAdapterConfig } from '../utils/createTaroRequestAdapter';
import type { ApiMockPluginOptions } from '@qlover/corekit-bridge';
import type { ExecutorContextInterface } from '@qlover/fe-corekit';
import type {
  LoginRequestSchema,
  UserCredentialSchema,
  UserSchema
} from 'types/schemas/UserSchema';

export type AppRequesterConfig = TaroRequestAdapterConfig &
  ApiMockPluginOptions;

export type AppRequesterContext = ExecutorContextInterface<AppRequesterConfig>;

export const appRequester = new RequestExecutor(
  createTaroRequestAdapter({
    baseURL: 'https://api.qlover.com/api'
  }),
  new LifecycleExecutor<AppRequesterContext>()
);

// TODO: 测试用，后续删除
appRequester.use(
  new MockPlugin({
    mockData: mockData,
    logger: logger
  })
);

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
