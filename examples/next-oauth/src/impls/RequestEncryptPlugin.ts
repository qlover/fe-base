import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';
import type {
  ExecutorContextInterface,
  LifecyclePluginInterface
} from '@qlover/fe-corekit/executor';
import type { RequestAdapterConfig } from '@qlover/fe-corekit/request';

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

export class RequestEncryptPlugin implements LifecyclePluginInterface<
  ExecutorContextInterface<RequestEncryptPluginProps>
> {
  public readonly pluginName = 'RequestEncryptPlugin';

  constructor(protected encryptor: EncryptorInterface<string, string>) {}

  /**
   * @override
   */
  public onBefore(
    context: ExecutorContextInterface<RequestEncryptPluginProps>
  ): void | Promise<void> {
    const { responseType, encryptProps } = context.parameters;

    const { data } = context.parameters;
    if (
      responseType === 'json' &&
      typeof data === 'object' &&
      data !== null &&
      encryptProps
    ) {
      const cloned = { ...data };
      context.setParameters({
        ...context.parameters,
        data: {
          ...cloned,
          ...this.encryptData(cloned, encryptProps)
        }
      });
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
