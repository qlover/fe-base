import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { ProxyAgent, fetch as undiciFetch } from 'undici';
import { ScriptPlugin, type ScriptPluginProps } from '@qlover/scripts-context';
import type Code2MDContext from '../implments/Code2MDContext';
import {
  buildLocalizedMarkdownPath,
  buildLlmTranslateSystemPrompt,
  encodeLlmTranslateBatchPrompt,
  hasLlmTranslateConfigIntent,
  isLocalizedMarkdownPath,
  mapWithConcurrency,
  packLlmTranslateUnits,
  parseLlmTranslateBatchResponse,
  parseRetryAfterMs,
  resolveLlmTranslateConfig,
  type LlmTranslateConfigInputType,
  type LlmTranslateConfigType,
  type LlmTranslateUnitType
} from './LlmTranslateConfigUtil';

/**
 * LlmTranslate 插件配置（`fe-config.json` → `code2md.llmTranslate`）。
 */
export interface LlmTranslateProps
  extends ScriptPluginProps, LlmTranslateConfigInputType {}

/**
 * Formats 之后的通用译档插件：整文件（可多文件按字符预算装箱）译出并列 md。
 *
 * - 目标档已存在且未 `force` → 跳过（增量）
 * - `batchSize` + `maxBatchChars` + `maxFileChars` 约束装箱，防上下文爆炸
 * - 打包请求失败时降级为逐文件重试
 */
export class LlmTranslate extends ScriptPlugin<
  Code2MDContext,
  LlmTranslateProps
> {
  /** 复用同一 ProxyAgent，避免每个请求新建连接。 */
  protected proxyAgent: ProxyAgent | null = null;
  protected loggedProxy = false;
  /** 上一请求结束时间戳；用于 `requestDelayMs` 间隔。 */
  protected lastRequestEndedAt = 0;
  /** 本轮写出的译档路径，供结束后 prettier / eslint。 */
  protected writtenOutPaths: string[] = [];

  /**
   * @param context - 与 Formats 共享的 Code2MD 上下文
   * @param props - 运行时覆盖（一般不必传，读 fe-config）
   */
  constructor(context: Code2MDContext, props: LlmTranslateProps = {}) {
    super(context, 'llmTranslate', props);
  }

  /**
   * 无前置逻辑；保留 override 以收窄 onBefore 返回类型（与 Formats 一致）。
   */
  public override async onBefore(): Promise<void> {
    return;
  }

  /**
   * Formats（含 prettier）全部 onSuccess 之后执行。
   */
  public override async onSuccess(): Promise<void> {
    this.writtenOutPaths = [];
    const raw = this.getConfig() as LlmTranslateProps;
    if (!hasLlmTranslateConfigIntent(raw)) {
      return;
    }

    const resolved = resolveLlmTranslateConfig(raw);
    if (!resolved.ok) {
      this.logger.warn(
        `[llm-translate] skip: missing ${resolved.missing.join(
          ', '
        )} in fe-config code2md.llmTranslate (apiKey/baseUrl/model may use OPENAI_* env)`
      );
      return;
    }

    const config = resolved.config;
    const paths = this.context.options.writtenMarkdownPaths ?? [];
    const sourcePaths = paths.filter(
      (filePath) =>
        typeof filePath === 'string' &&
        filePath.length > 0 &&
        !isLocalizedMarkdownPath(filePath)
    );

    if (sourcePaths.length === 0) {
      this.logger.info('[llm-translate] no markdown paths to translate');
      return;
    }

    const units: LlmTranslateUnitType[] = [];
    let skippedExisting = 0;
    let nextId = 0;

    for (const sourcePath of sourcePaths) {
      for (const locale of config.locales) {
        const outPath = buildLocalizedMarkdownPath(sourcePath, locale);
        if (!config.force && existsSync(outPath)) {
          skippedExisting += 1;
          continue;
        }
        const content = readFileSync(sourcePath, 'utf8');
        units.push({
          id: String(nextId),
          sourcePath,
          outPath,
          locale,
          content,
          charCount: content.length
        });
        nextId += 1;
      }
    }

    if (skippedExisting > 0) {
      this.logger.info(
        `[llm-translate] skip ${skippedExisting} existing target(s) (use force / --llm-translate-force to overwrite)`
      );
    }

    if (units.length === 0) {
      this.logger.info('[llm-translate] nothing to translate');
      return;
    }

    // 按 locale 分包，避免一包混多种目标语言
    const byLocale = new Map<string, LlmTranslateUnitType[]>();
    for (const unit of units) {
      const list = byLocale.get(unit.locale) ?? [];
      list.push(unit);
      byLocale.set(unit.locale, list);
    }

    const allBatches: {
      readonly locale: string;
      readonly units: readonly LlmTranslateUnitType[];
    }[] = [];

    for (const [locale, localeUnits] of byLocale) {
      const packed = packLlmTranslateUnits(localeUnits, {
        batchSize: config.batchSize,
        maxBatchChars: config.maxBatchChars,
        maxFileChars: config.maxFileChars
      });
      for (const oversized of packed.oversized) {
        this.logger.warn(
          `[llm-translate] skip oversized ${oversized.sourcePath} (${oversized.charCount} > maxFileChars=${config.maxFileChars})`
        );
      }
      for (const batch of packed.batches) {
        allBatches.push({ locale, units: batch });
      }
    }

    if (config.requestDelayMs > 0 && config.concurrency > 1) {
      this.logger.warn(
        `[llm-translate] requestDelayMs=${config.requestDelayMs} works best with concurrency=1 (current=${config.concurrency})`
      );
    }

    this.logger.info(
      `[llm-translate] ${units.length} unit(s) → ${allBatches.length} batch(es); concurrency=${config.concurrency}, batchSize=${config.batchSize}, requestDelayMs=${config.requestDelayMs}, rateLimitRetries=${config.rateLimitRetries}`
    );

    await mapWithConcurrency(allBatches, config.concurrency, async (batch) => {
      await this.translateBatch(batch.units, batch.locale, config);
    });

    await this.formatWrittenOutputs();
  }

  /**
   * 译档写在 Formats prettier 之后，需对本轮产出再跑一遍 formatOutput。
   */
  protected async formatWrittenOutputs(): Promise<void> {
    const uniquePaths = [...new Set(this.writtenOutPaths)].filter(
      (filePath) => typeof filePath === 'string' && filePath.length > 0
    );
    this.writtenOutPaths = [];
    if (uniquePaths.length === 0) {
      return;
    }

    const formatOutput = this.context.getParameters(
      ['formats', 'formatOutput'],
      undefined
    );
    if (formatOutput !== 'prettier' && formatOutput !== 'eslint') {
      return;
    }

    const quoted = uniquePaths.map((filePath) => `"${filePath}"`).join(' ');
    const command =
      formatOutput === 'eslint'
        ? `npx eslint ${quoted} --fix`
        : `npx prettier ${quoted} --write`;
    this.logger.info(
      `[llm-translate] executing ${formatOutput} on ${uniquePaths.length} translated file(s)...`
    );
    try {
      await this.shell.exec(command, {
        silent: false,
        dryRun: this.context.dryRun
      });
      this.logger.info(
        `[llm-translate] ${formatOutput} formatting completed successfully`
      );
    } catch (error: unknown) {
      this.logger.error(
        `[llm-translate] ${formatOutput} formatting failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 按 `requestDelayMs` 等待与上一请求的间隔。
   */
  protected async waitForRequestGap(
    config: LlmTranslateConfigType
  ): Promise<void> {
    const delayMs = config.requestDelayMs;
    if (delayMs <= 0 || this.lastRequestEndedAt <= 0) {
      return;
    }
    const elapsed = Date.now() - this.lastRequestEndedAt;
    const waitMs = Math.max(0, delayMs - elapsed);
    if (waitMs <= 0) {
      return;
    }
    this.logger.info(`[llm-translate] delay ${waitMs}ms before next request`);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, waitMs);
    });
  }

  /**
   * 429 重试等待：优先 Retry-After，否则 max(requestDelayMs, 15000)。
   */
  protected resolveRateLimitWaitMs(
    retryAfterHeader: string | null,
    config: LlmTranslateConfigType
  ): number {
    const fromHeader = parseRetryAfterMs(retryAfterHeader);
    if (fromHeader != null && fromHeader > 0) {
      return fromHeader;
    }
    return Math.max(config.requestDelayMs, 15_000);
  }

  /**
   * 翻译一包；失败则降级为逐文件。
   */
  protected async translateBatch(
    units: readonly LlmTranslateUnitType[],
    locale: string,
    config: LlmTranslateConfigType
  ): Promise<void> {
    try {
      const translatedMap = await this.requestTranslation(
        units,
        locale,
        config
      );
      this.writeTranslatedUnits(units, translatedMap);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (units.length === 1) {
        this.logger.warn(
          `[llm-translate] failed ${units[0].sourcePath} (${locale}): ${message}`
        );
        return;
      }
      this.logger.warn(
        `[llm-translate] batch of ${units.length} failed, fallback per file: ${message}`
      );
      for (const unit of units) {
        try {
          const translatedMap = await this.requestTranslation(
            [unit],
            locale,
            config
          );
          this.writeTranslatedUnits([unit], translatedMap);
        } catch (singleError) {
          this.logger.warn(
            `[llm-translate] failed ${unit.sourcePath} (${locale}): ${
              singleError instanceof Error
                ? singleError.message
                : String(singleError)
            }`
          );
        }
      }
    }
  }

  /**
   * 写盘；缺 id 时 warn。
   */
  protected writeTranslatedUnits(
    units: readonly LlmTranslateUnitType[],
    translatedMap: ReadonlyMap<string, string>
  ): void {
    for (const unit of units) {
      const body = translatedMap.get(unit.id);
      if (typeof body !== 'string' || body.trim().length === 0) {
        this.logger.warn(
          `[llm-translate] missing translation for id=${unit.id} path=${unit.sourcePath}`
        );
        continue;
      }
      writeFileSync(unit.outPath, body, 'utf8');
      this.writtenOutPaths.push(unit.outPath);
      this.logger.info(`[llm-translate] wrote ${unit.outPath}`);
    }
  }

  /**
   * 原生 fetch 不读 `HTTP_PROXY`；有代理时改走 undici `ProxyAgent`。
   */
  protected resolveHttpFetch(): typeof fetch {
    const proxy = (
      process.env.HTTPS_PROXY ||
      process.env.https_proxy ||
      process.env.HTTP_PROXY ||
      process.env.http_proxy ||
      ''
    ).trim();
    if (!proxy) {
      if (!this.loggedProxy) {
        this.logger.warn(
          '[llm-translate] no HTTP_PROXY/HTTPS_PROXY; direct fetch (may 403 in restricted networks)'
        );
        this.loggedProxy = true;
      }
      return globalThis.fetch.bind(globalThis);
    }
    if (!this.proxyAgent) {
      this.proxyAgent = new ProxyAgent({
        uri: proxy,
        connections: 4
      });
    }
    if (!this.loggedProxy) {
      this.logger.info(
        `[llm-translate] using proxy ${this.maskProxyUrl(proxy)}`
      );
      this.loggedProxy = true;
    }
    const agent = this.proxyAgent;
    return ((input: RequestInfo | URL, init?: RequestInit) =>
      undiciFetch(
        input as Parameters<typeof undiciFetch>[0],
        {
          method: init?.method,
          headers: init?.headers as HeadersInit | undefined,
          body: init?.body as string | undefined,
          signal: init?.signal as AbortSignal | undefined,
          dispatcher: agent,
          // undici 扩展超时字段（DOM RequestInit 类型未收录）
          headersTimeout: 120_000,
          bodyTimeout: 120_000
        } as Parameters<typeof undiciFetch>[1]
      ) as unknown as Promise<Response>) as unknown as typeof fetch;
  }

  /**
   * 日志里隐藏代理凭据。
   */
  protected maskProxyUrl(proxy: string): string {
    try {
      const url = new URL(proxy);
      if (url.username || url.password) {
        url.username = '***';
        url.password = '';
      }
      return url.toString();
    } catch {
      return '(invalid proxy url)';
    }
  }

  /**
   * 展开 `fetch failed` 的 cause，便于区分代理未开 / 超时 / DNS。
   */
  protected formatRequestError(error: unknown): string {
    if (!(error instanceof Error)) {
      return String(error);
    }
    const parts = [error.message];
    let current: unknown = error.cause;
    let depth = 0;
    while (current instanceof Error && depth < 3) {
      parts.push(current.message);
      current = current.cause;
      depth += 1;
    }
    if (
      current &&
      typeof current === 'object' &&
      'code' in current &&
      typeof (current as { code: unknown }).code === 'string'
    ) {
      parts.push(`code=${(current as { code: string }).code}`);
    }
    return parts.join(' | ');
  }

  /**
   * 调用 Chat Completions，返回 id → 译文。
   * 请求间遵守 `requestDelayMs`；429 时按 `rateLimitRetries` 重试。
   */
  protected async requestTranslation(
    units: readonly LlmTranslateUnitType[],
    locale: string,
    config: LlmTranslateConfigType
  ): Promise<ReadonlyMap<string, string>> {
    const userContent = encodeLlmTranslateBatchPrompt(units);
    const httpFetch = this.resolveHttpFetch();
    const maxAttempts = 1 + config.rateLimitRetries;
    let attempt = 0;
    let response: Response | null = null;
    let lastErrorBody = '';

    while (attempt < maxAttempts) {
      attempt += 1;
      await this.waitForRequestGap(config);
      try {
        response = await httpFetch(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.model,
            temperature: 0.2,
            messages: [
              {
                role: 'system',
                content: buildLlmTranslateSystemPrompt(
                  locale,
                  config,
                  units.length
                )
              },
              { role: 'user', content: userContent }
            ]
          })
        });
      } catch (error: unknown) {
        this.lastRequestEndedAt = Date.now();
        throw new Error(this.formatRequestError(error));
      }
      this.lastRequestEndedAt = Date.now();

      if (response.ok) {
        break;
      }

      lastErrorBody = await response.text();
      const canRetry429 = response.status === 429 && attempt < maxAttempts;
      if (!canRetry429) {
        throw new Error(
          `HTTP ${response.status}: ${lastErrorBody.slice(0, 200)}`
        );
      }

      const waitMs = this.resolveRateLimitWaitMs(
        response.headers.get('retry-after'),
        config
      );
      this.logger.warn(
        `[llm-translate] HTTP 429, retry ${attempt}/${maxAttempts} after ${waitMs}ms`
      );
      await new Promise<void>((resolve) => {
        setTimeout(resolve, waitMs);
      });
      this.lastRequestEndedAt = Date.now();
      response = null;
    }

    if (response == null || !response.ok) {
      throw new Error(
        `HTTP 429: ${lastErrorBody.slice(0, 200) || 'rate limited'}`
      );
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('empty translation response');
    }

    const parsed = parseLlmTranslateBatchResponse(content, units);
    if (parsed.size === 0) {
      throw new Error('could not parse translation response');
    }
    return parsed;
  }
}
