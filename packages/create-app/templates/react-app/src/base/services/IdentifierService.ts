import { I } from '@config/IOCIdentifier';
import {
  RequestState,
  type ResourceStateInterface,
  type ResourceServiceInterface,
  type ResourceInterface,
  type ResourceQuery,
  ResourceStore
} from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import type { LocaleType } from '@config/i18n/i18nConfig';
import { I18nService } from './I18nService';
import { PaginationInterface, ResourceState } from '../cases/ResourceState';

export interface IdentifierRecord {
  id: string;
  locale: LocaleType;
  localeValue: string;
}

@injectable()
export class IdentifierService<T>
  implements ResourceServiceInterface<T, ResourceStore<ResourceStateInterface>>
{
  readonly unionKey: string = 'id';
  readonly serviceName: string = 'IdentifierService';
  readonly store: ResourceStore<ResourceStateInterface>;
  // Not implemented
  readonly resourceApi!: ResourceInterface<T>;
  private unsubscribe: (() => void) | null = null;

  constructor(
    @inject(I.I18nServiceInterface)
    protected readonly i18nService: I18nService
  ) {
    this.store = new ResourceStore(() => new ResourceState());
  }

  getStore(): ResourceStore<ResourceStateInterface> {
    return this.store;
  }

  protected async init(): Promise<unknown> {
    this.store.changeInitState(new RequestState(true));

    try {
      const result = await this.search({
        locale: this.i18nService.getCurrentLanguage() as LocaleType
      });

      this.store.changeInitState(new RequestState(false, result).end());
      return result;
    } catch (error) {
      this.store.changeInitState(new RequestState(false, null, error).end());

      return error;
    }
  }

  /**
   * @override
   */
  async created(): Promise<unknown> {
    this.unsubscribe = this.i18nService.observe(
      (state) => state.language,
      () => {
        this.init();
      }
    );

    return this.init();
  }

  /**
   * @override
   */
  destroyed(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;

    this.store.reset();
  }

  /**
   * @override
   */
  updated(): void {}

  async search(
    params: Partial<ResourceQuery & { locale: LocaleType }>
  ): Promise<PaginationInterface<IdentifierRecord>> {
    this.store.changeListState(
      new RequestState(true, this.store.state.listState.result)
    );

    const locale = params.locale!;

    const response = await fetch(this.i18nService.getBackendLoadPath(locale));
    const data = await response.json();

    let index = 0;
    const resultList: IdentifierRecord[] = Object.entries(data).map(
      ([key, value]) => ({
        index: (index += 1),
        id: key,
        locale: locale,
        localeValue: value as string
      })
    );

    const result: PaginationInterface<IdentifierRecord> = {
      list: resultList,
      total: resultList.length,
      page: 1,
      pageSize: 10
    };

    this.store.changeListState(new RequestState(false, result).end());

    return result;
  }

  refresh(): Promise<unknown> {
    return this.search(this.store.state.searchParams);
  }

  async update(_data: Partial<T>): Promise<unknown> {
    return Promise.resolve(null);
  }

  create(_data: T): Promise<unknown> {
    return Promise.resolve(null);
  }
  remove(_data: T): Promise<unknown> {
    return Promise.resolve(null);
  }
  export(_data: T): Promise<unknown> {
    return Promise.resolve(null);
  }
}
