import { StoreInterface } from '@qlover/corekit-bridge';
import type { StoreStateInterface } from '@qlover/corekit-bridge';

export interface NavItemInterface {
  key: string;
  /**
   * 可以是 i18n key
   */
  i18nKey: string;

  pathname?: string;
}

export interface AdminPageState extends StoreStateInterface {
  navItems: NavItemInterface[];
  collapsedSidebar: boolean;
}

export abstract class AdminPageInterface extends StoreInterface<AdminPageState> {
  public readonly selectors = {
    collapsedSidebar: (state: AdminPageState) => state.collapsedSidebar
  };

  abstract toggleSidebar(): void;
}
