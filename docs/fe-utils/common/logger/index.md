# Logger

`Logger` 类提供了多种日志记录方法，支持不同的日志级别，并可以配置在不同的环境中运行，如 CI、dry run、debug 和 silent 模式。

## 可用日志级别

| 级别  | 描述            |
|-------|-----------------|
| LOG   | 一般日志记录    |
| INFO  | 信息性消息      |
| ERROR | 错误消息        |
| WARN  | 警告消息        |
| DEBUG | 调试信息        |

## 类型定义

### LogLevel
