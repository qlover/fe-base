import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectToDefault = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the default language path
    navigate('/en', { replace: true });
  }, [navigate]);

  return null;
};

export default RedirectToDefault;
