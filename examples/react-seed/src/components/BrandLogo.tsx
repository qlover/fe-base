import { PAMLogo } from '@/components/PAMLogo';

type BrandLogoProps = {
  className?: string;
  /** CSS font-size driven size for PAMLogo (1em). */
  sizeClassName?: string;
  withWordmark?: boolean;
  wordmark?: string;
  wordmarkClassName?: string;
};

/**
 * App header brand: official PAM mark + optional product wordmark.
 */
export function BrandLogo({
  className = '',
  sizeClassName = 'text-[2.5rem]',
  withWordmark = false,
  wordmark = 'React Seed',
  wordmarkClassName = 'text-primary-text text-lg font-semibold tracking-tight'
}: BrandLogoProps) {
  return (
    <span
      className={`text-brand inline-flex items-center gap-2.5 ${className}`.trim()}
      data-testid="brand-logo"
    >
      <PAMLogo className={`shrink-0 ${sizeClassName}`.trim()} />
      {withWordmark ? (
        <span className={wordmarkClassName}>{wordmark}</span>
      ) : null}
    </span>
  );
}
