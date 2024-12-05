/**
 * 获取对象的值类型
 */
type ValueOf<T> = T[keyof T];

/**
 * 交叉类型
 */
type Intersection<T1, T2> = {
  [P in keyof T1 & keyof T2]: T1[P] | T2[P];
};
