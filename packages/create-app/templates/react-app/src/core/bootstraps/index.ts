import { BootstrapExecutorPlugin } from '@lib/bootstrap';
import { BootstrapApp } from './BootstrapApp';

export const appBootstrapList: BootstrapExecutorPlugin[] = [new BootstrapApp()];
