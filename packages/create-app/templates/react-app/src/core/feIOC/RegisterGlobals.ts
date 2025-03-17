import { IOCRegisterInterface } from '@/base/port/IOCContainerInterface';
import { JSON, localJsonStorage, logger } from '../globals';
import { JSONSerializer, JSONStorage, Logger } from '@qlover/fe-utils';
import { Container } from 'inversify';
import { FeRegisterType } from './FeRegisterType';

export class RegisterGlobals implements IOCRegisterInterface<Container> {
  register(container: Container): void {
    container.bind(JSONSerializer).toConstantValue(JSON);
    container.bind(FeRegisterType.JSON).toConstantValue(JSON);

    container.bind(Logger).toConstantValue(logger);
    container.bind(FeRegisterType.Logger).toConstantValue(logger);

    container.bind(JSONStorage).toConstantValue(localJsonStorage);
    container
      .bind(FeRegisterType.JSONStorage)
      .toConstantValue(localJsonStorage);
  }
}
