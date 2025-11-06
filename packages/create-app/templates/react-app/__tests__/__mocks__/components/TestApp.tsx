import { TestBootstrapsProvider } from './TestBootstrapsProvider';

export function TestApp({ children }: { children: React.ReactNode }) {
  return <TestBootstrapsProvider>{children}</TestBootstrapsProvider>;
}
