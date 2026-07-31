import dayjs from 'dayjs';

/**
 * Lightweight date helpers. Not `@injectable` here — apps bind or decorate
 * in their own IOC layer so importing schemas/utils does not require
 * `reflect-metadata`.
 */
export class Datetime {
  public timestamp(): number {
    return dayjs().unix();
  }

  public timestampz(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').replace('Z', '+00');
  }

  public format(format: string, date?: Date): string {
    return dayjs(date).format(format);
  }
}
