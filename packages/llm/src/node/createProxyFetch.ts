import { ProxyAgent, fetch as undiciFetch } from 'undici';

/**
 * Node 专用：带 HTTP(S) 代理的 fetch。
 * 未配置 proxyUrl 时退回 `globalThis.fetch`。
 *
 * 依赖可选包 `undici`（Node 18+ 通常已带；未安装时调用方需先安装）。
 */
export function createProxyFetch(
  proxyUrl?: string | null
): typeof globalThis.fetch {
  const trimmed = proxyUrl?.trim();
  if (!trimmed) {
    return globalThis.fetch.bind(globalThis);
  }
  const agent = new ProxyAgent(trimmed);
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    return undiciFetch(input as string | URL, {
      ...(init as object),
      dispatcher: agent
    }) as unknown as Promise<Response>;
  }) as typeof globalThis.fetch;
}
