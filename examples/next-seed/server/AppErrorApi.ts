import type { AppApiErrorInterface } from '@shared/interfaces/AppApiInterface';

export class AppErrorApi implements AppApiErrorInterface {
  public readonly success = false;

  constructor(
    public readonly id: string,
    public readonly message?: string
  ) {}
}
