import type { BootstrapExecutorPlugin } from '@fe-prod/core';
import { BootstrapApp } from './BootstrapApp';

export const appBootstrapList: BootstrapExecutorPlugin[] = [new BootstrapApp()];
