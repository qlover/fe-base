/* eslint-disable @typescript-eslint/no-explicit-any */
import { factory } from '@qlover/slice-store-react';
import { useMemo } from 'react';

// Type for class constructor
type ConstructorType<T, TArgs extends any[]> = new (...args: TArgs) => T;

// Type for factory function
type FactoryFunction<T, TArgs extends any[]> = (...args: TArgs) => T;

// Overload signatures for better type inference
export function useFactory<T, TArgs extends any[]>(
  factoryOrClass: ConstructorType<T, TArgs>,
  ...args: TArgs
): T;

export function useFactory<T, TArgs extends any[]>(
  factoryOrClass: FactoryFunction<T, TArgs>,
  ...args: TArgs
): T;

/**
 * A hook to create a stable instance of a class or result of a factory function
 * @param factoryOrClass - Constructor or factory function
 * @param args - Arguments to pass to the constructor or factory function
 * @returns A stable instance that won't change between renders
 */
export function useFactory<T>(
  factoryOrClass: ConstructorType<T, any[]> | FactoryFunction<T, any[]>,
  ...args: any[]
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(factoryOrClass as any, ...args), []);
}
