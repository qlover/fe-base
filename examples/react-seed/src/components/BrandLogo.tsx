import { SeedLogo } from '@/components/SeedLogo';

type BrandLogoProps = {
  className?: string;
  /** CSS font-size driven size for SeedLogo (1em). */
  sizeClassName?: string;
  withWordmark?: boolean;
  wordmark?: string;
  wordmarkClassName?: string;
};

/**
 * App brand: React Seed mark + optional wordmark.
 * PAM mark stays on the PAM login button only ({@link PAMLogo}).
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
      <SeedLogo className={`shrink-0 ${sizeClassName}`.trim()} />
      {withWordmark ? (
        <span className={wordmarkClassName}>{wordmark}</span>
      ) : null}
    </span>
  );
}
