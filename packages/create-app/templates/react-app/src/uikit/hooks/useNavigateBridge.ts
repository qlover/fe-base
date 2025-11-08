import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIOC } from './useIOC';
import { NavigateBridge } from '../bridges/NavigateBridge';

export function useNavigateBridge() {
  const navigate = useNavigate();
  const navigateBridge = useIOC(NavigateBridge);
  useEffect(() => {
    navigateBridge.setUIBridge(navigate);
  }, [navigate]);
}
