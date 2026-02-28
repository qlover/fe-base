import type { AppApiErrorInterface } from '@interfaces/AppApiInterface';

export class AppErrorApi implements AppApiErrorInterface {
  public readonly success = false;

  constructor(
    public readonly id: string,
    public readonly message?: string
  ) {}
}
