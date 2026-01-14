import { AbortError } from '../AbortError';

export function createAbortPromise(signal: AbortSignal): {
  promise: Promise<never>;
  cleanup: () => void;
} {
  let cleanup: () => void = () => {};

  const promise = new Promise<never>((_, reject) => {
    // If already aborted, immediately reject
    if (signal.aborted) {
      reject(signal.reason || new AbortError('The operation was aborted'));
      return;
    }

    // Listen for abort event
    const onAbort = () => {
      reject(signal.reason || new AbortError('The operation was aborted'));
    };

    signal.addEventListener('abort', onAbort);

    // Provide cleanup function to remove event listener
    cleanup = () => {
      signal.removeEventListener('abort', onAbort);
    };
  });

  return { promise, cleanup };
}

export async function raceWithAbort<T>(
  promise: Promise<T>,
  signal?: AbortSignal
): Promise<T> {
  if (!signal) {
    return promise;
  }

  const { promise: abortPromise, cleanup } = createAbortPromise(signal);

  // Use Promise.race - whichever completes first wins
  try {
    return await Promise.race([promise, abortPromise]);
  } finally {
    // Always cleanup event listener to prevent memory leaks
    cleanup();
  }
}
