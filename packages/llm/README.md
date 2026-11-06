# @qlover/llm

同构 OpenAI 兼容 LLM 客户端：completions、流式 text / reasoning 分片。凭证由调用方注入，不读站点设置。

## 安装

```bash
pnpm add @qlover/llm
```

Node 代理 fetch（可选）：

```bash
pnpm add undici
```

## Class

```ts
import { createLlmAgent } from '@qlover/llm';

const agent = createLlmAgent({
  apiKey: process.env.OPENAI_API_KEY!,
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini'
});

const result = await agent.completions([
  { role: 'user', content: 'hello' }
]);
```

## 函数

```ts
import { chatCompletion, streamChatParts } from '@qlover/llm';

await chatCompletion({
  apiKey: '...',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'hi' }]
});

for await (const part of streamChatParts({
  apiKey: '...',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'hi' }]
})) {
  console.log(part.kind, part.text);
}
```

## Node 代理

```ts
import { createLlmAgent } from '@qlover/llm';
import { createProxyFetch } from '@qlover/llm/node';

const agent = createLlmAgent({
  apiKey: '...',
  baseUrl: '...',
  model: '...',
  fetch: createProxyFetch(process.env.HTTPS_PROXY)
});
```

## 边界

- **进包**：协议客户端、SSE 解析、可选 Node 代理
- **不进包**：站点设置、业务 Agent 配置、工具调用编排、译档装箱策略
