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

### Basic Usage

```typescript
import { FeScriptContext } from '@qlover/scripts-context';

// Create script context
const context = new FeScriptContext({
  verbose: true,  // Enable detailed logging
  dryRun: false   // Actually execute commands
});

// Use logger
context.logger.info('Starting script execution');
context.logger.error('An error occurred');

// Use shell to execute commands
await context.shell.exec('npm run build');
```

### Configuration Search

```typescript
import { ConfigSearch } from '@qlover/scripts-context';

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