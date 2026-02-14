'use client';

import { TranslationOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import type { ItemType } from 'antd/es/menu/interface';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale() as LocaleType;
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const options: ItemType[] = useMemo(() => {
    return i18nConfig.supportedLngs.map(
      (lang) =>
        ({
          type: 'item',
          key: lang,
          value: lang,
          label:
            i18nConfig.localeNames[lang as keyof typeof i18nConfig.localeNames]
        }) as ItemType
    );
  }, []);

  const handleLanguageChange = useCallback(
    async (value: string) => {
      if (isPending) return;

      startTransition(() => {
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        router.replace({ pathname, params }, { locale: value });
      });
    },
    [pathname, router, isPending, params]
  );

  const nextLocale = useMemo(() => {
    const targetIndex = i18nConfig.supportedLngs.indexOf(currentLocale) + 1;
    return i18nConfig.supportedLngs[
      targetIndex % i18nConfig.supportedLngs.length
    ];
  }, [currentLocale]);

  return (
    <Dropdown
      data-testid="LanguageSwitcherDropdown"
      trigger={['hover']}
      menu={{
        selectedKeys: [currentLocale],
        items: options,
        onClick: ({ key }) => {
          handleLanguageChange(key);
        }
      }}
    >
      <span
        data-testid="LanguageSwitcher"
        className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
        onClick={() => handleLanguageChange(nextLocale)}
      >
        <TranslationOutlined />
      </span>
    </Dropdown>
  );
}
