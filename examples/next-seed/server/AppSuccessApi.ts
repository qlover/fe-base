import type { AppApiSuccessInterface } from '@shared/interfaces/AppApiInterface';

export class AppSuccessApi<T = unknown> implements AppApiSuccessInterface<T> {
  public readonly success = true;

  constructor(public readonly data?: T) {}
}
