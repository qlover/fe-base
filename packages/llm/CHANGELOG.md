# Changelog

## 0.3.0

- **Breaking**：`createLlmExecutor` 默认不挂 Timeout/Retry；由用户 `.use` / `plugins` 装配
- 重试仅通过 `LlmRetryPlugin`（修复 `await` 任务以捕获 Promise 拒绝）
- 去掉创建参数 `timeoutMs` / `retry`；流式不再自动合并超时

## 0.2.0

- 新增 `@qlover/llm/executor`：`LifecycleExecutor` 门面（超时 / 中止 / completions 重试）
- `completions` 支持 `signal`；流式默认不重试

## 0.1.0

- 初版：`OpenAiCompatibleAgent`、`createLlmAgent` / `chatCompletion` / `streamChatParts`
- SSE 流式 text / reasoning 分片
- `@qlover/llm/node`：`createProxyFetch`
