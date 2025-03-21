import type { BootstrapExecutorPlugin } from '@qlover/fe-prod/core';
import { BootstrapApp } from './BootstrapApp';

export const appBootstrapList: BootstrapExecutorPlugin[] = [new BootstrapApp()];
