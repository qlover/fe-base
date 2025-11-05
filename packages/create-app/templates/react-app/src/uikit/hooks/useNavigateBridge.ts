import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigateBridge } from '../bridges/NavigateBridge';
import { useIOC } from './useIOC';

export function useNavigateBridge() {
  const navigate = useNavigate();
  const navigateBridge = useIOC(NavigateBridge);
  useEffect(() => {
    navigateBridge.setUIBridge(navigate);
  }, [navigate]);
}
