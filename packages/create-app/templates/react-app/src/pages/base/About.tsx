import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import * as i18nKeys from '@config/Identifier/I18n';
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

export default function About() {
  const { t } = useBaseRoutePage();
  const [messageApi, contextHolder] = message.useMessage();
  const [notificationApi, contextHolder2] = notification.useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const showMessage = () => {
    messageApi.info(t(i18nKeys.ABOUT_MESSAGE_TEST), 2000);
  };

  const showNotification = () => {
    notificationApi.open({
      message: t(i18nKeys.ABOUT_NOTIFICATION_TITLE),
      description: t(i18nKeys.ABOUT_NOTIFICATION_DESC),
      duration: 2000
    });
  };
  const showNotification2 = () => {
    notification.open({
      message: t(i18nKeys.ABOUT_NOTIFICATION_TITLE),
      description: t(i18nKeys.ABOUT_NOTIFICATION_DESC),
      duration: 2000
    });
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const showMessage2 = () => {
    message.info(t(i18nKeys.ABOUT_MESSAGE_TEST), 200);
  };

  const showDrawer = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-primary py-6 flex flex-col justify-center sm:py-12">
      {contextHolder}
      {contextHolder2}
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <h1 className="text-2xl font-bold text-center text-text mb-8">
          {t(i18nKeys.PAGE_ABOUT_TITLE)}
        </h1>

        <div className="space-x-4 flex justify-center flex-wrap gap-4">
          <Button onClick={showMessage}>{t(i18nKeys.ABOUT_BTN_MESSAGE)}</Button>
          <Button onClick={showMessage2}>
            {t(i18nKeys.ABOUT_BTN_MESSAGE2)}
          </Button>

          <Button onClick={showNotification}>
            {t(i18nKeys.ABOUT_BTN_NOTIFICATION)}
          </Button>

          <Button onClick={showNotification2}>
            {t(i18nKeys.ABOUT_BTN_NOTIFICATION2)}
          </Button>

          <Tooltip title={t(i18nKeys.ABOUT_TOOLTIP_TEXT)}>
            <Button>{t(i18nKeys.ABOUT_BTN_TOOLTIP)}</Button>
          </Tooltip>

          <Modal
            title={t(i18nKeys.ABOUT_MODAL_TITLE)}
            open={isModalOpen}
            onOk={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
          >
            <p>{t(i18nKeys.ABOUT_MODAL_CONTENT)}</p>
          </Modal>

          <Button onClick={showModal}>{t(i18nKeys.ABOUT_BTN_MODAL)}</Button>

          <Drawer
            title={t(i18nKeys.ABOUT_DRAWER_TITLE)}
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          >
            <p>{t(i18nKeys.ABOUT_DRAWER_CONTENT)}</p>
          </Drawer>

          <Button onClick={showDrawer}>{t(i18nKeys.ABOUT_BTN_DRAWER)}</Button>

          <Popover
            content={t(i18nKeys.ABOUT_POPOVER_CONTENT)}
            title={t(i18nKeys.ABOUT_POPOVER_TITLE)}
          >
            <Button>{t(i18nKeys.ABOUT_BTN_POPOVER)}</Button>
          </Popover>

          <Popconfirm
            title={t(i18nKeys.ABOUT_POPCONFIRM_TITLE)}
            description={t(i18nKeys.ABOUT_POPCONFIRM_DESC)}
            okText={t(i18nKeys.COMMON_OK)}
            cancelText={t(i18nKeys.COMMON_CANCEL)}
          >
            <Button>{t(i18nKeys.ABOUT_BTN_POPCONFIRM)}</Button>
          </Popconfirm>

          <Alert
            message={t(i18nKeys.ABOUT_ALERT_MESSAGE)}
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
