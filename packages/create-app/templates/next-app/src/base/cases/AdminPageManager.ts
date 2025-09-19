import { injectable } from 'inversify';
import { AdminLayoutInterface } from '../port/AdminLayoutInterface';
import type {
  NavItemInterface,
  AdminPageState
} from '../port/AdminLayoutInterface';

const defaultNavItems: NavItemInterface[] = [
  {
    key: 'dashboard',
    i18nKey: 'Dashboard',
    pathname: '/admin'
  },
  {
    key: 'users',
    i18nKey: 'User Management',
    pathname: '/admin/users'
  }
];

class AdminPageManagerState implements AdminPageState {
  collapsedSidebar = false;

  navItems: NavItemInterface[] = defaultNavItems;
}

@injectable()
export class AdminPageManager extends AdminLayoutInterface {
  constructor() {
    super(() => new AdminPageManagerState());
  }

  override toggleSidebar(): void {
    this.emit(
      this.cloneState({
        collapsedSidebar: !this.state.collapsedSidebar
      })
    );
  }
}
