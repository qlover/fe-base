import type { AsyncStateInterface } from '@/base/port/AsyncStateInterface';

export class RequestState<T> implements AsyncStateInterface<T> {
  startTime: number;
  endTime: number;

  constructor(
    public loading: boolean = false,
    public result: T | null = null,
    public error: unknown | null = null
  ) {
    this.startTime = Date.now();
    this.endTime = 0;
  }

  end(): this {
    this.endTime = Date.now();
    return this;
  }
}
