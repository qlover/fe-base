'use client';

import { useMemo } from 'react';
import { appConfig } from '@/core/globals';
import { clientIOC, IOCContext, IOCInstance } from '../context/IOCContext';

export function IOCProvider(props: { children: React.ReactNode }) {
  /**
   * 加载组件就立即注册
   *
   * 这样在渲染子组件时保证 IOC.get 正常工作
   *
   * 但是这样会导致注册时无法传递浏览器端的依赖, 比如 window.location.pathname
   *
   * - 如果有需要，可以将注册放在下面 useStrictEffect 中, 然后 IocMounted=true 时在渲染子节点
   *
   * **但是这样会有一个问题, 组件会重新挂载渲染，当切换语言时会闪烁**
   *
   * 因为页面初始化时有些组件可能已经使用了容器注入，这样就会丢失注册的依赖
   *
   * TODO: 这是一个需要解决的问题
   */
  useMemo(() => {
    clientIOC.register({
      appConfig: appConfig
    });
  }, []);

  return (
    <IOCContext.Provider value={IOCInstance}>
      {props.children}
    </IOCContext.Provider>
  );
}
