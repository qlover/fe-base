import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIOC } from './useIOC';
import { NavigateBridge } from '../bridges/NavigateBridge';

/**
 * 使用 navigate 桥接
 *
 * 将 navigate 桥接到 NavigateBridge 中
 *
 * 这样就可以在服务层使用 navigate 了， 比如在某个service中需要跳转页面，就可以使用 navigateBridge.getUIBridge() 来跳转
 *
 * **但是它需要在 RouterProvider 中使用**
 */
export function useNavigateBridge() {
  const navigate = useNavigate();
  const navigateBridge = useIOC(NavigateBridge);
  useEffect(() => {
    navigateBridge.setUIBridge(navigate);
  }, [navigate]);
}
