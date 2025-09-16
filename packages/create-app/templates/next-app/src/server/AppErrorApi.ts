import type { AppApiErrorInterface } from '@/base/port/AppApiInterface';

export class AppErrorApi implements AppApiErrorInterface {
  readonly success = false;

  constructor(
    public readonly id: string,
    public readonly message?: string
  ) {}
}
