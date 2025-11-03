import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Popover } from 'antd';
import type { LocaleType } from '@config/i18n';
import { i18nConfig } from '@config/i18n';
import css from './import.module.css';
import type { LocalesImportEvent } from './LocalesImportEvent';

interface LocalesImportButtonProps {
  event: LocalesImportEvent;
  title: string;
  tt: {
    [key in LocaleType]: {
      title: string;
    };
  };
}

export function LocalesImportButton({
  event,
  title,
  tt
}: LocalesImportButtonProps) {
  const importPanel = (
    <div className="flex flex-col gap-2">
      {i18nConfig.supportedLngs.map((key) => {
        const targetTT = tt[key];

        return (
          <Upload
            className={css.uploadRoot}
            key={key}
            data-testid={`LocalesImportButton${key}`}
            accept=".json"
            maxCount={1}
            showUploadList={false}
            beforeUpload={(file) => {
              event.onImport(key as LocaleType, file);
              return false;
            }}
          >
            <Button block data-testid="LocalesImportButtonEn">
              {targetTT.title}
            </Button>
          </Upload>
        );
      })}
    </div>
  );

  return (
    <Popover
      data-testid="LocalesImportPopover"
      content={importPanel}
      trigger={['click']}
    >
      <Button data-testid="LocalesImportButton">
        <UploadOutlined />
        {title}
      </Button>
    </Popover>
  );
}
