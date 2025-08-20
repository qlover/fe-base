import { IOC } from '@/core/IOC';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigateBridge } from '../bridges/NavigateBridge';

export function useNavigateBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    IOC(NavigateBridge).setUIBridge(navigate);
  }, [navigate]);
}
