import { vi } from 'vitest';

export class Env {
  public static searchEnv = vi.fn().mockImplementation(() => {
    return {
      get: vi.fn().mockImplementation((key) => {
        return process.env[key];
      }),
      set: vi.fn(),
      remove: vi.fn(),
      load: vi.fn(),
      getDestroy: vi.fn()
    };
  });
}
