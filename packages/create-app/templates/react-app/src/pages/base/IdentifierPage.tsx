import {
  ResourceEvent,
  ResourceTable
} from '@brain-toolkit/antd-blocks/resourceTable';
import { useFactory, useLifecycle } from '@brain-toolkit/react-kit';
import * as ErrorIdentifierList from '@config/Identifier/common/common.error';
import { Button } from 'antd';
import { IdentifierService } from '@/base/services/IdentifierService';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { useIOC } from '@/uikit/hooks/useIOC';
import type { Identifiter18nInterface } from '@config/i18n/identifiter18n';
import type { ResourceTableOption } from '@brain-toolkit/antd-blocks/resourceTable';

export default function IdentifierPage() {
  const { t, tt } = useBaseRoutePage<Identifiter18nInterface>();
  const identifierService = useIOC(IdentifierService);
  const tableEvent = useFactory(ResourceEvent, 'identifier', identifierService);

  useLifecycle(tableEvent);

  const columns: ResourceTableOption<any>[] = [
    {
      title: tt.iTableIndex,
      dataIndex: 'index',
      key: 'index'
    },
    {
      title: tt.iTableId,
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: tt.iTableLabel,
      dataIndex: 'locale',
      key: 'locale'
    },
    {
      title: tt.iTableLocaleValue,
      dataIndex: 'localeValue',
      key: 'localeValue'
    }
  ] as ResourceTableOption<any>[];

  return (
    <div
      data-testid="IdentifierPage"
      className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <section className="py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text">
              {tt.title}
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              {tt.sourceDescription}
            </p>
          </div>
        </section>

        {/* Error Identifier List */}
        <div className="grid gap-4">
          {Object.entries(ErrorIdentifierList).map(([key, value]) => (
            <div
              data-testid={`IdentifierPage-${key}`}
              key={key}
              className="bg-secondary shadow sm:rounded-lg p-6 border border-border hover:bg-elevated transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <span className="font-medium text-text mb-2 sm:mb-0">
                  {key}
                </span>
                <span className="text-sm text-text-secondary bg-primary px-3 py-1 rounded-md">
                  {t(value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-text">
            {tt.iTableTitle}
          </h2>
          <div className="text-lg text-text-secondary mb-6">
            {tt.iTableDescription}
          </div>
          <ResourceTable
            columns={columns}
            tableEvent={tableEvent}
            actionProps={false}
            // use antd default pagination
            pagination={{
              pageSizeOptions: [20, 50, 100],
              current: undefined,
              pageSize: undefined,
              total: undefined,
              onChange: undefined
            }}
          />
        </div>

        {/* Call to Action Section */}
        <section className="py-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-text">{tt.helpTitle}</h2>
          <p className="text-lg text-text-secondary mb-6">
            {tt.helpDescription}
          </p>
          <Button type="primary" size="large">
            {tt.contactSupport}
          </Button>
        </section>
      </div>
    </div>
  );
}
