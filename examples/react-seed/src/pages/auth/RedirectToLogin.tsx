import { Navigate } from 'react-router-dom';

/**
 * Redirects from auth layout index (/:lng) to /:lng/login so login has a distinct path.
 */
export default function RedirectToLogin() {
  return <Navigate to="login" replace />;
}
