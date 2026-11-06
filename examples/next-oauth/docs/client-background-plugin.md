# 客户端可后台任务：插件式内存任务

约定：凡**可以**在离开当前业务页后继续执行的同步 / 预拉 / 队列 drain，做成**独立 Bootstrap 插件式任务**，不要揉进 Panel / 页面 Service。

这里的「后台」指 **SPA 进程内的内存单例**（`start` / `stop` + 定时与浏览器事件），不要求 Web Worker。

## 职责切分

```text
业务面                         插件任务（Bootstrap / start）
─────────────────────────     ────────────────────────────
采集 / 用户意图                何时 sync、重试、keepalive
只 enqueue                     自管 visibility / online / idle
不调用 sync / flush            ACK 后删队列；毒丸策略自定
```

## 生命周期

| 方法 | 含义 |
| --- | --- |
| `start()` | 幂等；挂监听；可选首轮 drain |
| `stop()` | 清 timer、卸监听；队列可保留 |
| `enqueue*` | 业务唯一写入点；未 start 时只落盘/入内存 |

组装：在 `BootstrapClient.getPlugins` 注册（见 `ExampleBackgroundTask`）。

真源细节（含正反例）见 xOranj `apps/web/docs/v2/client-background-plugin.md`；合入模板时**不要**带入 Focus / Enrichment 业务。
