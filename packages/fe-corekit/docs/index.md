## `FeCorekit` (Module)

**Type:** `module FeCorekit`

Comprehensive frontend core toolkit for building robust web applications

This module provides a collection of essential utilities and abstractions for
frontend development, designed to work in both browser and Node.js environments.
It offers reusable components for common patterns like request handling, state
management, async operations, and data serialization.

Core Components:

- Aborter: Operation cancellation and timeout management
  - Automatic timeout handling with configurable duration
  - Signal composition for complex abort scenarios
  - Resource cleanup and memory management
  - Integration with fetch API and async operations

- Executor: Lifecycle-based task execution with plugin support
  - Plugin-based architecture for extensibility
  - Async and sync task execution
  - Lifecycle hooks (before, exec, after, error, finally)
  - Context management and parameter passing
  - Error handling with ExecutorError

- Request: HTTP request management with adapters
  - Adapter pattern for fetch/axios integration
  - Request/response interceptors
  - URL building and header management
  - Type-safe request configuration
  - Plugin system for request customization

- Storage: Client-side storage abstractions
  - Unified API for localStorage/sessionStorage
  - Expiration support for cached data
  - Serialization integration
  - Type-safe storage operations
  - Sync and async storage interfaces

- Serializer: Data serialization utilities
  - JSON serialization with error handling
  - Base64 encoding/decoding
  - Custom serializer support
  - Type-safe serialization

- Encrypt: Data encryption utilities
  - String encryption/decryption
  - Integration with storage for secure data
  - Configurable encryption algorithms

- Common: Shared TypeScript utility types
  - ValueOf: Extract value types from objects
  - Intersection: Type intersection utilities
  - PartialDeep: Deep partial type construction

### Exported Members

**Aborter Module:**

- `Aborter`
  : Main abort manager class
- `AborterInterface`
  : Abort management interface
- `AborterConfig`
  : Configuration type for abort operations
- `AbortError`
  : Custom error for abort operations
- `isAbortError`
  : Utility to detect abort errors

**Executor Module:**

- `LifecycleExecutor`
  : Async lifecycle executor
- `LifecycleSyncExecutor`
  : Sync lifecycle executor
- `ExecutorContextImpl`
  : Context implementation
- `LifecyclePluginInterface`
  : Plugin interface
- `ExecutorError`
  : Executor error class
- `RetryPlugin`
  : Retry logic plugin
- `AbortPlugin`
  : Abort integration plugin

**Request Module:**

- `RequestExecutor`
  : Main request executor
- `RequestAdapterFetch`
  : Fetch API adapter
- `RequestAdapterAxios`
  : Axios adapter
- `RequestHeaderInjector`
  : Header injection utility
- `SimpleUrlBuilder`
  : URL construction utility
- `RequestPlugin`
  : Request plugin base
- `ResponsePlugin`
  : Response plugin base

**Storage Module:**

- `SyncStorage`
  : Synchronous storage implementation
- `ObjectStorage`
  : Object-based storage
- `KeyStorage`
  : Key-value storage
- `SyncStorageInterface`
  : Storage interface
- `ExpireOptions`
  : Expiration configuration

**Serializer Module:**

- `JSONSerializer`
  : JSON serialization
- `Base64Serializer`
  : Base64 encoding/decoding
- `SerializerInterface`
  : Serializer interface

**Encrypt Module:**

- `EncryptorInterface`
  : Encryption interface

### Basic Usage

```typescript
import {
  Aborter,
  LifecycleExecutor,
  RequestExecutor,
  SyncStorage,
  JSONSerializer
} from '@qlover/fe-corekit';

// Abort management
const aborter = new Aborter();
const { signal } = aborter.register({ abortTimeout: 5000 });

// Executor with plugins
const executor = new LifecycleExecutor();
executor.use(new RetryPlugin({ maxRetries: 3 }));
const result = await executor.exec(async (ctx) => {
  return await fetchData();
});

// Request handling
const request = new RequestExecutor({
  baseURL: 'https://api.example.com',
  adapter: new RequestAdapterFetch()
});
const data = await request.get('/users');

// Storage with serialization
const storage = new SyncStorage(localStorage, new JSONSerializer());
storage.set('user', { id: 1, name: 'John' }, { expire: 3600 });
```

### Advanced Usage

```typescript
import {
  LifecycleExecutor,
  RequestExecutor,
  Aborter,
  RetryPlugin
} from '@qlover/fe-corekit';

// Complex executor pipeline
const executor = new LifecycleExecutor();
executor.use(new RetryPlugin({ maxRetries: 3, delay: 1000 }));
executor.use({
  name: 'logger',
  onBefore: async (ctx) => {
    console.log('Starting task:', ctx.parameters);
  },
  onAfter: async (ctx, result) => {
    console.log('Task completed:', result);
    return result;
  }
});

// Request with abort and retry
const aborter = new Aborter();
const request = new RequestExecutor({
  baseURL: 'https://api.example.com',
  adapter: new RequestAdapterFetch()
});

const { signal } = aborter.register({ abortTimeout: 10000 });
const data = await request.get('/data', { signal });
```

### Environment Compatibility

- Browser: Modern browsers with ES2020+ support
- Node.js: Version 16+ (with polyfills for AbortSignal features)
- TypeScript: Version 4.5+ recommended
- Build tools: Supports Vite, Webpack, Rollup

**See:**

https://github.com/qlover/fe-base/tree/main/packages/fe-corekit
for detailed documentation

---
