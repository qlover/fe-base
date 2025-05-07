# @qlover/logger

一个灵活、可扩展的 TypeScript 日志库，适用于前端和 Node.js 应用。

## 安装

```bash
npm install @qlover/logger
```

## 特性

- 多种日志级别（fatal、error、warn、info、debug、trace）
- 可配置的日志阈值
- 上下文日志记录
- 自定义格式化器
- 可插拔的处理器/追加器
- TypeScript 支持

## 基本用法

```typescript
import { Logger, ConsoleAppender, TimestampFormatter } from '@qlover/logger';

// 创建格式化器（可选）
const formatter = new TimestampFormatter();

// 使用格式化器创建处理器/追加器
const consoleAppender = new ConsoleAppender(formatter);

// 使用处理器创建日志记录器
const logger = new Logger({
  name: 'MyApp',
  level: 'info',
  handlers: consoleAppender
});

// 使用不同级别记录日志
logger.info('应用已启动');
logger.debug('调试信息');
logger.warn('警告信息');
logger.error('发生错误', new Error('出现问题'));
```

## 日志级别

日志记录器支持以下日志级别（按优先级排序）：

- `fatal`：系统无法使用，应用崩溃
- `error`：可能允许应用继续运行的错误事件
- `warn`：潜在有害的情况，不会导致应用失败
- `info`：突出应用进度的信息性消息
- `debug`：用于调试的详细信息
- `trace`：用于非常详细诊断的最细粒度信息
- `log`：`info` 的别名

## 高级配置

```typescript
import { Logger, ConsoleAppender, TimestampFormatter } from '@qlover/logger';

const logger = new Logger({
  // 日志记录器名称
  name: 'MyService',
  
  // 日志级别阈值 - 只有优先级 <= 此级别的日志才会输出
  level: 'info',
  
  // 静默模式 - 为 true 时不会输出任何日志
  silent: false,
  
  // 自定义日志级别及其数字优先级（数字越小 = 优先级越高）
  levels: {
    critical: 0,
    important: 1,
    standard: 2,
    verbose: 3
  },
  
  // 日志输出的处理器/追加器
  handlers: new ConsoleAppender(new TimestampFormatter())
});
```

## 上下文日志记录

通过提供一个对象作为最后一个参数，为日志添加上下文：

```typescript
logger.info('用户已登录', { userId: 123, role: 'admin' });
logger.error('支付失败', { 
  userId: 456, 
  amount: 99.99, 
  error: new Error('资金不足')
});
```

## 自定义格式化器

通过实现 `FormatterInterface` 创建自定义格式化器：

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

// 与追加器一起使用
const consoleAppender = new ConsoleAppender(new JsonFormatter());
```

## 自定义处理器

通过实现 `HandlerInterface` 创建自定义处理器：

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
      
    // 写入文件的实现...
  }
}
```

## 许可证

ISC
