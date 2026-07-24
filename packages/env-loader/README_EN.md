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
  preloadList: ['.env.local', '.env'],
});
```

### Prefer file by environment variable

When a runtime env var is set (e.g. `cross-env APP_ENV=local`), pass `envVar` to prepend `.env.<value>` to the front of `preloadList`:

```ts
// APP_ENV=staging → resolved order: ['.env.staging', '.env.local', '.env']
const env = Env.searchEnv({
  envVar: 'APP_ENV',
  preloadList: ['.env.local', '.env'],
});

env.load({
  envVar: 'APP_ENV',
  preloadList: ['.env.local', '.env'],
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
- `preloadList`: Specify the list of .env files to load. Default: `['.env.local', '.env']`.
- `envVar`: Env var name; when set, prepends `.env.<value>` to `preloadList` (deduplicated).
- `encoding` / `override` / `debug`, etc.: Forwarded to dotenv (`path` is excluded and resolved from `preloadList`).
- `maxDepth`: Specify the maximum depth for searching.
- `logger`: Specify the logger.
