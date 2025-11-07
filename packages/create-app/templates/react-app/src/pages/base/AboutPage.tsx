import { aboutI18n } from '@config/i18n/aboutI18n';
import {
  Button,
  Tooltip,
  message,
  notification,
  Modal,
  Drawer,
  Popover,
  Popconfirm,
  Alert
} from 'antd';
import { useState } from 'react';
import { useI18nInterface } from '@/uikit/hooks/useI18nInterface';

export default function AboutPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [notificationApi, contextHolder2] = notification.useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const tt = useI18nInterface(aboutI18n);

  const showMessage = () => {
    messageApi.info(tt.messageTest, 2000);
  };

  const showNotification = () => {
    notificationApi.open({
      message: tt.notificationTitle,
      description: tt.notificationDescription,
      duration: 2000
    });
  };
  const showNotification2 = () => {
    notification.open({
      message: tt.notificationTitle,
      description: tt.notificationDescription,
      duration: 2000
    });
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const showMessage2 = () => {
    message.info(tt.messageTest, 200);
  };

  const showDrawer = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div
      data-testid="AboutPage"
      className="min-h-screen bg-primary py-6 flex flex-col justify-center sm:py-12"
    >
      {contextHolder}
      {contextHolder2}
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <h1 className="text-2xl font-bold text-center text-text mb-8">
          {tt.title}
        </h1>

        <div className="space-x-4 flex justify-center flex-wrap gap-4">
          <Button onClick={showMessage}>{tt.btnMessage}</Button>
          <Button onClick={showMessage2}>{tt.btnMessage2}</Button>

          <Button onClick={showNotification}>{tt.btnNotification}</Button>

          <Button onClick={showNotification2}>{tt.btnNotification2}</Button>

          <Tooltip title={tt.tooltipText}>
            <Button>{tt.btnTooltip}</Button>
          </Tooltip>

          <Modal
            title={tt.modalTitle}
            open={isModalOpen}
            onOk={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
          >
            <p>{tt.modalContent}</p>
          </Modal>

          <Button onClick={showModal}>{tt.btnModal}</Button>

          <Drawer
            title={tt.drawerTitle}
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          >
            <p>{tt.drawerContent}</p>
          </Drawer>

          <Button onClick={showDrawer}>{tt.btnDrawer}</Button>

          <Popover content={tt.popoverContent} title={tt.popoverTitle}>
            <Button>{tt.btnPopover}</Button>
          </Popover>

          <Popconfirm
            title={tt.popconfirmTitle}
            description={tt.popconfirmDesc}
            okText={tt.okText}
            cancelText={tt.cancelText}
          >
            <Button>{tt.btnPopconfirm}</Button>
          </Popconfirm>

          <Alert
            message={tt.alertMessage}
            type="warning"
            showIcon
            closable
            className="mt-4"
          />
        </div>
      </div>
    </div>
  );
}
