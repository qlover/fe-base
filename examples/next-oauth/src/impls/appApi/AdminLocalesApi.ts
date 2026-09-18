import { inject, injectable } from '@shared/container';
import {
  API_ADMIN_LOCALES,
  API_ADMIN_LOCALES_IMPORT,
  API_ADMIN_LOCALES_NAMESPACES
} from '@config/apiRoutes';
import type { LocaleType } from '@config/i18n';
import type {
  AdminLocaleCreate,
  AdminLocaleItem,
  AdminLocaleUpdate,
  AdminLocalesImportResult
} from '@schemas/AdminLocalesSchema';
import { AppApiRequester } from './AppApiRequester';
import type { ResourceSearchResult } from '@qlover/corekit-bridge';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

@injectable()
export class AdminLocalesApi {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}

  public async search(params?: {
    locale?: LocaleType;
    keyword?: string;
    namespace?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ResourceSearchResult<AdminLocaleItem>> {
    const response = await this.appApiRequester.get(API_ADMIN_LOCALES, {
      params: {
        locale: params?.locale ?? '',
        keyword: params?.keyword ?? '',
        namespace: params?.namespace ?? '',
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20
      }
    });
    const envelope = response.data as NextKitApiSuccess<
      ResourceSearchResult<AdminLocaleItem>
    >;
    return (
      envelope.data ?? {
        items: [],
        total: 0,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        hasMore: false
      }
    );
  }

  public async listNamespaces(): Promise<string[]> {
    const response = await this.appApiRequester.get(
      API_ADMIN_LOCALES_NAMESPACES
    );
    const envelope = response.data as NextKitApiSuccess<string[]>;
    return envelope.data ?? [];
  }

  public async create(
    body: AdminLocaleCreate
  ): Promise<AdminLocaleItem | null> {
    const response = await this.appApiRequester.post(API_ADMIN_LOCALES, body);
    const envelope = response.data as NextKitApiSuccess<AdminLocaleItem | null>;
    return envelope.data ?? null;
  }

  public async update(body: AdminLocaleUpdate): Promise<void> {
    await this.appApiRequester.patch(API_ADMIN_LOCALES, body);
  }

  public async importFromStatic(): Promise<AdminLocalesImportResult> {
    const response = await this.appApiRequester.post(API_ADMIN_LOCALES_IMPORT);
    const envelope =
      response.data as NextKitApiSuccess<AdminLocalesImportResult>;
    return (
      envelope.data ?? {
        totalCount: 0,
        successCount: 0,
        failureCount: 0
      }
    );
  }
}
