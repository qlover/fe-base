/**
 * RequestCatcherInterface
 *
 * @description
 * RequestCatcherInterface is a interface that catches the request error
 *
 */
export interface RequestCatcherInterface<Context> {
  handler(context: Context): void;

  default(context: Context): void;
}
