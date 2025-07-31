import { vi } from 'vitest';
import { I18nService } from '@/base/services/I18nService';

export class MockI18nService extends I18nService {
  constructor() {
    super('/');
  }

  t = vi.fn((key: string) => key);
  changeLanguage = vi.fn();
  changeLoading = vi.fn();
  onBefore = vi.fn();
}
