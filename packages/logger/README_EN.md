# @qlover/logger

A flexible, extensible TypeScript logging library for frontend and Node.js applications.

## Installation

```bash
npm install @qlover/logger
```

## Features

- Multiple log levels (fatal, error, warn, info, debug, trace)
- Configurable logging thresholds
- Contextual logging
- Customizable formatters
- Pluggable handlers/appenders
- TypeScript support

## Basic Usage

```typescript
import { Logger, ConsoleAppender, TimestampFormatter } from '@qlover/logger';

// Create a formatter (optional)
const formatter = new TimestampFormatter();

// Create a handler/appender with the formatter
const consoleAppender = new ConsoleAppender(formatter);

// Create a logger with the handler
const logger = new Logger({
  name: 'MyApp',
  level: 'info',
  handlers: consoleAppender
});

// Log at different levels
logger.info('Application started');
logger.debug('Debug information');
logger.warn('Warning message');
logger.error('Error occurred', new Error('Something went wrong'));
```

## Log Levels

The logger supports the following log levels (in order of priority):

- `fatal`: System is unusable, application crashes
- `error`: Error events that might still allow the application to continue running
- `warn`: Potentially harmful situations that don't cause application failure
- `info`: Informational messages highlighting application progress
- `debug`: Detailed information useful for debugging
- `trace`: Most granular information for very detailed diagnostics
- `log`: Alias for `info`

## Advanced Configuration

```typescript
import { Logger, ConsoleAppender, TimestampFormatter } from '@qlover/logger';

const logger = new Logger({
  // Logger name
  name: 'MyService',
  
  // Log level threshold - only logs with priority <= this level will be output
  level: 'info',
  
  // Silent mode - no logs will be output when true
  silent: false,
  
  // Custom log levels with numeric priorities (lower number = higher priority)
  levels: {
    critical: 0,
    important: 1,
    standard: 2,
    verbose: 3
  },
  
  // Handlers/appenders for log output
  handlers: new ConsoleAppender(new TimestampFormatter())
});
```

## Contextual Logging

Add context to your logs by providing an object as the last parameter:

```typescript
logger.info('User logged in', { userId: 123, role: 'admin' });
logger.error('Payment failed', { 
  userId: 456, 
  amount: 99.99, 
  error: new Error('Insufficient funds')
});
```

## Custom Formatters

Create custom formatters by implementing the `FormatterInterface`:

```typescript
import { FormatterInterface, LogEvent } from '@qlover/logger';

class JsonFormatter implements FormatterInterface {
  format(event: LogEvent): unknown {
    return JSON.stringify({
      timestamp: event.timestamp,
      level: event.level,
      message: event.args.join(' '),
      logger: event.loggerName,
      context: event.context
    });
  }
}

// Use with an appender
const consoleAppender = new ConsoleAppender(new JsonFormatter());
```

## Custom Handlers

Create custom handlers by implementing the `HandlerInterface`:

```typescript
import { HandlerInterface, FormatterInterface, LogEvent } from '@qlover/logger';

class FileAppender implements HandlerInterface {
  private formatter: FormatterInterface | null = null;
  
  constructor(private filePath: string) {}
  
  setFormatter(formatter: FormatterInterface): void {
    this.formatter = formatter;
  }
  
  append(event: LogEvent): void {
    const formattedMessage = this.formatter 
      ? this.formatter.format(event) 
      : event.args.join(' ');
      
    // Write to file implementation...
  }
}
```

## License

ISC
