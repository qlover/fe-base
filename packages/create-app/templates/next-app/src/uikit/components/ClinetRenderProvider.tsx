'use client';

import { useMountedClient } from '@brain-toolkit/react-kit';

export interface ClinetRenderProviderProps {
  children: React.ReactNode;
}

/**
 * ClinetRenderProvider is a provider for the client components
 *
 *
 * 当前组件仅用于需要客户端渲染的组件, 比如 adminLayout 等完全客户端渲染的组件
 *
 *
 * @param children - The children components
 * @returns
 */
export function ClinetRenderProvider(props: ClinetRenderProviderProps) {
  const { children } = props;

  const mounted = useMountedClient();

  return (
    <>
      {children}

      {/* 为了防止语言切换时页面闪烁, 使用一个固定定位的div, 当客户端渲染时才渲染 */}
      {!mounted && (
        <div
          role="status"
          aria-label="Loading..."
          aria-busy="true"
          style={{
            zIndex: '99999 !important'
          }}
          className="fixed inset-0 overflow-hidden cursor-wait no-scrollbar bg-primary pointer-events-none"
        ></div>
      )}
    </>
  );
}
