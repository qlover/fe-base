import { message, Modal, notification } from 'antd';
import { useEffect } from 'react';
import type { AntdStaticApiInterface } from './AntdStaticApiInterface';

export function AntdStaticProvider({
  staticApi
}: {
  staticApi: AntdStaticApiInterface;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  useEffect(() => {
    staticApi.setMessage(messageApi);
  }, [messageApi, staticApi]);

  useEffect(() => {
    staticApi.setModal(modalApi);
  }, [modalApi, staticApi]);

  useEffect(() => {
    staticApi.setNotification(notificationApi);
  }, [notificationApi, staticApi]);

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      {notificationContextHolder}
    </>
  );
}
