/**
 * Fetch template list and download a single template from GitHub repo.
 * Uses GitHub Contents API and archive tarball.
 *
 * Network: Node's default fetch has a 10s connect timeout. We use undici Agent
 * to set a longer connect timeout. Set CREATE_APP_GITHUB_MIRROR (e.g.
 * https://ghproxy.com/) to use a mirror for archive download when GitHub is slow.
 */

import { Agent, fetch as undiciFetch } from 'undici';
import { join } from 'path';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { extract } from 'tar';

const GITHUB_API = 'https://api.github.com';
const GITHUB_ARCHIVE =
  'https://github.com/{owner}/{repo}/archive/refs/heads/{branch}.tar.gz';

/** Timeout for API list fetch (ms). */
const FETCH_LIST_TIMEOUT_MS = 30_000;
/** Timeout for tarball download (ms). */
const FETCH_ARCHIVE_TIMEOUT_MS = 120_000;
/** Connect timeout (ms). Node default is 10s; we use 60s for slow networks. */
const CONNECT_TIMEOUT_MS = 60_000;
/** Max retries for each fetch. */
const MAX_RETRIES = 3;
/** Delay between retries (ms). */
const RETRY_DELAY_MS = 2_000;

const agentList = new Agent({ connectTimeout: CONNECT_TIMEOUT_MS });
const agentArchive = new Agent({ connectTimeout: CONNECT_TIMEOUT_MS });

export interface GitHubTemplateOptions {
  owner: string;
  repo: string;
  branch: string;
  /** Path under repo root, e.g. "examples" */
  examplesPath: string;
}

const defaultOptions: GitHubTemplateOptions = {
  owner: 'qlover',
  repo: 'fe-base',
  branch: 'master',
  examplesPath: 'examples'
};

function createAbortSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = controller.signal as AbortSignal & { _clear?: () => void };
  signal._clear = () => clearTimeout(timer);
  return signal;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type FetchInit = RequestInit & {
  timeoutMs: number;
  dispatcher?: InstanceType<typeof Agent>;
};

async function fetchWithRetry(url: string, init: FetchInit): Promise<Response> {
  const { timeoutMs, dispatcher, ...rest } = init;
  const fetchFn = dispatcher ? undiciFetch : fetch;
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const signal = createAbortSignal(timeoutMs);
    try {
      const initOpts = {
        ...rest,
        signal,
        ...(dispatcher && { dispatcher })
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await fetchFn(url, initOpts as any)) as Response;
      if (
        typeof (signal as AbortSignal & { _clear?: () => void })._clear ===
        'function'
      ) {
        (signal as AbortSignal & { _clear?: () => void })._clear?.();
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw lastError;
}

/**
 * Fetch directory names under repo path (e.g. examples/) as template list.
 */
export async function fetchTemplateList(
  options: Partial<GitHubTemplateOptions> = {}
): Promise<string[]> {
  const opts = { ...defaultOptions, ...options };
  const url = `${GITHUB_API}/repos/${opts.owner}/${opts.repo}/contents/${opts.examplesPath}`;
  const res = await fetchWithRetry(url, {
    timeoutMs: FETCH_LIST_TIMEOUT_MS,
    dispatcher: agentList,
    headers: { Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch template list: ${res.status} ${res.statusText}`
    );
  }
  const data = (await res.json()) as Array<{ name: string; type: string }>;
  return data.filter((e) => e.type === 'dir').map((e) => e.name);
}

export interface DownloadTemplateOptions extends Partial<GitHubTemplateOptions> {
  /** Called during download with bytes received and optional total size. */
  onProgress?: (loaded: number, total?: number) => void;
}

/**
 * Download repo tarball, extract, and return path to the template directory.
 * Caller should copy files from this path then remove the temp dir.
 */
export async function downloadTemplate(
  templateName: string,
  options: DownloadTemplateOptions = {}
): Promise<{ templatePath: string; cleanup: () => Promise<void> }> {
  const { onProgress, ...githubOpts } = options;
  const opts = { ...defaultOptions, ...githubOpts };
  let archiveUrl = GITHUB_ARCHIVE.replace('{owner}', opts.owner)
    .replace('{repo}', opts.repo)
    .replace('{branch}', opts.branch);

  const mirror = process.env.CREATE_APP_GITHUB_MIRROR?.trim();
  if (mirror) {
    archiveUrl = mirror.replace(/\/$/, '') + '/' + archiveUrl;
  }

  const res = await fetchWithRetry(archiveUrl, {
    timeoutMs: FETCH_ARCHIVE_TIMEOUT_MS,
    dispatcher: agentArchive
  });
  if (!res.ok) {
    throw new Error(
      `Failed to download archive: ${res.status} ${res.statusText}`
    );
  }

  const total = res.headers.get('Content-Length');
  const totalBytes = total ? parseInt(total, 10) : undefined;
  let loaded = 0;

  const reader = res.body?.getReader();
  if (!reader) {
    const buf = await res.arrayBuffer();
    const dir = await mkdtemp(join(tmpdir(), 'create-app-'));
    const tarballPath = join(dir, 'repo.tar.gz');
    await writeFile(tarballPath, new Uint8Array(buf));
    const templatePath = join(
      dir,
      `${opts.repo}-${opts.branch}`,
      opts.examplesPath,
      templateName
    );
    await extract({ file: tarballPath, cwd: dir });
    const cleanup = async () => {
      await rm(dir, { recursive: true, force: true });
    };
    return { templatePath, cleanup };
  }

  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress?.(loaded, totalBytes);
  }

  const buf = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.length;
  }

  const dir = await mkdtemp(join(tmpdir(), 'create-app-'));
  const tarballPath = join(dir, 'repo.tar.gz');
  await writeFile(tarballPath, buf);

  await extract({
    file: tarballPath,
    cwd: dir
  });

  // GitHub tarball top dir is {repo}-{branch}, e.g. fe-base-master
  const topDirName = `${opts.repo}-${opts.branch}`;
  const templatePath = join(dir, topDirName, opts.examplesPath, templateName);

  const cleanup = async () => {
    await rm(dir, { recursive: true, force: true });
  };

  return { templatePath, cleanup };
}
