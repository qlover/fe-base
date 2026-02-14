import { TeamOutlined } from '@ant-design/icons';
import { bootstrapServer } from '@/impls/bootstraps/BootstrapServer';
import { ServerAuth } from '@server/ServerAuth';
import { LocaleLink } from '../components/LocaleLink';

export async function AdminButton(props: {
  adminTitle: string;
  locale?: string;
}) {
  const { adminTitle, locale } = props;
  const hasAuth = await bootstrapServer.getIOC(ServerAuth).hasAuth();

  if (!hasAuth) {
    return null;
  }

  return (
    <LocaleLink
      data-testid="AdminButton"
      key="admin-button"
      href="/admin"
      title={adminTitle}
      locale={locale}
      className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
    >
      <TeamOutlined className="text-lg text-text" />
    </LocaleLink>
  );
}
