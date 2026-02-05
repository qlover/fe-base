/* eslint-disable no-restricted-globals */
export interface MultiQuerystringOptions {
  /**
   * 用于扩展原来 `lookupQuerystring` 的查询参数
   * @example
   * ```typescript
   * const options: ExtendedDetectorOptions = {
   *   multiParamQuerystringKeys: ['lang', 'lng', 'language', 'locale', 'hl']
   * };
   * ```
   */
  lookupQuerystringKeys?: string[];

  search?: string;
}

function getSearch(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  let { search } = window.location;
  if (!window.location.search && window.location.hash?.indexOf('?') > -1) {
    search = window.location.hash.substring(window.location.hash.indexOf('?'));
  }

  return search;
}

export function getMultiQuerystring({
  search,
  lookupQuerystringKeys
}: MultiQuerystringOptions): string | undefined {
  search = search ?? getSearch();

  if (!search || !lookupQuerystringKeys?.length) {
    return undefined;
  }

  const params = new URLSearchParams(search);
  for (let i = 0; i < lookupQuerystringKeys.length; i++) {
    const value = params.get(lookupQuerystringKeys[i]);
    if (value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
}
