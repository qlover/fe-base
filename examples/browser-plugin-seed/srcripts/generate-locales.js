const { readdirSync } = require('fs');
const { join } = require('path');
const { Ts2Locales } = require('@brain-toolkit/ts2locales');
const { log } = require('./_log');

/**
 * Normalize plugin options: expand string items with common target/resolveNs/resolveKeyInFile.
 * @param {Object} opts - Plugin options (locales, target, resolveNs, resolveKeyInFile, options)
 * @returns {Array} Normalized option items with source, target, resolveNs, resolveKeyInFile
 */
function normalizeOptions(opts) {
  const {
    target: commonTarget,
    resolveNs: commonResolveNs,
    resolveKeyInFile: commonResolveKeyInFile
  } = opts;
  const options = opts.options ?? [];

  return options.map((item) => {
    if (typeof item === 'string') {
      if (commonTarget == null || commonTarget === '') {
        throw new Error(
          'vite-ts2locales: target is required when options include a string (source-only item)'
        );
      }
      return {
        source: item,
        target: commonTarget,
        resolveNs: commonResolveNs,
        resolveKeyInFile: commonResolveKeyInFile
      };
    }
    const merged = {
      source: item.source,
      target: item.target ?? commonTarget ?? '',
      resolveNs: item.resolveNs ?? commonResolveNs,
      resolveKeyInFile: item.resolveKeyInFile ?? commonResolveKeyInFile
    };
    if (!merged.target) {
      throw new Error(
        'vite-ts2locales: target is required (set plugin target or per-option target)'
      );
    }
    return merged;
  });
}

function getAllI18nIdentifierFiles(dir) {
  const files = [];
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllI18nIdentifierFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * @param {Object} [opts] - Options (locales, target, resolveNs, resolveKeyInFile, options)
 * @param {string[]} [opts.locales] - Default `['en', 'zh']`
 * @param {string} [opts.targetPath]
 * @param {string} [opts.sourcePath]
 */
async function generateLocales(opts = {}) {
  const { locales = ['en', 'zh'], targetPath, sourcePath } = opts;

  const normalized = normalizeOptions({
    locales,
    target: targetPath,
    options: getAllI18nIdentifierFiles(sourcePath)
  });

  const ts2Locale = new Ts2Locales(locales);
  for (const value of normalized) {
    await ts2Locale.generate(value);
  }

  log('locales generated successfully', 'green');
}

module.exports = { generateLocales };
