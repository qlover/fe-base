import { vi } from 'vitest';
import type { DialogHandlerOptions } from '@/base/cases/DialogHandler';
import type { AntdStaticApiInterface } from '@brain-toolkit/antd-theme-override/react';
import type { UIDialogInterface } from '@qlover/corekit-bridge';

export class MockDialogHandler
  implements UIDialogInterface<DialogHandlerOptions>, AntdStaticApiInterface
{
  public setMessage = vi.fn();
  public setModal = vi.fn();
  public setNotification = vi.fn();
  public success = vi.fn();
  public error = vi.fn();
  public info = vi.fn();
  public warn = vi.fn();
  public confirm = vi.fn();
}
