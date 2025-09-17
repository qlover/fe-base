import { injectable } from 'inversify';
import { AdminPageInterface } from '../port/AdminPageInterface';
import type {
  NavItemInterface,
  AdminPageState
} from '../port/AdminPageInterface';

class AdminPageManagerState implements AdminPageState {
  collapsedSidebar = false;

  navItems: NavItemInterface[] = [];
}

@injectable()
export class AdminPageManager extends AdminPageInterface {
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
