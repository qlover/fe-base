export interface AsyncStateInterface<T> {
  loading: boolean;
  result: T | null;
  error: unknown | null;
  startTime: number;
  endTime: number;
}
