'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PageI18nInterface } from '@config/i18n-mapping/PageI18nInterface';

const PageI18nContext = createContext<PageI18nInterface | null>(null);

/**
 * 在服务端组件中传入 `getI18nInterface` 得到的 `tt`，包裹本页客户端子树。
 * 当前实现绑定 `page_home` / {@link homeI18n}；其他命名空间可另建 Provider 或后续泛化。
 */
export function PageI18nProvider({
  children,
  value
}: {
  children: ReactNode;
  readonly value: PageI18nInterface;
}): React.ReactElement {
  return (
    <PageI18nContext.Provider value={value}>
      {children}
    </PageI18nContext.Provider>
  );
}

/**
 * 读取当前页已解析文案；`T` 为期望的文案对象类型（须满足 {@link AppPageI18nResolvedBase}）。
 *
 * 需要传入第二层 i18n-mapping 类型, 比如 HomeI18nInterface
 * ```ts
 * const homeI18n = usePageI18nMapping<HomeI18nInterface>();
 * ```
 *
 * @template T - 继承 {@link PageI18nInterface}，返回值类型即为 `T`
 */
export function usePageI18nMapping<T extends PageI18nInterface>(): T {
  const tt = useContext(PageI18nContext);
  if (tt === null) {
    throw new Error(
      'usePageI18nMapping: 必须在 PageI18nProvider 内使用（例如首页已按 page_home 命名空间解析）'
    );
  }

  return tt as T;
}
