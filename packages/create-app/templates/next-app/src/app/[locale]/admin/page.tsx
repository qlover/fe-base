import { UserTable } from '@/base/server/UserTable';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';

export default async function AdminPage() {
  const server = new BootstrapServer();
  const dbBridge = server.getIOC(UserTable);

  const res = await dbBridge.getAll();
  console.log('res', res);

  return <div data-testid="AdminPage">admin page</div>;
}
