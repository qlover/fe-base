import { PluginOption } from 'vite';
import fs from 'fs';
import path from 'path';

export type ViteDeprecatedAntdOptions = {
  /**
   * Whether to forbid the use of global antd components
   *
   * - message
   * - Modal.[confirm, info, success, error, warning]
   * - notification
   */
  mode?: 'noGlobals' | 'overrideStatic';

  /**
   * The path to the target file
   *
   * @default './src/types/deprecated-antd.d.ts'
   */
  targetPath?: string;

  /**
   * The path or filename where to inject CSS import
   * Can be either a full path (e.g. './src/main.tsx') or just a filename (e.g. 'main.tsx')
   *
   * @default './src/main.tsx'
   */
  inLoadCssFile?: string;

  /**
   * The path to the CSS file to import when mode is overrideStatic
   * Should be relative to the project root
   *
   * @default './src/styles/antd-override.css'
   */
  overriedCssFilePath?: string;
};

const VIRTUAL_CSS_ID = 'virtual:antd-override.css';
const RESOLVED_VIRTUAL_CSS_ID = '\0' + VIRTUAL_CSS_ID;

export default (opts: ViteDeprecatedAntdOptions = {}): PluginOption => {
  const {
    mode = 'noGlobals',
    targetPath = './src/types/deprecated-antd.d.ts',
    inLoadCssFile = './src/main.tsx',
    overriedCssFilePath: cssFilePath = './src/styles/antd-override.css'
  } = opts;

  // Resolve the CSS file path relative to project root
  const resolvedCssPath = path.resolve(process.cwd(), cssFilePath);
  const name = 'vite-deprecated-antd';

  return {
    name,
    async configResolved() {
      const absoluteTargetPath = path.resolve(process.cwd(), targetPath);
      const targetDir = path.dirname(absoluteTargetPath);
      const templatePath = path.resolve(__dirname, '../assets/deprecated-ant');

      if (mode === 'noGlobals') {
        // Create directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        // Copy the template file to target path
        fs.copyFileSync(templatePath, absoluteTargetPath);
        console.log(`Created ${absoluteTargetPath}`);
      } else {
        // Remove the type definition file if it exists
        if (fs.existsSync(absoluteTargetPath)) {
          fs.unlinkSync(absoluteTargetPath);
          console.log(`Removed ${absoluteTargetPath}`);
        }
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_CSS_ID) {
        return RESOLVED_VIRTUAL_CSS_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_CSS_ID) {
        if (!fs.existsSync(resolvedCssPath)) {
          console.error(`[${name}] CSS file not found: ${resolvedCssPath}`);
          return '';
        }
        return fs.readFileSync(resolvedCssPath, 'utf-8');
      }
    },
    transform(code: string, id: string) {
      if (mode !== 'overrideStatic') {
        return null;
      }

      // Skip non-JS/TS files
      if (!/\.(js|jsx|ts|tsx)$/.test(id)) {
        return null;
      }

      // Normalize paths for comparison
      const normalizedId = id.split(path.sep).join('/');
      const normalizedTarget = inLoadCssFile.split(path.sep).join('/');

      // Check if the ID matches either the full path or just the filename
      const isMatch =
        normalizedId.endsWith(normalizedTarget) ||
        path.basename(normalizedId) === path.basename(normalizedTarget);

      if (isMatch) {
        console.log(`[${name}] Is match: ${isMatch}`);
        console.log(`[${name}] Mode: ${mode}`);
        console.log(`[${name}] Checking file: ${normalizedId}`);
        console.log(`[${name}] Target: ${normalizedTarget}`);
        console.log(`[${name}] CSS file: ${resolvedCssPath}`);
      }

      // Check if the code contains our CSS import
      const hasCssImport = code.includes(`import '${VIRTUAL_CSS_ID}'`);

      if (isMatch) {
        if (!hasCssImport) {
          console.log(`[${name}] Injecting CSS into: ${normalizedId}`);
          return {
            code: `import '${VIRTUAL_CSS_ID}';\n${code}`,
            map: null
          };
        }
      } else if (hasCssImport) {
        // Remove the CSS import if it exists but shouldn't
        console.log(`[${name}] Removing CSS from: ${normalizedId}`);
        return {
          code: code.replace(`import '${VIRTUAL_CSS_ID}';\n`, ''),
          map: null
        };
      }
      return null;
    }
  };
};
