import type { BootstrapExecutorPlugin } from '@qlover/fe-prod/core';
import { BootstrapApp } from './BootstrapApp';
import { UserApiBootstarp } from '@/base/apis/userApi/UserApiBootstarp';
import { FeApiBootstarp } from '@/base/apis/feApi/FeApiBootstarp';

export const appBootstrapList: BootstrapExecutorPlugin[] = [
  new UserApiBootstarp(),
  new FeApiBootstarp(),
  new BootstrapApp()
];
