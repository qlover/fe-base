import { readFileSync, writeFileSync, existsSync } from 'fs';
import merge from 'lodash/merge';
import { GeneratorContext } from './type';

export class Compose {
  constructor() {}

  public isJSONFilePath(filePath: string): boolean {
    return filePath.endsWith('.json') || filePath.endsWith('.json.template');
  }

  public isTemplateFilePath(filePath: string): boolean {
    return filePath.endsWith('.template');
  }

  public getRealTemplateFilePath(filePath: string): string {
    return filePath.replace('.template', '');
  }

  public readFile(filePath: string): string {
    return readFileSync(filePath, 'utf-8');
  }

  public readJSONFile(filePath: string): Record<string, unknown> {
    return JSON.parse(this.readFile(filePath));
  }

  public writeFile(filePath: string, content: string): void {
    writeFileSync(this.getRealTemplateFilePath(filePath), content, {
      encoding: 'utf-8'
    });
  }

  public replaceFile(
    targetFilePath: string,
    context: Record<string, unknown>
  ): string {
    let targetFileContent = this.readFile(targetFilePath);

    Object.keys(context).forEach((key) => {
      const value = context[key as keyof GeneratorContext];

      targetFileContent = targetFileContent.replace(
        new RegExp(`\\[TPL:${key}\\]`, 'g'),
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    });

    return targetFileContent;
  }

  public mergeJSONFile(
    targetJSONFilePath: string,
    sourceJSONContent: Record<string, unknown>
  ): void {
    const targetFileContent = this.readJSONFile(targetJSONFilePath);

    const composedFileContent = merge(sourceJSONContent, targetFileContent);

    this.writeFile(
      targetJSONFilePath,
      JSON.stringify(composedFileContent, null, 2)
    );
  }

  public composeConfigFile(
    context: GeneratorContext,
    sourceFilePath: string,
    targetFilePath: string
  ): boolean {
    // If the source and target are both same files, we need to merge them
    if (this.isTemplateFilePath(sourceFilePath)) {
      const fileContent = this.replaceFile(
        sourceFilePath,
        context as unknown as Record<string, unknown>
      );

      // if target file existed, merged!, only json!!
      if (
        this.isJSONFilePath(sourceFilePath) &&
        this.isJSONFilePath(targetFilePath)
      ) {
        const realTargetFilePath = this.getRealTemplateFilePath(targetFilePath);
        if (existsSync(realTargetFilePath)) {
          this.mergeJSONFile(realTargetFilePath, JSON.parse(fileContent));
          return true;
        }

        this.writeFile(realTargetFilePath, fileContent);
        return true;
      }

      this.writeFile(targetFilePath, fileContent);
      return true;
    }

    return false;
  }
}
