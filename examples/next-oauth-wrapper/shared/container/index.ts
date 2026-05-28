import 'reflect-metadata';
import {
  injectable as injectableImpl,
  inject as injectImpl
} from '@qlover/corekit-bridge/ioc';

export const injectable = injectableImpl;

export const inject = injectImpl;
