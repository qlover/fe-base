export type ConstructorType<T, Args extends unknown[]> =
  | (new (...args: Args) => T)
  | ((...args: Args) => T);

export function factory<T, Args extends unknown[]>(
  Constructor: ConstructorType<T, Args>,
  ...args: Args
): T {
  // check Constructor is class constructor
  if (
    typeof Constructor === 'function' &&
    Constructor.prototype &&
    Constructor.prototype.constructor === Constructor
  ) {
    return new (Constructor as new (...args: Args) => T)(...args);
  }
  // if it is a normal function, call it directly
  return (Constructor as (...args: Args) => T)(...args);
}
