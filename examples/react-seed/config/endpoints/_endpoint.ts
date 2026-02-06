import type { HttpMethodType } from '@qlover/fe-corekit';

export type EndPoint = `${HttpMethodType} /${string}`;

export type EndPointObject = {
  readonly url: string;
  readonly method: HttpMethodType;
};

export function toEndpointObject(
  endpoint: EndPoint,
  prefix?: string
): EndPointObject {
  const [method, url] = endpoint.split(' ');
  return {
    url: prefix ? prefix + url : url,
    method: method as HttpMethodType
  };
}

export function prefixEndpoint(
  endpoint: EndPoint,
  prefix: string = '/api'
): EndPointObject {
  return toEndpointObject(endpoint, prefix);
}
