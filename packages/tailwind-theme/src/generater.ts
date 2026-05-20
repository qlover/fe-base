import fs from 'fs';
import path from 'path';
import {
  generateLayerBaseCSS,
  generateThemeBlockCSS,
  generateThemeCSS
} from './core';
import type { UiThemeOptions } from './config';

/** CSS variant aligned with {@link core.ts} generators */
export type ThemeCssVariant = 'layer-base' | 'theme-block' | 'full';

export interface GenerateThemeFileOptions extends UiThemeOptions {
  /** Which CSS generator to use. Default: `full` */
  variant?: ThemeCssVariant;
}

export interface GenerateThemeFilesOptions extends UiThemeOptions {
  /** Directory for default output file names. Default: `.` (cwd) */
  outputDir?: string;
  /** Override output path per variant (relative to cwd unless absolute) */
  outputPaths?: Partial<Record<ThemeCssVariant, string>>;
}

const DEFAULT_OUTPUT_PATHS: Record<ThemeCssVariant, string> = {
  'layer-base': 'theme-layer-base.css',
  'theme-block': 'theme-block.css',
  full: 'theme.css'
};

function resolveCssContent(
  variant: ThemeCssVariant,
  options: UiThemeOptions
): string {
  switch (variant) {
    case 'layer-base': {
      const layerBaseContent = generateLayerBaseCSS(options);
      return layerBaseContent ? `@layer base {\n${layerBaseContent}}\n` : '';
    }
    case 'theme-block':
      return generateThemeBlockCSS(options);
    case 'full':
      return generateThemeCSS(options);
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

async function writeCssFile(
  absolutePath: string,
  css: string,
  overwrite: boolean
): Promise<void> {
  if (fs.existsSync(absolutePath)) {
    if (overwrite) {
      console.warn(
        `⚠️ Warning: File already exists at ${absolutePath}. It will be overwritten.`
      );
    } else {
      throw new Error(
        `File already exists at ${absolutePath} and overwrite is set to false.`
      );
    }
  }

  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await fs.promises.writeFile(absolutePath, css, 'utf-8');
  console.log(`✅ Theme CSS generated at ${absolutePath}`);
}

function resolveOutputPath(
  variant: ThemeCssVariant,
  options: GenerateThemeFileOptions
): string {
  if (options.outputPath) {
    return path.resolve(process.cwd(), options.outputPath);
  }
  return path.resolve(process.cwd(), DEFAULT_OUTPUT_PATHS[variant]);
}

/**
 * Write theme CSS to a file using the selected core generator variant.
 */
export async function generateThemeFile(
  options: GenerateThemeFileOptions = {}
): Promise<string> {
  const {
    variant = 'full',
    overwrite = true,
    outputPath,
    ...restOptions
  } = options;

  const absolutePath = outputPath
    ? path.resolve(process.cwd(), outputPath)
    : resolveOutputPath(variant, options);

  const css = resolveCssContent(variant, restOptions);
  await writeCssFile(absolutePath, css, overwrite);
  return absolutePath;
}

/**
 * Write all three theme CSS variants (layer-base, theme-block, full) to files.
 */
export async function generateThemeFiles(
  options: GenerateThemeFilesOptions = {}
): Promise<Record<ThemeCssVariant, string>> {
  const {
    outputDir = '.',
    outputPaths = {},
    overwrite = true,
    ...restOptions
  } = options;

  const variants = Object.keys(DEFAULT_OUTPUT_PATHS) as ThemeCssVariant[];
  const result = {} as Record<ThemeCssVariant, string>;

  for (const variant of variants) {
    const relativePath =
      outputPaths[variant] ?? path.join(outputDir, DEFAULT_OUTPUT_PATHS[variant]);
    const absolutePath = path.resolve(process.cwd(), relativePath);
    const css = resolveCssContent(variant, restOptions);
    await writeCssFile(absolutePath, css, overwrite);
    result[variant] = absolutePath;
  }

  return result;
}
