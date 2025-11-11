import { IOCIdentifier } from '@config/IOCIdentifier';
import { RequestAdapterFetch } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type { AppConfig } from '@/base/cases/AppConfig';

@injectable()
export class UserApiAdapter extends RequestAdapterFetch {
  constructor(@inject(IOCIdentifier.AppConfig) appConfig: AppConfig) {
    super({
      responseType: 'json',
      baseURL: appConfig.feApiBaseUrl
    });
  }
}
