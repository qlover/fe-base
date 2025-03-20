import type { InversifyRegisterInterface } from '@/base/port/InversifyIocInterface';
import { RegisterGlobals } from './RegisterGlobals';
import { RegisterCommon } from './RegisterCommon';
import { RegisterApi } from './RegisterApi';
import { RegisterControllers } from './RegisterControllers';
import AppConfig from '../AppConfig';

/**
 * Register List
 *
 * Register List is used to register dependencies in bootstrap
 */
export const registerList: InversifyRegisterInterface[] = [
  new RegisterGlobals(AppConfig),
  new RegisterCommon(),
  new RegisterApi(),
  new RegisterControllers()
];
