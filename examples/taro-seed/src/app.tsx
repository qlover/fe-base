import { createIOCFunction } from '@qlover/corekit-bridge';
import { useLaunch } from '@tarojs/taro';
import { useState, type PropsWithChildren } from 'react';
import { I18nProvider } from './contexts/I18nProvider';
import { IOCContext } from './contexts/IOCContext';
import { logger } from './globals';
import { BootstrapClient } from './impls/BootstrapClient';
import { IOCIdentifierRegister } from './impls/IOCIdentifierRegister';
import { SimpleIOCContainer } from './impls/SimpleIOCContainer';
import type { IOCIdentifierMap } from './config/ioc-identifier';
import './styles/index.css';

function App({ children }: PropsWithChildren<unknown>) {
  const [IOC] = useState(() => {
    const IOC = createIOCFunction<IOCIdentifierMap>(
      new SimpleIOCContainer(logger)
    );
    IOCIdentifierRegister.register(IOC.implemention!, IOC);
    return IOC;
  });

  useLaunch(() => {
    new BootstrapClient(IOC).startup(globalThis);
  });

  return (
    <IOCContext.Provider value={IOC}>
      <I18nProvider>{children}</I18nProvider>
    </IOCContext.Provider>
  );
}

export default App;
