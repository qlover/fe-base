import { injectable } from '@shared/container';
import { AdminLayoutInterface } from '@shared/interfaces/AdminLayoutInterface';
import type {
  NavItemInterface,
  AdminPageState
} from '@shared/interfaces/AdminLayoutInterface';
import { defaultNavItems } from '@config/adminNavs';

class AdminPageManagerState implements AdminPageState {
  public collapsedSidebar = false;

  public navItems: NavItemInterface[] = defaultNavItems;
}

@injectable()
export class AdminPageManager extends AdminLayoutInterface {
  constructor() {
    super(() => new AdminPageManagerState());
  }

  public override toggleSidebar(): void {
    this.emit(
      this.cloneState({
        collapsedSidebar: !this.state.collapsedSidebar
      })
    );
  }
}
