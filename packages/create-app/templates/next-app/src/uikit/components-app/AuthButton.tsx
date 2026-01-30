import { bootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { Link } from '@/i18n/routing';
import { ServerAuth } from '@/server/ServerAuth';
import { ROUTE_LOGIN, ROUTE_REGISTER } from '@config/route';
import { LogoutButton } from './LogoutButton';

export async function AuthButton() {
  const hasAuth = await bootstrapServer.getIOC(ServerAuth).hasAuth();

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
