import {
  injectable as injectableImpl,
  inject as injectImpl
} from './SimpleIOCContainer';

export const injectable = injectableImpl;

export const inject = injectImpl;
