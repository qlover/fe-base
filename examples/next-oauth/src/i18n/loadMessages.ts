import { useApiLocales } from '@config/common';

// Static locale loaders so the bundler can resolve the JSON modules
const localeLoaders: Record<
  string,
  () => Promise<{ default: Record<string, string> }>
> = {
  en: () => import('@locales/en.json'),
  zh: () => import('@locales/zh.json')
};

async function loadLocaleFromFile(
  locale: string
): Promise<Record<string, string>> {
  const loader = localeLoaders[locale];
  if (!loader) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  const mod = await loader();
  const base = mod.default;

  try {
    const nextKitMod =
      locale === 'zh'
        ? await import('@locales/next_kit.zh.json')
        : await import('@locales/next_kit.en.json');
    return { ...base, ...nextKitMod.default };
  } catch {
    return base;
  }
}

/**
 * 加载 i18n 消息的公共方法
 * 支持从 API 加载或从 JSON 文件加载
 *
 * @param locale - 要加载的语言代码
 * @param namespace - 可选的命名空间（单个字符串或字符串数组），如果提供则只返回该命名空间下的消息，保留命名空间前缀
 * @returns Promise<Record<string, string>> 返回翻译消息对象
 *
 * @example
 * ```ts
 * // 加载所有消息
 * const allMessages = await loadMessages('en');
 *
 * // 加载单个命名空间
 * const commonMessages = await loadMessages('en', 'common');
 *
 * // 加载多个命名空间
 * const messages = await loadMessages('en', ['common', 'page_home']);
 * ```
 */
export async function loadMessages(
  locale: string,
  namespace?: string | string[]
): Promise<Record<string, string>> {
  // Always start from this build's generated JSON so SSG cannot bake an empty
  // page namespace when SITE_URL still points at an older deploy (chicken-egg).
  const staticMessages = await loadLocaleFromFile(locale);
  let allMessages: Record<string, string> = staticMessages;

  // 如果配置了使用 API 加载本地化数据：静态为底 + API 覆盖（与 ApiLocaleService 一致）
  if (useApiLocales) {
    try {
      const SITE_URL = process.env.SITE_URL;
      if (!SITE_URL) {
        throw new Error('SITE_URL is not set');
      }

      const localeUrl = new URL(`${SITE_URL}/api/locales/json`);
      localeUrl.searchParams.set('locale', locale);
      const namespacesParam = serializeNamespaces(namespace);
      if (namespacesParam) {
        localeUrl.searchParams.set('namespaces', namespacesParam);
      }

      const response = await fetch(localeUrl.toString());

      if (!response.ok) {
        throw new Error(
          `Failed to fetch locale from API: ${response.statusText}`
        );
      }

      const fromApi = (await response.json()) as Record<string, string>;
      allMessages = { ...staticMessages, ...fromApi };
    } catch (error) {
      console.warn(`Failed to load locale from API for ${locale}`, error);
      allMessages = staticMessages;
    }
  }

  // 如果指定了命名空间，进行过滤
  return filterMessagesByNamespace(allMessages, namespace);
}

function serializeNamespaces(
  namespace?: string | string[]
): string | undefined {
  if (!namespace) {
    return undefined;
  }
  const list = Array.isArray(namespace) ? namespace : [namespace];
  const joined = list
    .map((item) => item.trim())
    .filter(Boolean)
    .join(',');
  return joined || undefined;
}

/**
 * 根据命名空间过滤消息，保留命名空间前缀
 *
 * @param messages - 所有消息对象
 * @param namespace - 可选的命名空间（单个字符串或字符串数组），如果提供则只返回该命名空间下的消息，保留命名空间前缀
 * @returns 过滤后的消息对象
 *
 * @example
 * ```ts
 * const allMessages = { "common:save": "Save", "common:cancel": "Cancel", "page_home:title": "Home" };
 *
 * // 单个命名空间
 * const commonMessages = filterMessagesByNamespace(allMessages, "common");
 * // 返回: { "common:save": "Save", "common:cancel": "Cancel" }
 *
 * // 多个命名空间
 * const messages = filterMessagesByNamespace(allMessages, ["common", "page_home"]);
 * // 返回: { "common:save": "Save", "common:cancel": "Cancel", "page_home:title": "Home" }
 * ```
 */
export function filterMessagesByNamespace(
  messages: Record<string, string>,
  namespace?: string | string[]
): Record<string, string> {
  // 如果没有指定命名空间，返回所有消息
  if (!namespace) {
    return messages;
  }

  // 将单个字符串转换为数组，统一处理
  const namespaces = Array.isArray(namespace) ? namespace : [namespace];
  const filteredMessages: Record<string, string> = {};

  // 遍历所有命名空间
  for (const ns of namespaces) {
    const namespacePrefix = `${ns}:`;

    for (const [key, value] of Object.entries(messages)) {
      if (key.startsWith(namespacePrefix)) {
        // 保留完整的键名（包括命名空间前缀）
        filteredMessages[key] = value;
      }
    }
  }

  return filteredMessages;
}
