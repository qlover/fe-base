import { PageParams } from '@/base/cases/PageParams';
import type { PageLayoutProps } from '@/base/types/PageProps';
import '@/styles/css/index.css';

export default async function AdminLayout({
  children,
  params
}: PageLayoutProps) {
  const pageParams = new PageParams(await params!);
  const locale = pageParams.getLocale();

  return (
    <div
      data-testid="AdminRootLayout"
      lang={locale}
      className="min-h-screen bg-primary text-text"
    >
      {children}
    </div>
  );
}
