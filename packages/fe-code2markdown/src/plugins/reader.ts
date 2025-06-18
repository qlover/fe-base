import { readdirSync, statSync } from 'fs';
import Code2MDContext from '../implments/Code2MDContext';
import { ScriptPlugin } from '../scripts-plugin';
import { basename, dirname, extname, join, relative } from 'path';

export interface EntryValue {
  path: string;
  name: string;
}

export interface ReaderOutput {
  fullPath: string;
  name: string;
  dir: string;
  ext: string;
  relativePath: string;
  outputPath: string;
}

export class Reader extends ScriptPlugin<Code2MDContext> {
  constructor(context: Code2MDContext) {
    super(context, 'Reader');
  }

  async onBefore(): Promise<void> {
    const { entryPoints } = this.context.options;
    this.logger.info(`Reading entry: ${entryPoints}`);
    const entryAllFiles = this.getEntryAllFiles(entryPoints);
    this.logger.info('Read entry:', JSON.stringify(entryAllFiles, null, 2));

    const outputs = entryAllFiles.map((entryFile) => {
      const relativePath = relative(process.cwd(), entryFile);
      const ext = extname(entryFile);
      const name = basename(entryFile, ext);
      return {
        fullPath: entryFile,
        name,
        dir: dirname(entryFile),
        ext,
        relativePath,
        outputPath: join(dirname(entryFile), `${name}.md`)
      } as ReaderOutput;
    });

    this.logger.info('Read entry:', JSON.stringify(outputs, null, 2));
    this.context.setConfig({
      readerOutputs: outputs
    });
  }

  private getEntryAllFiles(entryPoints: string[]): string[] {
    const entryValues = new Set<string>();
    entryPoints.forEach((entry) => {
      const entryPath = statSync(entry).isFile() ? dirname(entry) : entry;
      const dirs = readdirSync(entryPath, 'utf-8');
      return dirs.map((dir) => {
        const fullPath = join(entryPath, dir);
        if (statSync(fullPath).isFile()) {
          entryValues.add(fullPath);
        } else {
          this.getAllFilePaths(fullPath).forEach((filePath) => {
            entryValues.add(filePath);
          });
        }
      });
    });
    return Array.from(entryValues);
  }

  private getAllFilePaths(
    dirPath: string,
    filePaths: Set<string> = new Set()
  ): Set<string> {
    const files = readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = join(dirPath, file);

      if (statSync(fullPath).isDirectory()) {
        this.getAllFilePaths(fullPath, filePaths);
      } else {
        filePaths.add(fullPath);
      }
    });

    return filePaths;
  }
}
