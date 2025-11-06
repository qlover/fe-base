import { PageI18nInterface } from '@config/i18n/PageI18nInterface';
import { useBaseRoutePage } from '../contexts/BaseRouteContext';
import { ClientSeo } from './ClientSeo';

export function BaseRouteSeo() {
  const { i18nInterface } = useBaseRoutePage();

  if (!i18nInterface) {
    return null;
  }

  return (
    <ClientSeo i18nInterface={i18nInterface as unknown as PageI18nInterface} />
  );
}
