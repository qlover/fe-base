import { inject } from '@shared/container';
import { API_USER_REQUEST_LOGS } from '@config/apiRoutes';
import type { RequestLogRow } from '@schemas/RequestLogSchema';
import type { AppApiSuccessInterface } from '@interfaces/AppApiInterface';
import { AppApiRequester } from './AppApiRequester';
import type {
  ResourceOptions,
  ResourceSearchInterface,
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';

function sortCriteriaToQuery(
  criteria: ResourceSearchParams
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (criteria.page != null) {
    params.page = criteria.page;
  }
  if (criteria.pageSize != null) {
    params.pageSize = criteria.pageSize;
  }
  const first = criteria.sort?.[0];
  if (first?.orderBy) {
    params.orderBy = first.orderBy;
    const o = first.order;
    params.order =
      typeof o === 'string' && (o === 'asc' || o === 'desc') ? o : 'desc';
  }
  if (criteria.keyword != null && criteria.keyword !== '') {
    params.keyword = criteria.keyword;
  }
  if (criteria.cursor != null && criteria.cursor !== '') {
    params.cursor = criteria.cursor;
  }
  if (criteria.offset != null) {
    params.offset = criteria.offset;
  }
  if (criteria.filters != null) {
    params.filters =
      typeof criteria.filters === 'string'
        ? criteria.filters
        : JSON.stringify(criteria.filters);
  }
  return params;
}

export class RequestLogsApi implements ResourceSearchInterface<RequestLogRow> {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}
  /**
   * @override
   */
  public async search(
    criteria: ResourceSearchParams,
    resourceOptions?: ResourceOptions
  ): Promise<ResourceSearchResult<RequestLogRow>> {
    const response = await this.appApiRequester.get(API_USER_REQUEST_LOGS, {
      params: sortCriteriaToQuery(criteria),
      signal: resourceOptions?.signal
    });

    const envelope = response.data as AppApiSuccessInterface<
      ResourceSearchResult<RequestLogRow>
    >;
    const data = envelope.data;
    if (data == null) {
      return { items: [] };
    }
    return data;
  }
}
