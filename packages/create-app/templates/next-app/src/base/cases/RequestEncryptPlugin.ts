import { clone, isObject } from 'lodash';
import type {
  Encryptor,
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterConfig
} from '@qlover/fe-corekit';

export interface RequestEncryptPluginProps<
  Request = unknown
> extends RequestAdapterConfig<Request> {
  /**
   * 加密密码在 HTTP 请求中
   *
   * - 如果为空，则不加密密码
   * - 如果为字符串，则加密密码
   * - 如果为数组，则加密密码
   */
  encryptProps?: string[] | string;
}

export class RequestEncryptPlugin implements ExecutorPlugin<RequestEncryptPluginProps> {
  public readonly pluginName = 'RequestEncryptPlugin';

  constructor(protected encryptor: Encryptor<string, string>) {}

  public onBefore(
    context: ExecutorContext<RequestEncryptPluginProps>
  ): void | Promise<void> {
    const { responseType, encryptProps } = context.parameters;

    if (
      responseType === 'json' &&
      isObject(context.parameters.data) &&
      encryptProps
    ) {
      context.parameters.data = this.encryptData(
        clone(context.parameters.data),
        encryptProps
      );
    }
  }

  protected encryptData<T extends object>(
    data: T,
    encryptProps?: string | string[]
  ): T {
    if (typeof encryptProps === 'string') {
      const targetValue = data[encryptProps as keyof T];

      if (typeof targetValue === 'string') {
        const newValue = this.encryptor.encrypt(targetValue);
        Object.assign(data, { [encryptProps]: newValue });
      }
    }

    if (Array.isArray(encryptProps)) {
      encryptProps.forEach((prop) => {
        const targetValue = data[prop as keyof T];
        if (typeof targetValue === 'string') {
          const newValue = this.encryptor.encrypt(targetValue);
          Object.assign(data, { [prop]: newValue });
        }
      });
    }

    return data;
  }
}
