import { vi } from 'vitest';
import type { InteractionHubInterface } from '@/base/port/InteractionHubInterface';
import type { AntdStaticApiInterface } from '@brain-toolkit/antd-theme-override/react';

export class MockDialogHandler
  implements InteractionHubInterface, AntdStaticApiInterface
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
