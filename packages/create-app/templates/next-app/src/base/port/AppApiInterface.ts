export interface AppApiErrorInterface {
  success: false;
  id: string;
  message?: string;
}

export interface AppApiSuccessInterface<T = unknown> {
  success: true;
  data?: T;
}

export type AppApiResponse<T = unknown> =
  | AppApiErrorInterface
  | AppApiSuccessInterface<T>;
