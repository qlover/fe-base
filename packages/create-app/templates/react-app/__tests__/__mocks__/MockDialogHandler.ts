import { vi } from 'vitest';
import type { InteractionHubInterface } from '@/base/port/InteractionHubInterface';
import type { AntdStaticApiInterface } from '@brain-toolkit/antd-theme-override/react';

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
