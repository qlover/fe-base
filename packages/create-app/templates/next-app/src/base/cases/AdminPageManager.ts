import { injectable } from 'inversify';
import { AdminLayoutInterface } from '../port/AdminLayoutInterface';
import type {
  NavItemInterface,
  AdminPageState
} from '../port/AdminLayoutInterface';

class AdminPageManagerState implements AdminPageState {
  collapsedSidebar = false;

  navItems: NavItemInterface[] = [];
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
