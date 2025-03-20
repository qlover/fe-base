import { IOCIdentifier } from '@/core/IOC';
import { RequestAdapterFetch } from '@qlover/fe-utils';
import { inject, injectable } from 'inversify';
import { AppConfigImpl } from '@/core/AppConfig';

@injectable()
export class FeApiAdapter extends RequestAdapterFetch {
  constructor(@inject(IOCIdentifier.AppConfig) appConfig: AppConfigImpl) {
    super({
      responseType: 'json',
      baseURL: appConfig.feApiBaseUrl
    });
  }
}
