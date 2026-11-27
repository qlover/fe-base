import { TokenEncryption } from '@qlover/next-kit/server';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';

/**
 * 延迟创建 `TokenEncryption`。
 *
 * IOC 常在环境变量齐备前就 `new` 登录提供方，构造期读 `encryptionKey` 会因空密钥抛错。
 * 交给 `OAuthWrapperService` 当令牌加密器，加密和解密时再取当前密钥。
 * 每次调用都新建 `TokenEncryption`，密钥以当时的 config / `process.env` 为准。
 * 不依赖 `@pamenv/next`：经典启动时 env 已注入同样可用。
 */
export class LazyTokenEncryption implements EncryptorInterface<string, string> {
  public constructor(
    protected readonly config: Pick<SeedServerConfigInterface, 'encryptionKey'>
  ) {}

  /**
   * @override
   */
  public encrypt(plaintext: string): string {
    return this.createEncryption().encrypt(plaintext);
  }

  /**
   * @override
   */
  public decrypt(ciphertext: string): string {
    return this.createEncryption().decrypt(ciphertext);
  }

  protected createEncryption(): TokenEncryption {
    return new TokenEncryption(this.config.encryptionKey);
  }
}
