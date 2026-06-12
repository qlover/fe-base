import { URLParamsStorage } from '@qlover/corekit-bridge';
import { useCallback, useMemo } from 'react';

/**
 * 用来获取需要返回到指定 url 的参数值, 并重定向到指定 url
 *
 * key 可以指定一个数组，只要匹配到包含在里面的其中一个参数值就返回
 *
 * @example
 * ```
 * const { returnTo, returnToValue, returnToKey } = useReturnTo({ returnToKey: 'return_to' });
 * returnTo();
 * ```
 * @param props.returnToKey - 需要返回到指定 url 的参数 key
 * @returns
 */
export function useReturnTo(props: {
  returnToKey: string | readonly string[];
  caseSensitive?: boolean;
}) {
  const { returnToKey, caseSensitive = false } = props;

  const returnToValue = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new URLParamsStorage<string | readonly string[]>(
      window.location.href,
      {
        caseSensitive
      }
    ).getItem(returnToKey);
  }, [returnToKey, caseSensitive]);

  const returnTo = useCallback(
    (defaultPath?: string) => {
      let finalURL;
      if (returnToValue) {
        finalURL = new URL(returnToValue, window.location.origin);
      } else if (defaultPath) {
        finalURL = defaultPath;
      }

      // 是否长地址
      if (finalURL?.toString().startsWith('http')) {
        window.location.replace(finalURL);
        return;
      }

      // 短地址
      if (finalURL) {
        window.location.assign(finalURL);
      }
    },
    [returnToValue]
  );

  return { returnTo, returnToValue };
}
