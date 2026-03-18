import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { dirname, isAbsolute, join, relative, sep } from 'path';
import { format as prettierFormat, resolveConfig } from 'prettier';

function toPosixPath(p: string): string {
  return p.split(sep).join('/');
}

async function formatWithPrettier(
  outPath: string,
  content: string
): Promise<string> {
  try {
    const config = await resolveConfig(outPath);
    return await prettierFormat(content, {
      filepath: outPath,
      ...(config ?? {})
    });
  } catch {
    return content;
  }
}

export type GenerateApiRoutesOptions = {
  /**
   * Output directory, relative to `projectRoot` or absolute.
   * Default: `shared/config` (under projectRoot).
   */
  outputDir?: string;
  /** File name inside `outputDir`. Default: `apiRoutes.generated.ts` */
  fileName?: string;
  /**
   * Full path to the generated file (relative to projectRoot or absolute).
   * When set, overrides `outputDir` + `fileName`.
   */
  outFile?: string;
};

function resolveOutputPath(
  projectRoot: string,
  options?: GenerateApiRoutesOptions
): string {
  if (options?.outFile) {
    const p = options.outFile;
    return isAbsolute(p) ? p : join(projectRoot, p);
  }
  const dir = options?.outputDir
    ? isAbsolute(options.outputDir)
      ? options.outputDir
      : join(projectRoot, options.outputDir)
    : join(projectRoot, 'shared', 'config');
  const fileName = options?.fileName ?? 'apiRoutes.generated.ts';
  return join(dir, fileName);
}

const ROUTE_NAMES = ['route.ts', 'route.tsx', 'route.js', 'route.jsx'];

/** Route groups (folder), private _, parallel @ — not part of URL path */
function omitFromPath(segment: string): boolean {
  return (
    segment.startsWith('_') ||
    segment.startsWith('@') ||
    /^\([^)]+\)$/.test(segment)
  );
}

function findRouteBasename(dir: string): string | null {
  for (const n of ROUTE_NAMES) {
    if (existsSync(join(dir, n))) return n;
  }
  return null;
}

type RouteEntry = { segments: string[]; handlerAbs: string };

function collectRouteEntries(apiRoot: string): RouteEntry[] {
  const routes: RouteEntry[] = [];

  function walk(dir: string, segments: string[]) {
    if (!existsSync(dir)) return;
    const routeBase = findRouteBasename(dir);
    if (routeBase) {
      routes.push({
        segments: [...segments],
        handlerAbs: join(dir, routeBase)
      });
    }
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const nextSegs = omitFromPath(ent.name)
        ? segments
        : [...segments, ent.name];
      walk(join(dir, ent.name), nextSegs);
    }
  }

  walk(apiRoot, []);
  return routes;
}

function handlerJsdocBlock(
  httpPath: string,
  handlerAbs: string,
  outPath: string,
  projectRoot: string,
  dynamic: boolean
): string[] {
  const linkPath = toPosixPath(relative(dirname(outPath), handlerAbs));
  const workspacePath = toPosixPath(relative(projectRoot, handlerAbs));
  const kind = dynamic ? 'Dynamic API path' : 'API path';
  return [
    '/**',
    ` * ${kind}: \`${httpPath}\``,
    ' *',
    ` * @see [Open route handler](${linkPath})`,
    ' *',
    ` * **Fallback:** Ctrl/Cmd+P (Quick Open) → \`${workspacePath}\``,
    ' */'
  ];
}

const DYNAMIC = /^\[(\.{3})?([^\]]+)\]$/;

function parseSegment(
  seg: string
):
  | { kind: 'static'; value: string }
  | { kind: 'rest'; param: string }
  | { kind: 'param'; param: string } {
  const m = DYNAMIC.exec(seg);
  if (!m) return { kind: 'static', value: seg };
  const isRest = Boolean(m[1]);
  const param = m[2];
  return isRest ? { kind: 'rest', param } : { kind: 'param', param };
}

function toConstNamePart(seg: string): string {
  const p = parseSegment(seg);
  if (p.kind === 'static') {
    return p.value.replace(/-/g, '_').toUpperCase();
  }
  return p.param.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
}

function sanitizeParam(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^\d/.test(cleaned)) return `_${cleaned}`;
  return cleaned || 'param';
}

function staticPath(segments: string[]): string {
  if (segments.length === 0) return '/api';
  return `/api/${segments.join('/')}`;
}

/** Human-readable path for JSDoc (dynamic segments as :param or [...slug]). */
function pathPatternForDoc(segments: string[], isStatic: boolean): string {
  if (isStatic) return staticPath(segments);
  const segs = segments.map((s) => {
    const p = parseSegment(s);
    if (p.kind === 'static') return p.value;
    if (p.kind === 'param') return `:${p.param}`;
    return `[...${p.param}]`;
  });
  return '/api' + (segs.length ? `/${segs.join('/')}` : '');
}

function hasDynamic(segments: string[]): boolean {
  return segments.some((s) => parseSegment(s).kind !== 'static');
}

function escapeStaticUrlSeg(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

function buildDynamicFn(segments: string[]): {
  args: string;
  returnLine: string;
} {
  const args: string[] = [];
  let body = 'return `/api';
  for (const seg of segments) {
    const p = parseSegment(seg);
    if (p.kind === 'static') {
      body += `/${escapeStaticUrlSeg(p.value)}`;
    } else if (p.kind === 'param') {
      const n = sanitizeParam(p.param);
      args.push(`${n}: string`);
      body += '/${encodeURIComponent(' + n + ')}';
    } else {
      const n = sanitizeParam(p.param);
      args.push(`${n}: string[]`);
      body += '/${' + n + ".map(encodeURIComponent).join('/')}";
    }
  }
  body += '` as const;';
  return { args: args.join(', '), returnLine: `  ${body}` };
}

function buildExportName(segments: string[], staticOnly: boolean): string {
  const base = segments.map(toConstNamePart).join('_') || 'ROOT';
  return staticOnly ? `API_${base}` : `buildApi_${base}`;
}

/**
 * Scans src/app/api for route.ts (and route.tsx, route.js, route.jsx) and writes constants.
 *
 * @param projectRoot - App root (directory containing src/app/api). Defaults to cwd.
 * @param options - e.g. `{ outputDir: 'src/lib' }` or `{ outFile: 'src/constants/apiRoutes.ts' }`
 * @returns Promise; call with `.catch()` from config entrypoints (e.g. next.config).
 */
export async function generateApiRoutes(
  projectRoot: string = process.cwd(),
  options?: GenerateApiRoutesOptions
) {
  const apiRoot = join(projectRoot, 'src', 'app', 'api');
  const outPath = resolveOutputPath(projectRoot, options);

  const writeOut = async (content: string) => {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, await formatWithPrettier(outPath, content), 'utf8');
  };

  if (!existsSync(apiRoot)) {
    const header = `/**
 * Auto-generated by tools/generateApiRoutes.ts — do not edit manually.
 * No src/app/api directory found.
 */

export {};
`;
    await writeOut(header);
    return;
  }

  const entries = collectRouteEntries(apiRoot);
  entries.sort((a, b) =>
    a.segments.join('/').localeCompare(b.segments.join('/'))
  );

  const usedNames = new Set<string>();
  const lines: string[] = [
    '/**',
    ' * Auto-generated by tools/generateApiRoutes.ts — do not edit manually.',
    ' *',
    ' * **Jump to handler:** hover the symbol → in the JSDoc popup, click *Open route handler*.',
    ' * If the link fails, use Quick Open (Ctrl/Cmd+P) with the path on the last JSDoc line.',
    ' */',
    ''
  ];

  const staticPaths: string[] = [];

  for (const { segments, handlerAbs } of entries) {
    const isStatic = !hasDynamic(segments);
    let exportName = buildExportName(segments, isStatic);
    let n = 1;
    while (usedNames.has(exportName)) {
      exportName = `${buildExportName(segments, isStatic)}_${++n}`;
    }
    usedNames.add(exportName);

    const doc = handlerJsdocBlock(
      pathPatternForDoc(segments, isStatic),
      handlerAbs,
      outPath,
      projectRoot,
      !isStatic
    );

    if (isStatic) {
      lines.push(...doc);
      lines.push(
        `export const ${exportName} = '${staticPath(segments)}' as const;`
      );
      lines.push('');
      staticPaths.push(exportName);
    } else {
      lines.push(...doc);
      const { args, returnLine } = buildDynamicFn(segments);
      lines.push(`export function ${exportName}(${args}): string {`);
      lines.push(returnLine);
      lines.push('}');
      lines.push('');
    }
  }

  if (staticPaths.length > 0) {
    lines.push('');
    lines.push(
      'export type ApiRoutePath = ' +
        staticPaths.map((name) => `(typeof ${name})`).join(' | ') +
        ';'
    );
  }

  await writeOut(lines.join('\n') + '\n');
}
