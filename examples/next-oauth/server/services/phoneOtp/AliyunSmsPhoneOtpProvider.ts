import { createHmac, randomUUID } from 'node:crypto';
import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import {
  API_SMS_PROVIDER_NOT_READY,
  API_SMS_SEND_FAILED
} from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { SiteSettingsService } from '@server/services/SiteSettingsService';
import type {
  PhoneOtpProviderInterface,
  PhoneOtpSendContext
} from './PhoneOtpProviderInterface';
import type { LoggerInterface } from '@qlover/logger';

const ALIYUN_SMS_ENDPOINT = 'https://dysmsapi.aliyuncs.com/';
const ALIYUN_SMS_API_VERSION = '2017-05-25';
const ALIYUN_SMS_TIMEOUT_MS = 15_000;

type AliyunSmsCredentialsType = {
  readonly accessKeyId: string;
  readonly accessKeySecret: string;
  readonly signName: string;
  readonly templateCode: string;
  readonly templateParamKey: string;
};

/**
 * 阿里云短信 SendSms（RPC 签名）。
 * 凭证来自站点设置 `aliyun_sms.*`。
 */
@injectable()
export class AliyunSmsPhoneOtpProvider implements PhoneOtpProviderInterface {
  public readonly name = 'aliyun' as const;

  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService
  ) {}

  /**
   * @override
   */
  public async send(context: PhoneOtpSendContext): Promise<void> {
    const credentials = await this.loadCredentials();
    const phoneNumbers = this.toAliyunPhoneNumber(context.phone);
    const templateParam = JSON.stringify({
      [credentials.templateParamKey]: context.code
    });

    const query = this.buildSignedQuery({
      accessKeyId: credentials.accessKeyId,
      accessKeySecret: credentials.accessKeySecret,
      phoneNumbers,
      signName: credentials.signName,
      templateCode: credentials.templateCode,
      templateParam
    });

    let response: Response;
    try {
      response = await fetch(`${ALIYUN_SMS_ENDPOINT}?${query}`, {
        method: 'GET',
        signal: AbortSignal.timeout(ALIYUN_SMS_TIMEOUT_MS)
      });
    } catch (error: unknown) {
      this.logger.error('Aliyun SMS request failed', {
        phone: phoneNumbers,
        error
      });
      throw new ExecutorError(API_SMS_SEND_FAILED, 'Aliyun SMS request failed');
    }

    const bodyText = await response.text();
    let code = '';
    let message = bodyText;
    try {
      const parsed = JSON.parse(bodyText) as {
        Code?: string;
        Message?: string;
      };
      code = String(parsed.Code ?? '');
      message = String(parsed.Message ?? bodyText);
    } catch {
      // keep raw body
    }

    if (!response.ok || code.toLowerCase() !== 'ok') {
      this.logger.error('Aliyun SMS rejected', {
        phone: phoneNumbers,
        httpStatus: response.status,
        code,
        message
      });
      throw new ExecutorError(API_SMS_SEND_FAILED, message || code);
    }
  }

  /**
   * @override
   */
  public exposePlainCode(): boolean {
    return false;
  }

  /**
   * E.164 → 阿里云 PhoneNumbers（国内去 +86）。
   */
  protected toAliyunPhoneNumber(e164: string): string {
    const trimmed = e164.trim();
    if (trimmed.startsWith('+86')) {
      return trimmed.slice(3);
    }
    return trimmed.replace(/^\+/, '');
  }

  protected async loadCredentials(): Promise<AliyunSmsCredentialsType> {
    const [
      accessKeyId,
      accessKeySecret,
      signName,
      templateCode,
      templateParamKeyRaw
    ] = await Promise.all([
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.ALIYUN_SMS_ACCESS_KEY_ID),
      this.siteSettings.getSecretString(
        FE_SITE_SETTING_KEYS.ALIYUN_SMS_ACCESS_KEY_SECRET
      ),
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.ALIYUN_SMS_SIGN_NAME),
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.ALIYUN_SMS_TEMPLATE_CODE),
      this.siteSettings.getString(
        FE_SITE_SETTING_KEYS.ALIYUN_SMS_TEMPLATE_PARAM_KEY
      )
    ]);

    const templateParamKey = templateParamKeyRaw.trim() || 'code';
    if (
      !accessKeyId.trim() ||
      !accessKeySecret.trim() ||
      !signName.trim() ||
      !templateCode.trim()
    ) {
      throw new ExecutorError(
        API_SMS_PROVIDER_NOT_READY,
        'Aliyun SMS settings incomplete (aliyun_sms.*)'
      );
    }

    return {
      accessKeyId: accessKeyId.trim(),
      accessKeySecret: accessKeySecret.trim(),
      signName: signName.trim(),
      templateCode: templateCode.trim(),
      templateParamKey
    };
  }

  protected buildSignedQuery(params: {
    readonly accessKeyId: string;
    readonly accessKeySecret: string;
    readonly phoneNumbers: string;
    readonly signName: string;
    readonly templateCode: string;
    readonly templateParam: string;
  }): string {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const canonical: Record<string, string> = {
      AccessKeyId: params.accessKeyId,
      Action: 'SendSms',
      Format: 'JSON',
      PhoneNumbers: params.phoneNumbers,
      RegionId: 'cn-hangzhou',
      SignName: params.signName,
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: randomUUID(),
      SignatureVersion: '1.0',
      TemplateCode: params.templateCode,
      TemplateParam: params.templateParam,
      Timestamp: timestamp,
      Version: ALIYUN_SMS_API_VERSION
    };

    const sortedKeys = Object.keys(canonical).sort();
    const canonicalQuery = sortedKeys
      .map(
        (key) =>
          `${this.percentEncode(key)}=${this.percentEncode(canonical[key]!)}`
      )
      .join('&');
    const stringToSign = `GET&${this.percentEncode('/')}&${this.percentEncode(canonicalQuery)}`;
    const signature = createHmac('sha1', `${params.accessKeySecret}&`)
      .update(stringToSign)
      .digest('base64');

    return `${canonicalQuery}&Signature=${this.percentEncode(signature)}`;
  }

  protected percentEncode(value: string): string {
    return encodeURIComponent(value)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }
}
