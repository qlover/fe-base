export type ErrorMessageProps = {
  error: unknown;
};
export function ErrorMessage(props: ErrorMessageProps) {
  const { error } = props;

  if (error instanceof Error) {
    return (
      <p data-testid="ErrorMessage" className="text-secondary-text">
        <span>{error.name}:</span>
        <span className="text-primary-text">{error.message}</span>
      </p>
    );
  }

  if (typeof error === 'string' || typeof error === 'number') {
    return (
      <p data-testid="ErrorMessage" className="text-secondary-text">
        <span>{error}</span>
      </p>
    );
  }

  return (
    <p data-testid="ErrorMessage" className="text-secondary-text">
      <span>{String(error)}</span>
    </p>
  );
}
