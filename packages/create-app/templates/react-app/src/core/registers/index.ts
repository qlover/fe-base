import type { InversifyRegisterInterface } from '@/base/port/InversifyIocInterface';
import { RegisterGlobals } from './RegisterGlobals';
import { RegisterCommon } from './RegisterCommon';
import { RegisterApi } from './RegisterApi';
import { RegisterControllers } from './RegisterControllers';

/**
 * Register List
 *
 * Register List is used to register dependencies in bootstrap
 */
export const registerList: InversifyRegisterInterface[] = [
  new RegisterGlobals(),
  new RegisterCommon(),
  new RegisterApi(),
  new RegisterControllers()
];
