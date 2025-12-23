import { routerPrefix } from '@config/common';
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
export class IdentifierService<T> implements ResourceServiceInterface<
  T,
  ResourceStore<ResourceStateInterface>
> {
  public readonly unionKey: string = 'id';
  public readonly serviceName: string = 'IdentifierService';
  public readonly store: ResourceStore<ResourceStateInterface>;
  // Not implemented
  public readonly resourceApi!: ResourceInterface<T>;
  private unsubscribe: (() => void) | null = null;

  constructor(
    @inject(I.I18nServiceInterface)
    protected readonly i18nService: I18nService
  ) {
    this.store = new ResourceStore(() => new ResourceState());
  }

  /**
   * @override
   */
  public getStore(): ResourceStore<ResourceStateInterface> {
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
  public async created(): Promise<unknown> {
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
  public destroyed(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;

    this.store.reset();
  }

  /**
   * @override
   */
  public updated(): void {}

  /**
   * @override
   */
  public async search(
    params: Partial<ResourceQuery & { locale: LocaleType }>
  ): Promise<PaginationInterface<IdentifierRecord>> {
    this.store.changeListState(
      new RequestState(true, this.store.state.listState.result)
    );

    const locale = params.locale!;

    const response = await fetch(
      `${routerPrefix}/locales/${locale}/common.json`
    );
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

  public refresh(): Promise<unknown> {
    return this.search(this.store.state.searchParams);
  }

  /**
   * @override
   */
  public async update(_data: Partial<T>): Promise<unknown> {
    return Promise.resolve(null);
  }

  /**
   * @override
   */
  public create(_data: T): Promise<unknown> {
    return Promise.resolve(null);
  }
  /**
   * @override
   */
  public remove(_data: T): Promise<unknown> {
    return Promise.resolve(null);
  }
  /**
   * @override
   */
  public export(_data: T): Promise<unknown> {
    return Promise.resolve(null);
  }
}
