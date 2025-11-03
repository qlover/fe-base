import { StoreInterface } from '@qlover/corekit-bridge';
import type { AdminLocalesApi } from '@/base/services/adminApi/AdminLocalesApi';
import type { LocaleType } from '@config/i18n';
import type { StoreStateInterface } from '@qlover/corekit-bridge';

export class LocalesImportEventState implements StoreStateInterface {}

export class LocalesImportEvent extends StoreInterface<LocalesImportEventState> {
  constructor(protected localesApi: AdminLocalesApi) {
    super(() => new LocalesImportEventState());
  }

  protected validate(file: File): void {
    if (file.type !== 'application/json') {
      throw new Error('File must be a JSON file');
    }
  }

  async onImport(type: LocaleType, file: File): Promise<void> {
    try {
      this.validate(file);

      await this.localesApi.import({ [type]: file });
    } catch (error) {
      console.log(error);
    }
  }
}
