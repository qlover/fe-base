import { localStorage } from '../globals';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { ProcesserExecutor } from '@/base/services/ProcesserExecutor';
import { UserService } from '@/base/services/UserService';
import { I18nKeyErrorPlugin } from '@/base/cases/I18nKeyErrorPlugin';
import { IOCContainer, IOCRegister } from '../IOC';
import { IOCManagerInterface } from '@qlover/corekit-bridge';

export class RegisterControllers implements IOCRegister {
  /**
   * @override
   */
  register(
    container: IOCContainer,
    _: IOCManagerInterface<IOCContainer>
  ): void {
    const jsonStorageController = new JSONStorageController(localStorage);

    container.bind(JSONStorageController, jsonStorageController);

    container
      .get(ProcesserExecutor)
      .use(container.get(I18nKeyErrorPlugin))
      .use(container.get(UserService));
  }
}
