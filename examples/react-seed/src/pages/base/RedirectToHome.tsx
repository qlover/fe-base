import { Navigate } from 'react-router-dom';

/**
 * Redirects from main layout's login/register paths to the layout index (home).
 * Used when user is already logged in and hits /login or /register with main routes active.
 */
export default function RedirectToHome() {
  return <Navigate to=".." replace />;
}
