import { IOCContext } from '@/uikit/contexts/IOCContext';
import { testIOC } from '../testIOC/TestIOC';

export function TestBootstrapsProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const IOC = testIOC.create();

  return (
    <IOCContext.Provider data-testid="TestBootstrapsProvider" value={IOC}>
      {children}
    </IOCContext.Provider>
  );
}
