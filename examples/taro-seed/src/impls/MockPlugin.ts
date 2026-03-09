import { ApiMockPlugin } from '@qlover/corekit-bridge';
import type { ApiMockPluginConfig } from '@qlover/corekit-bridge';

/**
 * 小程序无全局 Response，返回普通对象以兼容 RequestAdapterResponse.response。
 * 仅实现桥接实际用到的字段（status / statusText / ok / headers），并带 json() 以备调用。
 */
function createMockResponseBody(config: ApiMockPluginConfig): {
  status: number;
  statusText: string;
  ok: boolean;
  headers: Record<string, string>;
  json(): Promise<unknown>;
} {
  const data = config as unknown as Record<string, unknown>;
  return {
    status: 200,
    statusText: 'OK(Mock)',
    ok: true,
    headers: {},
    json() {
      return Promise.resolve(data);
    }
  };
}

export class MockPlugin extends ApiMockPlugin {
  protected override createMockResponse(config: ApiMockPluginConfig): Response {
    return createMockResponseBody(config) as unknown as Response;
  }
}
