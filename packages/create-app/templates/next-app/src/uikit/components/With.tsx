export function With<T>(props: {
  fallback?: React.ReactNode;
  it: T;
  children: React.ReactNode | ((it: NonNullable<T>) => React.ReactNode);
}) {
  const { fallback, it, children } = props;

  if (it) {
    if (typeof children === 'function') {
      return children(it);
    }

    return children;
  }

  return fallback ?? null;
}
