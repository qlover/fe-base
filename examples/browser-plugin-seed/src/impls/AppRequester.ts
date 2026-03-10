import { logger, seedConfig } from '@/impls/globals';
import {
  EP_USER_INFO,
  EP_USER_LOGIN,
  EP_USER_LOGOUT
} from '@config/endpoints/user';
import { mockData } from '@config/mockData';
import {
  ApiMockPlugin,
  type ApiMockPluginOptions
} from '@qlover/corekit-bridge/request-plugins';
import {
  LifecycleExecutor,
  RequestAdapterFetch,
  RequestExecutor
} from '@qlover/fe-corekit';
import type {
  ExecutorContextInterface,
  RequestAdapterConfig
} from '@qlover/fe-corekit';
import type {
  LoginRequestSchema,
  UserCredentialSchema,
  UserSchema
} from '@schemas/UserSchema';

export type AppRequesterConfig = RequestAdapterConfig & ApiMockPluginOptions;

export type AppRequesterContext = ExecutorContextInterface<AppRequesterConfig>;

export const appRequester = new RequestExecutor(
  new RequestAdapterFetch({
    baseURL: 'https://api.qlover.com/api'
  }),
  new LifecycleExecutor<AppRequesterContext>()
);

// TODO: 测试用，后续删除
appRequester.use(
  new ApiMockPlugin({
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
  const [method, url] = EP_USER_LOGIN.split(' ');
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
  const [method, url] = EP_USER_LOGOUT.split(' ');
  return appRequester.request<void, unknown>({
    method,
    url
  });
}
