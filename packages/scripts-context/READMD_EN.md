# @qlover/scripts-context

`scripts-context` is a tool package for managing and executing scripts, providing configuration search, logging, command execution, etc. It aims to provide a unified context environment for script execution.

## Install

```bash
npm i @qlover/scripts-context
# or
yarn add @qlover/scripts-context
# or
pnpm add @qlover/scripts-context
```

## Usage

```typescript
import { ConfigSearch } from './ConfigSearch';
const configSearch = new ConfigSearch({
  name: 'myapp',
  defaultConfig: { port: 3000 }
});

const config = configSearch.config;
console.log(config.port); // => 3000
```

## Contribution

Welcome to contribute to `scripts-context`! Please ensure that all tests are run before submitting code, and follow the project's code style guide.

### Configuration Search