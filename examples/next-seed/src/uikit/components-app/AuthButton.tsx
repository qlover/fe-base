import { Link } from '@/i18n/routing';
import { ROUTE_LOGIN, ROUTE_REGISTER } from '@config/route';
import { ServerAuth } from '@server/ServerAuth';
import { createServerIoc } from '@server/serverIoc';
import { LogoutButton } from './LogoutButton';

export async function AuthButton() {
  const IOC = createServerIoc();
  const hasAuth = await IOC(ServerAuth).hasAuth();

  if (hasAuth) {
    return <LogoutButton data-testid="logout-button" />;
  }

  return (
    <div data-testid="AuthButton" className="flex gap-2" data-auth={hasAuth}>
      <Link href={ROUTE_LOGIN}>Sign in</Link>
      <Link href={ROUTE_REGISTER}>Sign up</Link>
    </div>
  );
}
