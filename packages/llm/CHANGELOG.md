# Changelog

## 0.2.0

- 新增 `@qlover/llm/executor`：`LifecycleExecutor` 门面（超时 / 中止 / completions 重试）
- `completions` 支持 `signal`；流式默认不重试

## 0.1.0

- 初版：`OpenAiCompatibleAgent`、`createLlmAgent` / `chatCompletion` / `streamChatParts`
- SSE 流式 text / reasoning 分片
- `@qlover/llm/node`：`createProxyFetch`
