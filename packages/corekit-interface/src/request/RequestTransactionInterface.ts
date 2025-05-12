/**
 * Represents a transaction for a request.
 *
 * This interface defines a transaction that contains a request and a response.
 * It can be used to track the request and response of a transaction.
 *
 * @since 1.2.2
 */
export interface RequestTransactionInterface<Request, Response> {
  /**
   * The request object
   */
  request: Request;

  /**
   * The response object
   */
  response: Response;
}
