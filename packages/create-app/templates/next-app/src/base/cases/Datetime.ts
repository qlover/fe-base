import dayjs from 'dayjs';
import { injectable } from 'inversify';

@injectable()
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
