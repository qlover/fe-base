# fe-corekit

## Introduction

fe-corekit (@qlover/fe-corekit) is a comprehensive frontend core toolkit that provides a variety of useful tools and modules to help developers build frontend applications more efficiently. It includes multiple core functional modules such as storage management, serialization, network requests, logging, task execution, and more.

## Installation

Install using npm, yarn, or pnpm:

```bash
# npm
npm install @qlover/fe-corekit

# yarn
yarn add @qlover/fe-corekit

# pnpm
pnpm add @qlover/fe-corekit
```

## Usage

fe-corekit supports multiple import methods, allowing you to import the entire library or specific modules as needed:

### Import the entire library

```typescript
import * as CoreKit from '@qlover/fe-corekit';

const logger = new CoreKit.Logger();
logger.info('Hello, world!');
```

### Import as needed

```typescript
// Import the logger module
import { Logger } from '@qlover/fe-corekit';

const logger = new Logger();
logger.info('Hello, world!');

// Import the storage module
import { JSONStorage } from '@qlover/fe-corekit';

const storage = new JSONStorage();
storage.setItem('key', { data: 'value' });
```

## Core Features

### Core Module

- **Storage**: Provides storage, retrieval, and management for JSON data, supporting custom storage backends and serializers
- **Serializer**: Data serialization and deserialization tools
- **Request**: Network request tools, simplifying API calls
- **Logger**: Flexible logging system
- **Executor**: Task execution management
- **Interface Definitions**: Provides a series of standard interface definitions, ensuring consistency and interoperability between modules

## Usage Examples

### JSON Storage

```typescript
// Create memory storage
const storage = new JSONStorage();
storage.setItem('key', { data: 'value' }, 3600); // Set expiration time to 3600 milliseconds
const value = storage.getItem('key');
// => { data: 'value' }
```

### Using Local Storage

```typescript
// Use the browser's localStorage
const storage = new JSONStorage(localStorage);
storage.setItem('key', { data: 'value' });
const value = storage.getItem('key');
// => { data: 'value' }
```

### Custom Serializer and Storage

```typescript
// Use custom serializer and storage backend
const customSerializer = {
  serialize: JSON.stringify,
  deserialize: JSON.parse
};

const customStorage = {
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  getItem: (key: string) => {
    return localStorage.getItem(key);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

const storage = new JSONStorage(customStorage, customSerializer);
storage.setItem('key', { data: 'value' });
```

### Logging

```typescript
const logger = new Logger();
logger.info('Application started');
logger.warn('Warning message');
logger.error('Error message');
```

## TypeScript Support

fe-corekit is completely written in TypeScript, providing complete type definitions for good IDE hints and type checking.

## Quick Navigation

- [Core Module Documentation](./common/)

## Compatibility

fe-corekit supports all modern browsers and Node.js environments. It supports both ES modules and CommonJS module systems.

## Version Information

Current version: 1.2.0

For detailed information about updates and changes, please check the [Changelog](./CHANGELOG.md).
