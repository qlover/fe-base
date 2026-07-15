'use client';

import { Table } from 'antd';
import { useState } from 'react';
import type { DialogHandler } from '@/impls/DialogHandler';
import { AntdDemoProvider } from '@/uikit/components/AntdDemoProvider';
import { Button } from '@/uikit/components/Button';
import { Dropdown } from '@/uikit/components/Dropdown';
import { Modal } from '@/uikit/components/Modal';
import { Tooltip } from '@/uikit/components/Tooltip';
import { ZustandCounterCard } from '@/uikit/components-app/ZustandCounterCard';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { useIOC } from '@/uikit/hook/useIOC';
import { demoUiI18n } from '@config/i18n-mapping/demoUiI18n';
import { I } from '@config/ioc-identifiter';

function Section({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-testid="Section"
      className="border-primary-border bg-secondary/40 rounded-2xl border p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-primary-text">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-secondary-text">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Interactive kit for custom UI + legacy antd theme (scoped here only).
 */
export function DemoUiShowcase() {
  const tt = useI18nMapping(demoUiI18n);
  const dialogHandler = useIOC(I.DialogHandler) as DialogHandler;
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownKey, setDropdownKey] = useState('light');

  const themeLabel =
    dropdownKey === 'dark'
      ? tt.themeDark
      : dropdownKey === 'pink'
        ? tt.themePink
        : tt.themeLight;

  return (
    <div
      data-testid="DemoUiShowcase"
      className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 pb-16"
    >
      <header>
        <h1 className="text-2xl font-semibold text-primary-text sm:text-3xl">
          {tt.heading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-secondary-text">{tt.intro}</p>
      </header>

      <Section title={tt.sectionButton} description={tt.sectionButtonDesc}>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="header">Header</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </div>
      </Section>

      <Section title={tt.sectionTooltip}>
        <div className="flex flex-wrap gap-3">
          <Tooltip title={tt.placementTop} placement="top">
            <Button variant="secondary">{tt.placementTop}</Button>
          </Tooltip>
          <Tooltip title={tt.placementBottom} placement="bottom">
            <Button variant="secondary">{tt.placementBottom}</Button>
          </Tooltip>
          <Tooltip title={tt.placementLeft} placement="left">
            <Button variant="secondary">{tt.placementLeft}</Button>
          </Tooltip>
          <Tooltip title={tt.placementRight} placement="right">
            <Button variant="secondary">{tt.placementRight}</Button>
          </Tooltip>
        </div>
      </Section>

      <Section title={tt.sectionDropdown} description={tt.sectionDropdownDesc}>
        <Dropdown
          selectedKeys={[dropdownKey]}
          onSelect={setDropdownKey}
          items={[
            { key: 'light', label: tt.themeLight },
            { key: 'dark', label: tt.themeDark },
            { key: 'pink', label: tt.themePink },
            { key: 'disabled', label: tt.disabled, disabled: true }
          ]}
        >
          <Button variant="secondary">
            {tt.themePrefix}: {themeLabel}
          </Button>
        </Dropdown>
      </Section>

      <Section title={tt.sectionModal} description={tt.sectionModalDesc}>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          {tt.openModal}
        </Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={tt.modalTitle}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                {tt.cancel}
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                {tt.confirm}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-secondary-text leading-relaxed">
            {tt.modalBody}
          </p>
        </Modal>
      </Section>

      <Section title={tt.sectionToast} description={tt.sectionToastDesc}>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => dialogHandler.success(tt.toastSuccess)}
          >
            {tt.toastSuccess}
          </Button>
          <Button
            variant="secondary"
            onClick={() => dialogHandler.info(tt.toastInfo)}
          >
            {tt.toastInfo}
          </Button>
          <Button
            variant="warning"
            onClick={() => dialogHandler.warn(tt.toastWarn)}
          >
            {tt.toastWarn}
          </Button>
          <Button
            variant="danger"
            onClick={() => dialogHandler.error(tt.toastError)}
          >
            {tt.toastError}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              dialogHandler.confirm({
                title: tt.confirmTitle,
                content: tt.confirmContent,
                okText: tt.ok,
                cancelText: tt.cancel,
                onOk: () => dialogHandler.success(tt.confirmDone)
              })
            }
          >
            {tt.confirm}
          </Button>
        </div>
      </Section>

      <ZustandCounterCard />

      <Section title={tt.sectionAntd} description={tt.sectionAntdDesc}>
        <AntdDemoProvider>
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            dataSource={[
              { id: '1', name: 'Alice', role: 'Admin' },
              { id: '2', name: 'Bob', role: 'Developer' },
              { id: '3', name: 'Carol', role: 'Viewer' }
            ]}
            columns={[
              { title: tt.colName, dataIndex: 'name' },
              { title: tt.colRole, dataIndex: 'role' }
            ]}
          />
        </AntdDemoProvider>
      </Section>
    </div>
  );
}
