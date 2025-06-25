import { localJsonStorage } from '../globals';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { ProcesserService } from '@/base/services/ProcesserService';
import { UserService } from '@/base/services/UserService';
import { InversifyRegisterInterface } from '../IOC';
import { InversifyContainer } from '../IOC';
import { I18nKeyErrorPlugin } from '@/base/cases/I18nKeyErrorPlugin';

export class RegisterControllers implements InversifyRegisterInterface {
  register(container: InversifyContainer): void {
    const jsonStorageController = new JSONStorageController(localJsonStorage);

    container.bind(JSONStorageController, jsonStorageController);

    container
      .get(ProcesserService)
      .use(container.get(I18nKeyErrorPlugin))
      .use(container.get(UserService));
  }
}
