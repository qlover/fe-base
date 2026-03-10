import Taro from '@tarojs/taro';
import type {
  RequestAdapterConfig,
  RequestAdapterInterface,
  RequestAdapterResponse
} from '@qlover/fe-corekit';

export type TaroRequestAdapterConfig = RequestAdapterConfig;

function isFullUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
function buildUrl(
  url: string,
  baseURL?: string,
  params?: Record<string, unknown>
): string {
  let fullUrl = url;
  if (!isFullUrl(url) && baseURL) {
    const base = baseURL.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    fullUrl = `${base}${path}`;
  }
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        search.append(k, String(v));
      }
    }
    const query = search.toString();
    if (query) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + query;
    }
  }
  return fullUrl;
}

function toAdapterResponse<Req, Res>(
  taroRes: {
    data: Res;
    header: Record<string, unknown>;
    statusCode: number;
    errMsg: string;
  },
  config: RequestAdapterConfig<Req>
): RequestAdapterResponse<Req, Res> {
  const headers = (taroRes.header || {}) as { [key: string]: unknown };
  const nativeResponse = {
    status: taroRes.statusCode,
    statusText: taroRes.errMsg || '',
    ok: taroRes.statusCode >= 200 && taroRes.statusCode < 300,
    headers
  } as unknown as globalThis.Response;
  return {
    data: taroRes.data,
    status: taroRes.statusCode,
    statusText: taroRes.errMsg || '',
    headers,
    config,
    response: nativeResponse
  };
}

export function createTaroRequestAdapter(
  defaultConfig: TaroRequestAdapterConfig
): RequestAdapterInterface<TaroRequestAdapterConfig> {
  const adpater = {
    config: defaultConfig,
    getConfig: function (): TaroRequestAdapterConfig {
      return adpater.config;
    },
    setConfig: function (
      config: TaroRequestAdapterConfig | Partial<TaroRequestAdapterConfig>
    ): void {
      Object.assign(adpater.config, config);
    },
    async request<Request, Response>(
      options: RequestAdapterConfig<Request>
    ): Promise<RequestAdapterResponse<Request, Response>> {
      const merged = {
        ...adpater.config,
        ...options
      } as RequestAdapterConfig<Request>;
      const baseURL = merged.baseURL ?? '';
      const url = buildUrl(merged.url ?? '', baseURL, merged.params);
      const method = (merged.method ?? 'GET') as keyof Taro.request.Method;
      const header: Record<string, string> = {};
      const rawHeaders = { ...merged.headers } as Record<string, unknown>;
      for (const [k, v] of Object.entries(rawHeaders)) {
        if (v !== undefined && v !== null) header[k] = String(v);
      }
      const taroOption: Taro.request.Option<Response, TaroGeneral.IAnyObject> =
        {
          url,
          method,
          data: merged.data as TaroGeneral.IAnyObject,
          header,
          ...(merged.responseType != null && {
            responseType: merged.responseType as keyof Taro.request.ResponseType
          })
        };

      const res = await Taro.request(taroOption);
      return toAdapterResponse(res, merged);
    }
  };

  return adpater;
}
