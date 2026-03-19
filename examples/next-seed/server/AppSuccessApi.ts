import type { AppApiSuccessInterface } from '@interfaces/AppApiInterface';

export class AppSuccessApi<T = unknown> implements AppApiSuccessInterface<T> {
  public readonly success = true;

  constructor(
    public readonly data?: T,
    public readonly requestId?: string
  ) {}
}
