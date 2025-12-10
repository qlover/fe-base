import { useApiLocales } from '@config/common';

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
  let allMessages: Record<string, string>;

  // 如果配置了使用 API 加载本地化数据
  if (useApiLocales) {
    try {
      const app_host = process.env.APP_HOST;
      const localeUrl = `${app_host}/api/locales/json?locale=${locale}`;
      const response = await fetch(localeUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch locale from API: ${response.statusText}`
        );
      }

      allMessages = await response.json();
    } catch (error) {
      console.warn(`Failed to load locale from API for ${locale}`, error);
      // 如果 API 加载失败，继续尝试从文件加载
      allMessages = (await import(`../../public/locales/${locale}.json`)).default;
    }
  } else {
    allMessages = (await import(`../../public/locales/${locale}.json`)).default;
  }

  // 如果指定了命名空间，进行过滤
  return filterMessagesByNamespace(allMessages, namespace);
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