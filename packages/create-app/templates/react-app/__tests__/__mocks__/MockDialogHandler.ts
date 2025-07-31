import { InteractionHubInterface } from '@/base/port/InteractionHubInterface';
import { AntdStaticApiInterface } from '@brain-toolkit/antd-theme-override/react';
import { vi } from 'vitest';

export class MockDialogHandler
  implements InteractionHubInterface, AntdStaticApiInterface
{
  setMessage = vi.fn();
  setModal = vi.fn();
  setNotification = vi.fn();
  success = vi.fn();
  error = vi.fn();
  info = vi.fn();
  warn = vi.fn();
  confirm = vi.fn();
}
