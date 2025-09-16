import type { AppApiSuccessInterface } from '@/base/port/AppApiInterface';

export class AppSuccessApi<T = unknown> implements AppApiSuccessInterface<T> {
  readonly success = true;

  constructor(public readonly data?: T) {}
}
