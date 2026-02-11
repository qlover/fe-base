import { injectable as injectableImpl } from './SimpleIOCContainer';
import { inject as injectImpl } from './SimpleIOCContainer';

export const injectable = injectableImpl;

export const inject = injectImpl;
