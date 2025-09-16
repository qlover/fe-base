export interface ServerApiResponseInterface<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}
