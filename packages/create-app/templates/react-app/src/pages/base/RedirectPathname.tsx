import { IOC } from '@/core/IOC';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectToDefault = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the default language path
    IOC(IOCIdentifier.RouteServiceInterface).redirectToDefault(navigate);
  }, [navigate]);

  return null;
};

export default RedirectToDefault;
