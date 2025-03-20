/**
 * This interface defines the interface for intercepting FeApi data
 *
 * It rewrites the RequestAdapterResponse.data, and extends the data with the ApiCatchResult type
 *
 * For example: ApiCatchPlugin intercepts the error in the response, then rewrites the data, and extends the data with the ApiCatchResult type in WrapperFeApiResponse
 *
 * And it provides a is method, which is used to determine if the data is the type of `ValueType`
 *
 * **TypeScript not support interface static member, so we use class to implement it, and the original interface should be used as a normal class**
 *
 * @interface
 */
// ValueType is used to constrain the type, but we cannot use the ValueType type in the static is method, it is just a placeholder
export class ApiClientInterceptingInterface<ValueType> {
  /**
   * this method is used to determine if the data is the type of `ValueType`
   *
   * sub class should override this method
   *
   * @param value
   * @returns
   */
  static is(value: unknown): value is unknown {
    throw new Error(`ApiClientInterceptingInterface.is: need override!`);
  }
}
