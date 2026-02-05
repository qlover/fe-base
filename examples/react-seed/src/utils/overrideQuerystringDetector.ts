import { getMultiQuerystring } from '@/utils/getMultiQuerystring';
import type { MultiQuerystringOptions } from '@/utils/getMultiQuerystring';
import type { DetectorOptions } from 'i18next-browser-languagedetector';

export const overrideQuerystringDetector = {
  name: 'multiQuerystring',
  lookup({
    search,
    lookupQuerystring,
    lookupQuerystringKeys
  }: DetectorOptions & MultiQuerystringOptions) {
    return getMultiQuerystring({
      search: search,
      lookupQuerystringKeys:
        Array.isArray(lookupQuerystringKeys) && lookupQuerystringKeys.length > 0
          ? lookupQuerystringKeys
          : lookupQuerystring
            ? [lookupQuerystring]
            : undefined
    });
  }
};
