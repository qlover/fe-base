/**
 * Fetch template list and download a single template from GitHub repo.
 * Uses GitHub Contents API and archive tarball.
 */

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
/** Max retries for each fetch. */
const MAX_RETRIES = 3;
/** Delay between retries (ms). */
const RETRY_DELAY_MS = 2_000;

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

async function fetchWithRetry(
  url: string,
  init: RequestInit & { timeoutMs: number }
): Promise<Response> {
  const { timeoutMs, ...fetchInit } = init;
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const signal = createAbortSignal(timeoutMs);
    try {
      const res = await fetch(url, { ...fetchInit, signal });
      if (typeof (signal as AbortSignal & { _clear?: () => void })._clear === 'function') {
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

/**
 * Download repo tarball, extract, and return path to the template directory.
 * Caller should copy files from this path then remove the temp dir.
 */
export async function downloadTemplate(
  templateName: string,
  options: Partial<GitHubTemplateOptions> = {}
): Promise<{ templatePath: string; cleanup: () => Promise<void> }> {
  const opts = { ...defaultOptions, ...options };
  const archiveUrl = GITHUB_ARCHIVE.replace('{owner}', opts.owner)
    .replace('{repo}', opts.repo)
    .replace('{branch}', opts.branch);

  const res = await fetchWithRetry(archiveUrl, {
    timeoutMs: FETCH_ARCHIVE_TIMEOUT_MS
  });
  if (!res.ok) {
    throw new Error(
      `Failed to download archive: ${res.status} ${res.statusText}`
    );
  }

  const buf = await res.arrayBuffer();
  const dir = await mkdtemp(join(tmpdir(), 'create-app-'));
  const tarballPath = join(dir, 'repo.tar.gz');
  await writeFile(tarballPath, new Uint8Array(buf));

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
