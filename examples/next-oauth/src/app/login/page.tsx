import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * PRD `/login` alias — forwards to the localized auth login page.
 */
export default async function LoginAliasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      if (value[0]) qs.set(key, value[0]);
    } else if (value) {
      qs.set(key, value);
    }
  }
  const query = qs.toString();
  redirect(`/auth/login${query ? `?${query}` : ''}`);
}
