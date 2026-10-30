/**
 * LlmTranslate 配置解析、装箱与路径/提示词纯函数。
 *
 * 复用方：{@link LlmTranslate}、单元测试。
 */

/** 批量请求里单篇文档的起止标记前缀。 */
export const LLM_TRANSLATE_FILE_MARKER_PREFIX = '<<<FILE' as const;
export const LLM_TRANSLATE_FILE_END_MARKER = '<<<END FILE>>>' as const;

/**
 * `fe-config.json` → `code2md.llmTranslate` 的配置形状。
 */
export type LlmTranslateConfigType = {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly locales: readonly string[];
  /**
   * 同时进行的「包」级请求上限。
   * 本机 Ollama 建议 `1`；Groq 等云端可 `1`～`2`。
   *
   * @default 1
   */
  readonly concurrency: number;
  /**
   * 一包最多篇数（与 {@link maxBatchChars} 同时约束）。
   *
   * @default 1
   */
  readonly batchSize: number;
  /**
   * 一包源文字符上限（防上下文爆炸）。
   *
   * @default 24000
   */
  readonly maxBatchChars: number;
  /**
   * 单文件超过则不译（warn 跳过），避免 10MB 级拖垮请求。
   *
   * @default 16000
   */
  readonly maxFileChars: number;
  /**
   * 为 true 时即使目标 `*.en.doc.md` 已存在也重译覆盖。
   *
   * @default false
   */
  readonly force: boolean;
  /**
   * 相邻两次 LLM 请求之间的最小间隔（毫秒）。`0` 表示不等待。
   * 用于降低 TPM 429；建议与 `concurrency: 1` 同用。
   *
   * @default 0
   */
  readonly requestDelayMs: number;
  /**
   * 遇到 HTTP 429 时的额外重试次数（不含首次）。
   * 等待优先取响应 `Retry-After`，否则取 `max(requestDelayMs, 15000)`。
   *
   * @default 0
   */
  readonly rateLimitRetries: number;
  readonly systemPrompt?: string;
  readonly systemPromptAppend?: string;
};

/**
 * 配置文件 / 插件 props 上可能出现的部分字段。
 */
export type LlmTranslateConfigInputType = {
  readonly baseUrl?: string;
  readonly apiKey?: string;
  readonly model?: string;
  readonly locales?: readonly string[] | string;
  readonly concurrency?: number;
  readonly batchSize?: number;
  readonly maxBatchChars?: number;
  readonly maxFileChars?: number;
  readonly force?: boolean;
  readonly requestDelayMs?: number;
  readonly rateLimitRetries?: number;
  readonly systemPrompt?: string;
  readonly systemPromptAppend?: string;
};

export type ResolveLlmTranslateConfigResultType =
  | {
      readonly ok: true;
      readonly config: LlmTranslateConfigType;
    }
  | {
      readonly ok: false;
      readonly missing: readonly string[];
    };

/**
 * 待译单元（一篇源 md × 一个 locale）。
 */
export type LlmTranslateUnitType = {
  readonly id: string;
  readonly sourcePath: string;
  readonly outPath: string;
  readonly locale: string;
  readonly content: string;
  readonly charCount: number;
};

export type PackLlmTranslateUnitsResultType = {
  readonly batches: readonly (readonly LlmTranslateUnitType[])[];
  readonly oversized: readonly LlmTranslateUnitType[];
};

/**
 * 是否出现过任意 translate 配置意图（无意图则默认不工作、不告警）。
 */
export function hasLlmTranslateConfigIntent(
  raw: LlmTranslateConfigInputType | undefined
): boolean {
  if (!raw || typeof raw !== 'object') {
    return false;
  }
  if (typeof raw.baseUrl === 'string' && raw.baseUrl.trim().length > 0) {
    return true;
  }
  if (typeof raw.apiKey === 'string' && raw.apiKey.trim().length > 0) {
    return true;
  }
  if (typeof raw.model === 'string' && raw.model.trim().length > 0) {
    return true;
  }
  if (typeof raw.systemPrompt === 'string' && raw.systemPrompt.length > 0) {
    return true;
  }
  if (
    typeof raw.systemPromptAppend === 'string' &&
    raw.systemPromptAppend.length > 0
  ) {
    return true;
  }
  if (typeof raw.concurrency === 'number' && raw.concurrency > 0) {
    return true;
  }
  if (typeof raw.batchSize === 'number' && raw.batchSize > 0) {
    return true;
  }
  if (typeof raw.requestDelayMs === 'number' && raw.requestDelayMs >= 0) {
    return true;
  }
  if (typeof raw.rateLimitRetries === 'number' && raw.rateLimitRetries >= 0) {
    return true;
  }
  if (raw.force === true) {
    return true;
  }
  return normalizeLlmTranslateLocales(raw.locales).length > 0;
}

/**
 * 规范化 locales：支持数组或逗号分隔字符串。
 */
export function normalizeLlmTranslateLocales(
  locales: readonly string[] | string | undefined
): readonly string[] {
  if (locales == null) {
    return [];
  }
  const list: readonly string[] = Array.isArray(locales)
    ? locales
    : String(locales).split(',');
  const result: string[] = [];
  for (const item of list) {
    const trimmed = String(item).trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (!result.includes(trimmed)) {
      result.push(trimmed);
    }
  }
  return result;
}

/**
 * 规范化正整数配置，失败时回落 defaultValue。
 */
export function normalizePositiveInt(
  value: number | undefined,
  defaultValue: number
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return defaultValue;
  }
  const floored = Math.floor(value);
  if (floored < 1) {
    return defaultValue;
  }
  return floored;
}

/**
 * 规范化非负整数（允许 `0`），失败时回落 defaultValue。
 */
export function normalizeNonNegativeInt(
  value: number | undefined,
  defaultValue: number
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return defaultValue;
  }
  const floored = Math.floor(value);
  if (floored < 0) {
    return defaultValue;
  }
  return floored;
}

/**
 * 解析 `Retry-After`（秒或 HTTP 日期）为等待毫秒；无法解析则 `null`。
 */
export function parseRetryAfterMs(
  retryAfter: string | null,
  nowMs: number = Date.now()
): number | null {
  if (retryAfter == null) {
    return null;
  }
  const trimmed = retryAfter.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);
    if (!Number.isFinite(seconds) || seconds < 0) {
      return null;
    }
    return Math.floor(seconds * 1000);
  }
  const when = Date.parse(trimmed);
  if (!Number.isFinite(when)) {
    return null;
  }
  return Math.max(0, when - nowMs);
}

/**
 * @deprecated 使用 {@link normalizePositiveInt}
 */
export function normalizeLlmTranslateConcurrency(
  value: number | undefined
): number {
  return normalizePositiveInt(value, 1);
}

/**
 * 解析并校验完整配置。`apiKey` / `baseUrl` / `model` 可从环境变量补齐。
 */
export function resolveLlmTranslateConfig(
  raw: LlmTranslateConfigInputType | undefined,
  env: NodeJS.ProcessEnv = process.env
): ResolveLlmTranslateConfigResultType {
  const baseUrl = (
    (typeof raw?.baseUrl === 'string' && raw.baseUrl.trim()) ||
    (env.OPENAI_BASE_URL || '').trim()
  ).replace(/\/$/, '');
  const apiKey =
    (typeof raw?.apiKey === 'string' && raw.apiKey.trim()) ||
    (env.OPENAI_API_KEY || '').trim();
  const model =
    (typeof raw?.model === 'string' && raw.model.trim()) ||
    (env.OPENAI_CHAT_MODEL || '').trim();
  const locales = normalizeLlmTranslateLocales(raw?.locales);
  const concurrency = normalizePositiveInt(raw?.concurrency, 1);
  const batchSize = normalizePositiveInt(raw?.batchSize, 1);
  const maxBatchChars = normalizePositiveInt(raw?.maxBatchChars, 24000);
  const maxFileChars = normalizePositiveInt(raw?.maxFileChars, 16000);
  const force = raw?.force === true;
  const requestDelayMs = normalizeNonNegativeInt(raw?.requestDelayMs, 0);
  const rateLimitRetries = normalizeNonNegativeInt(raw?.rateLimitRetries, 0);

  const missing: string[] = [];
  if (!baseUrl) {
    missing.push('baseUrl');
  }
  if (!apiKey) {
    missing.push('apiKey');
  }
  if (!model) {
    missing.push('model');
  }
  if (locales.length === 0) {
    missing.push('locales');
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    config: {
      baseUrl,
      apiKey,
      model,
      locales,
      concurrency,
      batchSize,
      maxBatchChars,
      maxFileChars,
      force,
      requestDelayMs,
      rateLimitRetries,
      systemPrompt:
        typeof raw?.systemPrompt === 'string' ? raw.systemPrompt : undefined,
      systemPromptAppend:
        typeof raw?.systemPromptAppend === 'string'
          ? raw.systemPromptAppend
          : undefined
    }
  };
}

/**
 * 默认 system prompt（整文件 / 多文件包共用说明）。
 */
export function buildLlmTranslateSystemPrompt(
  locale: string,
  config: Pick<LlmTranslateConfigType, 'systemPrompt' | 'systemPromptAppend'>,
  batchFileCount: number
): string {
  const base =
    typeof config.systemPrompt === 'string' &&
    config.systemPrompt.trim().length > 0
      ? config.systemPrompt.trim()
      : [
          `You translate UI component documentation into the target language: ${locale}.`,
          'Translate ALL Chinese (and any other non-target-language) prose; do not leave Chinese characters in headings, paragraphs, list items, or table cells.',
          'Keep Markdown structure, headings, tables, links, and fenced code blocks unchanged in syntax.',
          'Do not translate code identifiers inside backticks or inside fenced code blocks.',
          'Do not wrap the whole answer in an extra markdown code fence.',
          batchFileCount > 1
            ? [
                `The user message contains ${batchFileCount} files.`,
                `Each file is wrapped as ${LLM_TRANSLATE_FILE_MARKER_PREFIX} id="N" path="..."> ... ${LLM_TRANSLATE_FILE_END_MARKER}.`,
                'Translate each file body in place and keep the same FILE/END markers and id/path attributes.',
                'Output ONLY the marked files, no preface.'
              ].join(' ')
            : 'Output ONLY the translated Markdown, no preface or explanation.'
        ].join(' ');

  const append =
    typeof config.systemPromptAppend === 'string'
      ? config.systemPromptAppend.trim()
      : '';
  if (append.length === 0) {
    return base;
  }
  return `${base}\n${append}`;
}

/**
 * 源 md 路径 → 带 locale 的并列路径。
 */
export function buildLocalizedMarkdownPath(
  sourcePath: string,
  locale: string
): string {
  const normalized = sourcePath.replace(/\\/g, '/');
  const slash = normalized.lastIndexOf('/');
  const dir = slash >= 0 ? sourcePath.slice(0, slash + 1) : '';
  const base = slash >= 0 ? sourcePath.slice(slash + 1) : sourcePath;

  if (base.endsWith('.doc.md')) {
    return `${dir}${base.slice(0, -'.doc.md'.length)}.${locale}.doc.md`;
  }
  if (base.endsWith('.md')) {
    return `${dir}${base.slice(0, -'.md'.length)}.${locale}.md`;
  }
  return `${dir}${base}.${locale}.md`;
}

/**
 * 是否已是译出文件名（避免把英档当源再译）。
 */
export function isLocalizedMarkdownPath(filePath: string): boolean {
  const base = filePath.replace(/\\/g, '/').split('/').pop() || filePath;
  if (/\.[a-z]{2}(-[A-Za-z]+)?\.doc\.md$/i.test(base)) {
    return true;
  }
  if (/\.[a-z]{2}(-[A-Za-z]+)?\.md$/i.test(base) && !base.endsWith('.doc.md')) {
    return true;
  }
  return false;
}

/**
 * 按 batchSize + 字符预算装箱；超大单文件进 oversized。
 * 小文件优先装箱，提高一包利用率。
 */
export function packLlmTranslateUnits(
  units: readonly LlmTranslateUnitType[],
  options: {
    readonly batchSize: number;
    readonly maxBatchChars: number;
    readonly maxFileChars: number;
  }
): PackLlmTranslateUnitsResultType {
  const batchSize = normalizePositiveInt(options.batchSize, 1);
  const maxBatchChars = normalizePositiveInt(options.maxBatchChars, 24000);
  const maxFileChars = normalizePositiveInt(options.maxFileChars, 16000);

  const oversized: LlmTranslateUnitType[] = [];
  const fit: LlmTranslateUnitType[] = [];
  for (const unit of units) {
    if (unit.charCount > maxFileChars) {
      oversized.push(unit);
    } else {
      fit.push(unit);
    }
  }

  fit.sort((left, right) => left.charCount - right.charCount);

  const batches: LlmTranslateUnitType[][] = [];
  let current: LlmTranslateUnitType[] = [];
  let currentChars = 0;

  const flush = (): void => {
    if (current.length === 0) {
      return;
    }
    batches.push(current);
    current = [];
    currentChars = 0;
  };

  for (const unit of fit) {
    const wouldExceedCount = current.length >= batchSize;
    const wouldExceedChars =
      current.length > 0 && currentChars + unit.charCount > maxBatchChars;
    if (wouldExceedCount || wouldExceedChars) {
      flush();
    }
    current.push(unit);
    currentChars += unit.charCount;
  }
  flush();

  return { batches, oversized };
}

/**
 * 把一包单元编码成带标记的用户消息。
 */
export function encodeLlmTranslateBatchPrompt(
  units: readonly LlmTranslateUnitType[]
): string {
  if (units.length === 1) {
    return units[0].content;
  }
  return units
    .map((unit) => {
      const safePath = unit.sourcePath.replace(/\\/g, '/');
      return [
        `${LLM_TRANSLATE_FILE_MARKER_PREFIX} id="${unit.id}" path="${safePath}">`,
        unit.content.replace(/\s+$/u, ''),
        LLM_TRANSLATE_FILE_END_MARKER
      ].join('\n');
    })
    .join('\n\n');
}

/**
 * 解析批量译文；单文件包若无标记则整段当作 id=该单元。
 */
export function parseLlmTranslateBatchResponse(
  responseText: string,
  units: readonly LlmTranslateUnitType[]
): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  const normalized = responseText.replace(/\r\n/g, '\n').trim();

  if (units.length === 1) {
    const only = units[0];
    const blockRe = new RegExp(
      `${LLM_TRANSLATE_FILE_MARKER_PREFIX}\\s+id="${only.id}"[^>]*>\\s*([\\s\\S]*?)\\s*${LLM_TRANSLATE_FILE_END_MARKER}`,
      'u'
    );
    const blockMatch = normalized.match(blockRe);
    map.set(
      only.id,
      blockMatch ? blockMatch[1].trim() + '\n' : `${normalized}\n`
    );
    return map;
  }

  const globalRe = new RegExp(
    `${LLM_TRANSLATE_FILE_MARKER_PREFIX}\\s+id="(\\d+)"[^>]*>\\s*([\\s\\S]*?)\\s*${LLM_TRANSLATE_FILE_END_MARKER}`,
    'gu'
  );
  let match = globalRe.exec(normalized);
  while (match) {
    map.set(match[1], `${match[2].trim()}\n`);
    match = globalRe.exec(normalized);
  }
  return map;
}

/**
 * 有限并发映射，结果下标与入参一致。
 */
export async function mapWithConcurrency<ItemType, ResultType>(
  items: readonly ItemType[],
  concurrency: number,
  mapper: (item: ItemType, index: number) => Promise<ResultType>
): Promise<readonly ResultType[]> {
  if (items.length === 0) {
    return [];
  }
  const limit = normalizePositiveInt(concurrency, 1);
  const results: ResultType[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const current = nextIndex;
        nextIndex += 1;
        results[current] = await mapper(items[current], current);
      }
    }
  );

  await Promise.all(workers);
  return results;
}
