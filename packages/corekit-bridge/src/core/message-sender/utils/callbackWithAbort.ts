import { GatewayOptions } from '../interface/MessageGetwayInterface';

export function callbackWithAbort<T extends (...args: unknown[]) => unknown>(
  callback: T,
  signal?: AbortSignal
): T {
  return ((...args: unknown[]) => {
    signal?.throwIfAborted();

    return callback(...args);
  }) as unknown as T;
}

const defaultMethods = [
  'onConnected',
  'onChunk',
  'onComplete',
  'onError',
  'onProgress'
];

export function gatewayOptionsWithAbort<T extends GatewayOptions<unknown>>(
  gatewayOptions: T,
  methods = defaultMethods
): T {
  const signal = gatewayOptions.signal;

  if (!signal) {
    return gatewayOptions;
  }

  methods.forEach((method) => {
    const value = gatewayOptions[method as keyof T];
    if (typeof value === 'function') {
      gatewayOptions[method as keyof T] = callbackWithAbort(
        value as (...args: unknown[]) => unknown,
        signal
      ) as T[keyof T];
    }
  });

  return gatewayOptions;
}
