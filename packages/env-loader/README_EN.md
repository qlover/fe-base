# @qlover/env-loader

@qlover/env-loader is a package for managing environment variables. It provides a centralized way to load and manage environment variables from .env files.

## Installation

```bash
npm install @qlover/env-loader
or
yarn add @qlover/env-loader
```

## Usage

### Initialize

To use the Env class, you first need to create an instance. You can initialize it by passing configuration options.

```ts
import { Env } from '@qlover/env-loader';

const env = new Env({ rootPath: process.cwd() });
```

### Load environment variables

```ts
const env = new Env({ rootPath: process.cwd() });

env.load();
```

### Get environment variables

```ts
const env = new Env({ rootPath: process.cwd() });

env.get('NODE_ENV');
```

### Search and load .env files

```ts
const env = Env.searchEnv({
  cwd: '/path/to/start',
  preloadList: ['.env'],
});
```

### Get, set and delete environment variables

```ts
env.set('NODE_ENV', 'development');
env.delete('NODE_ENV');
env.get('NODE_ENV');
```


## Configuration options

The Env class provides some configuration options to control the loading and searching behavior of environment variables.

- `cwd`: Specify the root directory for searching.
- `preloadList`: Specify the list of .env files to load.
- `maxDepth`: Specify the maximum depth for searching.
- `logger`: Specify the logger.
