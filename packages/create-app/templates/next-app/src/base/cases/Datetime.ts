import dayjs from 'dayjs';
import { injectable } from 'inversify';

@injectable()
export class Datetime {
  timestamp(): number {
    return dayjs().unix();
  }

  timestampz(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').replace('Z', '+00');
  }

  format(format: string, date?: Date): string {
    return dayjs(date).format(format);
  }
}
