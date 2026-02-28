import { redirect } from 'next/navigation';
import { ROUTE_LOGIN } from '@config/route';

export default async function AuthRootPage() {
  redirect(ROUTE_LOGIN);
}
