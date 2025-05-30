import clsx from 'clsx';

/**
 * Loading component
 *
 * @description This component displays a loading indicator. It can be used to indicate loading states either in fullscreen mode or within a specific section of the page.
 *
 * @param {boolean} fullscreen - Determines if the loading indicator should cover the entire screen. Defaults to false.
 *
 * @returns {JSX.Element} A div element displaying a loading icon.
 *
 * @example
 * <Loading fullscreen={true} />
 * <Loading fullscreen={false} />
 */
export function Loading({ fullscreen = false }: { fullscreen?: boolean }) {
  return (
    <div
      className={clsx('flex justify-center items-center', {
        'fixed inset-0 backdrop-blur-sm z-50': fullscreen,
        relative: !fullscreen
      })}
      style={{
        backgroundColor: fullscreen
          ? 'var(--fe-color-bg-container)'
          : 'transparent'
      }}
    >
      <div className="flex space-x-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={clsx(
              'w-3 h-3 rounded-full',
              'bg-[var(--fe-color-primary)]',
              'animate-[bounce_1s_ease-in-out_infinite]'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
    </div>
  );
}
