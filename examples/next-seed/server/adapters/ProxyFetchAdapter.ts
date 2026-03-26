import {
  RequestAdapterFetch,
  type RequestAdapterFetchConfig
} from '@qlover/fe-corekit';
import HttpsProxyAgentImport from 'https-proxy-agent';
import nodeFetch from 'node-fetch';
import type { RequestInit as NodeFetchRequestInit } from 'node-fetch';
import type { Agent } from 'node:http';

/**
 * Node-only fetch with HTTP(S) CONNECT proxy. Uses `node-fetch` + `https-proxy-agent`
 * so Next.js does not bundle `undici` (avoids incomplete installs / Turbopack resolution issues).
 */
const HttpsProxyAgent = HttpsProxyAgentImport as unknown as new (
  uri: string
) => Agent;

/**
 * `node-fetch@2` expects a string URL; passing a native `Request` can yield
 * "Only absolute URLs are supported" with Next’s Request implementation.
 */
function toAbsoluteUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

function createProxyFetcher(proxyUrl?: string | null): typeof fetch {
  const trimmed = proxyUrl?.trim();
  if (!trimmed) {
    return globalThis.fetch.bind(globalThis);
  }
  const agent = new HttpsProxyAgent(trimmed);
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = toAbsoluteUrl(input);
    if (input instanceof Request) {
      // `RequestAdapterFetch.parametersToRequest` uses `new Request(..., { body: data })`.
      // In Node, a string body becomes a Web ReadableStream. Passing that stream through to
      // `node-fetch` can break the payload (e.g. upstream sees "[object ReadableStream]").
      // Buffer the body so `node-fetch` receives a Node-compatible body.
      const bodyBuf =
        input.body != null ? Buffer.from(await input.arrayBuffer()) : undefined;
      const opts = {
        method: input.method,
        headers: input.headers,
        body: bodyBuf,
        signal: input.signal,
        agent
      } as unknown as NodeFetchRequestInit;
      return nodeFetch(url, opts) as unknown as Promise<Response>;
    }
    const opts = { ...(init ?? {}), agent } as NodeFetchRequestInit;
    return nodeFetch(url, opts) as unknown as Promise<Response>;
  }) as typeof fetch;
}

export type ProxyFetchAdapterConfig<Request = unknown> = Partial<
  RequestAdapterFetchConfig<Request>
> & {
  /** HTTP(S) proxy URL, e.g. `http://127.0.0.1:7890`. If empty, uses global fetch (no proxy). */
  proxyUrl?: string;
};

/**
 * {@link RequestAdapterFetch} with optional HTTP(S) proxy (`node-fetch` + `https-proxy-agent`).
 * Instantiate with `new ProxyFetchAdapter({ proxyUrl, ... })` or inject a factory that builds it from config.
 * Server-only — do not import from client bundles.
 */
export class ProxyFetchAdapter extends RequestAdapterFetch {
  constructor(config?: ProxyFetchAdapterConfig) {
    const { proxyUrl, ...rest } = config ?? {};
    super({
      ...rest,
      fetcher: createProxyFetcher(proxyUrl)
    });
  }
}
