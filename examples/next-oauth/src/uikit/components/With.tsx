export function With<T>(props: {
  fallback?: React.ReactNode;
  it: T;
  children: React.ReactNode | ((it: NonNullable<T>) => React.ReactNode);
}) {
  const { fallback, it, children } = props;

  if (it != null && it !== false) {
    if (typeof children === 'function') {
      return children(it as NonNullable<T>);
    }

    return children;
  }

  return fallback ?? null;
}
