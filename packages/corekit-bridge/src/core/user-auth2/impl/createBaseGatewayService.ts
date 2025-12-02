import { BaseGatewayServiceOptions } from './BaseGatewayService';

export function createBaseGatewayService<T, Gateway>(
  options?: BaseGatewayServiceOptions<T, Gateway>
): BaseGatewayServiceOptions<T, Gateway> {}
