/**
 * 创建一个新对象，排除指定的属性键（兼容 lodash 行为）
 * - 支持数组参数和多个独立参数
 * - 忽略对象中不存在的键（不报错）
 * - 保留类型安全：返回类型为 Omit<T, 实际存在的排除键>
 */
export function omit<T extends object, K extends readonly string[]>(
  obj: T,
  ...paths: K
): Omit<T, Extract<keyof T, K[number]>>;

export function omit<T extends object, K extends readonly string[]>(
  obj: T,
  paths: K
): Omit<T, Extract<keyof T, K[number]>>;

export function omit<T extends object>(
  obj: T,
  pathsOrFirst?: string | string[],
  ...rest: string[]
): Partial<T> {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  // 收集所有要排除的键
  let keysToExclude: string[] = [];
  if (Array.isArray(pathsOrFirst)) {
    keysToExclude = pathsOrFirst;
  } else if (typeof pathsOrFirst === 'string') {
    keysToExclude = [pathsOrFirst, ...rest];
  } else {
    // 如果没有传入任何键，返回原对象（浅拷贝）
    return { ...obj };
  }

  const excludeSet = new Set(keysToExclude);
  const result: Partial<T> = {};

  for (const key in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      !excludeSet.has(key)
    ) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * 创建一个新对象，排除谓词函数返回 true 的属性
 * 完全兼容 lodash 的 omitBy
 */
export function omitBy<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const result: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (!predicate(value, key)) {
        result[key] = value;
      }
    }
  }
  return result;
}
