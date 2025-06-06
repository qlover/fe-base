import type { AppConfig } from '@/base/cases/AppConfig';
import { IOCIdentifier } from '@/core/IOC';
import { RequestAdapterFetch } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';

@injectable()
export class FeApiAdapter extends RequestAdapterFetch {
  constructor(@inject(IOCIdentifier.AppConfig) appConfig: AppConfig) {
    super({
      responseType: 'json',
      baseURL: appConfig.feApiBaseUrl
    });
  }
}
