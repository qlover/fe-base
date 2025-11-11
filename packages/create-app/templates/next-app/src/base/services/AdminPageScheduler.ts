import { RequestState, type LifecycleInterface } from '@qlover/corekit-bridge';
import type { ResourceService } from '@/base/services/ResourceService';

export class AdminPageScheduler implements LifecycleInterface {
  /**
   * @override
   */
  async created(parmas: {
    resource: ResourceService<unknown>;
  }): Promise<unknown> {
    const { resource } = parmas;
    const store = resource.getStore();

    store.changeInitState(new RequestState(true));

    try {
      const result = await resource.search(store.state.searchParams);

      store.changeInitState(new RequestState(false, result).end());
      return result;
    } catch (error) {
      store.changeInitState(new RequestState(false, null, error).end());

      return error;
    }
  }

  /**
   * @override
   */
  destroyed(parmas: { resource: ResourceService<unknown> }): void {
    const { resource } = parmas;
    const store = resource.getStore();

    store.reset();
  }

  /**
   * @override
   */
  updated(): void {}
}
