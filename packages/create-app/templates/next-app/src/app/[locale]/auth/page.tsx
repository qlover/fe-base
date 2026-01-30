import { redirect } from 'next/navigation';
import { ROUTE_LOGIN } from '@config/route';

export default async function AuthRootPage() {
  console.log('AuthRootPage redirect to login page');

  redirect(ROUTE_LOGIN);
}
