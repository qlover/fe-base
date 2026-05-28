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
 * 语言切换时：在客户端挂载完成前渲染固定全屏遮罩，避免未水合内容与最终内容闪烁错位。
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
