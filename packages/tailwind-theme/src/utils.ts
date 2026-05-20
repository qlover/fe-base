export function resolveTokenValue(value: string, prefix: string): string {
  return value.replace(/\$\{prefix\}/g, prefix);
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target } as T;
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceVal = source[key];
      const targetVal = result[key];
      if (
        sourceVal &&
        typeof sourceVal === 'object' &&
        !Array.isArray(sourceVal) &&
        targetVal &&
        typeof targetVal === 'object'
      ) {
        result[key] = deepMerge(
          targetVal as Record<string, unknown>,
          sourceVal as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = sourceVal as T[Extract<keyof T, string>];
      }
    }
  }
  return result;
}
