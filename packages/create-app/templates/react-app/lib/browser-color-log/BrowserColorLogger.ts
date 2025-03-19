import { Logger, LogLevel } from '@qlover/fe-utils';

export class BrowserColorLogger extends Logger {
  prefix(value: string): string[] {
    const style = this.getStyleForLevel(value);
    return [`%c${value}`, style];
  }

  protected print(
    level: LogLevel,
    prefix: string | string[],
    ...args: unknown[]
  ): void {
    if (this.isSilent) {
      return;
    }
    if (Array.isArray(prefix)) {
      console.log(...prefix, ...args);
      return;
    }

    console.log(prefix, ...args);
  }

  private getStyleForLevel(level: string): string {
    switch (level) {
      case 'INFO':
        return 'color: blue;';
      case 'WARN':
        return 'color: orange; font-weight: bold;';
      case 'ERROR':
        return 'color: red; font-weight: bold;';
      case 'DEBUG':
        return 'color: green;';
      default:
        return '';
    }
  }
}
