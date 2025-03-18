import { IOCRegisterInterface } from '@/base/port/IOCContainerInterface';
import { JSON, localJsonStorage, logger } from '../globals';
import { JSONSerializer, JSONStorage, Logger } from '@qlover/fe-utils';
import { Container } from 'inversify';
import { RegistersType } from '../../base/consts/AppRegistersType';

export class RegisterGlobals implements IOCRegisterInterface<Container> {
  register(container: Container): void {
    container.bind(JSONSerializer).toConstantValue(JSON);
    container.bind(RegistersType.JSON).toConstantValue(JSON);

    container.bind(Logger).toConstantValue(logger);
    container.bind(RegistersType.Logger).toConstantValue(logger);

    container.bind(JSONStorage).toConstantValue(localJsonStorage);
    container
      .bind(RegistersType.JSONStorage)
      .toConstantValue(localJsonStorage);
  }
}
