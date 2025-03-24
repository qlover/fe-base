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
      className={`flex justify-center items-center ${fullscreen ? 'fixed inset-0 bg-white bg-opacity-80 z-50' : 'relative'}`}
    >
      <svg
        className="animate-spin h-8 w-8 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  );
}
