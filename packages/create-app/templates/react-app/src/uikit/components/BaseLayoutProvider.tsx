import { useStore } from '@brain-toolkit/react-kit';
import { I } from '@config/IOCIdentifier';
import { BaseLayoutService } from '@/base/services/BaseLayoutService';
import { Loading } from './Loading';
import { useIOC } from '../hooks/useIOC';
import { useNavigateBridge } from '../hooks/useNavigateBridge';
import { useRouterI18nGuard } from '../hooks/useRouterI18nGuard';
import { useStrictEffect } from '../hooks/useStrictEffect';

/**
 * BaseLayoutProvider
 *
 * /pages/base/Layout.tsx 布局组件的服务提供者
 *
 * - 验证用户信息渲染组件，如果用户未登录则渲染 loading
 *
 * @param children - The children to render
 * @returns
 */
export function BaseLayoutProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const ioc = useIOC();
  const baseLayoutService = ioc(BaseLayoutService);
  const userService = ioc(I.UserServiceInterface);

  useStore(userService.getStore());

  useRouterI18nGuard();

  useNavigateBridge();

  useStrictEffect(() => {
    baseLayoutService.use(ioc(I.I18nKeyErrorPlugin)).starup(ioc);
  }, []);

  if (!userService.isAuthenticated()) {
    return <Loading data-testid="BaseLayoutProviderLoading" fullscreen />;
  }

  return children;
}
