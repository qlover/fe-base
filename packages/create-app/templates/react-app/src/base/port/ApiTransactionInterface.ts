/**
 * Use for describe the unified format of Api request
 */
export interface ApiTransactionInterface<Request, Response> {
  request: Request;
  response: Response;
}
