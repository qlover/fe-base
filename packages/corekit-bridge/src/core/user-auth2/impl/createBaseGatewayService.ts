import { GatewayServiceOptions } from './GatewayService';

export function createBaseGatewayService<T, Gateway>(
  options?: GatewayServiceOptions<T, Gateway>
): GatewayServiceOptions<T, Gateway> {}
