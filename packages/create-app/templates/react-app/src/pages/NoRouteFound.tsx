import { Navigate } from 'react-router-dom';

export default function NoRouteFound() {
  return <Navigate data-testid="NoRouteFound" to="/404" replace />;
}
