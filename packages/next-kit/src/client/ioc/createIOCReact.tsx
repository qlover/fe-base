'use client';

import {
  createContext,
  useContext,
  useState,
  type Context,
  type ReactNode
} from 'react';
import {
  createIOCFunction,
  ReflectionIOCContainer,
  type IOCContainerInterface,
  type IOCFunctionInterface,
  type IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';
import type { LoggerInterface } from '@qlover/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNewable = new (...args: any[]) => any;

export type CreateIOCReactResult<IdentifierMap> = {
  IOCContext: Context<IOCFunctionInterface<
    IdentifierMap,
    IOCContainerInterface
  > | null>;
  useIOC: {
    (): IOCFunctionInterface<IdentifierMap, IOCContainerInterface>;
    <T extends keyof IdentifierMap | AnyNewable>(
      identifier: T
    ): T extends keyof IdentifierMap
      ? IdentifierMap[T]
      : T extends AnyNewable
        ? InstanceType<T>
        : never;
  };
  IOCProvider: (props: {
    children: ReactNode;
    register: IOCRegisterInterface<IOCContainerInterface>;
    /** Defaults to `new ReflectionIOCContainer(logger)`. */
    createContainer?: (logger?: LoggerInterface) => IOCContainerInterface;
    logger?: LoggerInterface;
  }) => ReactNode;
};

/**
 * Factory for typed IOC React context / hook / provider.
 * Apps pass their `IOCIdentifierMap` as the generic and inject registration.
 */
export function createIOCReact<
  IdentifierMap
>(): CreateIOCReactResult<IdentifierMap> {
  const IOCContext = createContext<IOCFunctionInterface<
    IdentifierMap,
    IOCContainerInterface
  > | null>(null);

  function useIOC(): IOCFunctionInterface<IdentifierMap, IOCContainerInterface>;
  function useIOC<T extends keyof IdentifierMap | AnyNewable>(
    identifier: T
  ): T extends keyof IdentifierMap
    ? IdentifierMap[T]
    : T extends AnyNewable
      ? InstanceType<T>
      : never;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function useIOC(identifier?: any): any {
    const IOC = useContext(IOCContext);

    if (!IOC) {
      throw new Error('IOC is not found');
    }

    if (identifier === undefined) {
      return IOC;
    }

    return IOC(identifier);
  }

  function IOCProvider(props: {
    children: ReactNode;
    register: IOCRegisterInterface<IOCContainerInterface>;
    createContainer?: (logger?: LoggerInterface) => IOCContainerInterface;
    logger?: LoggerInterface;
  }) {
    const { children, register, createContainer, logger } = props;

    const [IOC] = useState(() => {
      const containerImpl: IOCContainerInterface = createContainer
        ? createContainer(logger)
        : new ReflectionIOCContainer(logger);
      const ioc = createIOCFunction<IdentifierMap>(containerImpl);
      register.register(ioc.implemention!, ioc);
      return ioc;
    });

    return (
      <IOCContext.Provider value={IOC}>{children}</IOCContext.Provider>
    );
  }

  return { IOCContext, useIOC, IOCProvider };
}
