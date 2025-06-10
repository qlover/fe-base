import { Button, Progress, Tag, Space, Card, Input, Select } from 'antd';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { useState, useEffect } from 'react';
import { IOC } from '@/core/IOC';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { ExecutorController } from '@/uikit/controllers/ExecutorController';
import { useStore } from '@/uikit/hooks/useStore';
import * as i18nKeys from '@config/Identifier/I18n';

interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  type: 'data-sync' | 'report-generation' | 'system-maintenance' | 'backup';
  startTime?: Date;
  endTime?: Date;
  responseType?: 'text' | 'json' | 'blob';
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export default function Executor() {
  const { t } = useBaseRoutePage();
  const executorController = IOC(ExecutorController);
  const jSONStorageController = IOC(JSONStorageController);
  const requestTimeout = useStore(
    jSONStorageController,
    jSONStorageController.selector.requestTimeout
  );

  const helloState = useStore(
    executorController,
    executorController.selector.helloState
  );

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: t(i18nKeys.PAGE_EXECUTOR_TEST_PLUGIN_TITLE),
      status: 'pending',
      progress: 0,
      type: 'data-sync',
      responseType: 'text',
      url: '/api/v1/executor/test',
      method: 'GET'
    },
    {
      id: '2',
      name: t(i18nKeys.PAGE_EXECUTOR_TASK_TYPE_DATA_SYNC),
      status: 'pending',
      progress: 0,
      type: 'data-sync',
      responseType: 'json',
      url: '/api/v1/data/sync',
      method: 'POST'
    },
    {
      id: '3',
      name: t(i18nKeys.PAGE_EXECUTOR_TASK_TYPE_MAINTENANCE),
      status: 'pending',
      progress: 0,
      type: 'system-maintenance',
      responseType: 'json',
      url: '/api/v1/system/maintenance',
      method: 'PUT'
    },
    {
      id: '4',
      name: t(i18nKeys.PAGE_EXECUTOR_TASK_TYPE_BACKUP),
      status: 'pending',
      progress: 0,
      type: 'backup',
      responseType: 'blob',
      url: '/api/v1/data/backup',
      method: 'GET'
    }
  ]);

  const [customUrl, setCustomUrl] = useState('');
  const [customMethod, setCustomMethod] = useState<
    'GET' | 'POST' | 'PUT' | 'DELETE'
  >('GET');
  const [customResponseType, setCustomResponseType] = useState<
    'text' | 'json' | 'blob'
  >('text');

  // 监听 helloState 变化，更新任务状态
  useEffect(() => {
    if (helloState.result) {
      IOC('DialogHandler').success(
        t(i18nKeys.PAGE_EXECUTOR_PLUGIN_TEST_SUCCESS)
      );
      // 更新任务状态
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === '1'
            ? {
                ...task,
                status: 'completed',
                progress: 100,
                endTime: new Date()
              }
            : task
        )
      );
    } else if (helloState.error) {
      IOC('DialogHandler').error(t(i18nKeys.PAGE_EXECUTOR_PLUGIN_TEST_FAILURE));
      // 更新任务状态
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === '1'
            ? { ...task, status: 'failed', endTime: new Date() }
            : task
        )
      );
    }
  }, [helloState.result, helloState.error, t]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'running':
        return 'active';
      case 'completed':
        return 'success';
      case 'failed':
        return 'exception';
      default:
        return 'normal';
    }
  };

  const getTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'data-sync':
        return 'blue';
      case 'report-generation':
        return 'green';
      case 'system-maintenance':
        return 'orange';
      case 'backup':
        return 'purple';
      default:
        return 'default';
    }
  };

  const formatDuration = (startTime?: Date, endTime?: Date) => {
    if (!startTime) return '-';
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    return `${minutes} ${t(i18nKeys.PAGE_EXECUTOR_TASK_DURATION_UNIT)}`;
  };

  const handleStartTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: 'running', startTime: new Date() } : t
      )
    );

    try {
      await executorController.onTestPlugins();

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId
            ? { ...t, status: 'completed', progress: 100, endTime: new Date() }
            : t
        )
      );

      IOC('DialogHandler').success(
        t(i18nKeys.PAGE_EXECUTOR_TASK_SUCCESS, { name: task.name })
      );
    } catch {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: 'failed', endTime: new Date() } : t
        )
      );

      IOC('DialogHandler').error(
        t(i18nKeys.PAGE_EXECUTOR_TASK_FAILURE, { name: task.name })
      );
    }
  };

  const handleStopTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: 'failed', endTime: new Date() }
          : task
      )
    );
  };

  const handleCreateTask = () => {
    if (!customUrl) {
      IOC('DialogHandler').error(
        t(i18nKeys.PAGE_EXECUTOR_CUSTOM_TASK_URL_REQUIRED)
      );
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      name: t(i18nKeys.PAGE_EXECUTOR_CUSTOM_TASK_NAME, {
        method: customMethod,
        url: customUrl
      }),
      status: 'pending',
      progress: 0,
      type: 'data-sync',
      responseType: customResponseType,
      url: customUrl,
      method: customMethod
    };

    setTasks((prev) => [...prev, newTask]);
    setCustomUrl('');
    setCustomMethod('GET');
    setCustomResponseType('text');
  };

  return (
    <div className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <section className="py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text">
              {t(i18nKeys.PAGE_EXECUTOR_MAIN_TITLE)}
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              {t(i18nKeys.PAGE_EXECUTOR_DESCRIPTION)}
            </p>
          </div>
        </section>

        {/* Test Plugin Section */}
        <section className="bg-secondary shadow sm:rounded-lg p-6 border border-border">
          <h2 className="text-xl font-medium text-text mb-4">
            {t(i18nKeys.PAGE_EXECUTOR_TEST_PLUGIN_TITLE)}
          </h2>
          <div className="space-y-4">
            <div className="text-text-secondary">
              {t(i18nKeys.PAGE_REQUEST_TIMEOUT)}: {requestTimeout}
            </div>
            <div>
              {helloState.loading ? (
                <div className="text-text-secondary">Loading...</div>
              ) : (
                <Button
                  type="primary"
                  onClick={executorController.onTestPlugins}
                >
                  {t(i18nKeys.PAGE_EXECUTOR_TEST_PLUGIN_TITLE)}
                </Button>
              )}
            </div>
            <div className="bg-elevated p-4 rounded-lg">
              {helloState.error instanceof Error ? (
                <div className="text-red-500">{helloState.error.message}</div>
              ) : (
                <pre className="text-text-secondary">
                  {IOC('JSON').stringify(helloState.result?.data)}
                </pre>
              )}
            </div>
          </div>
        </section>

        {/* Create Task Section */}
        <section className="bg-secondary shadow sm:rounded-lg p-6 border border-border">
          <h2 className="text-xl font-medium text-text mb-4">
            {t(i18nKeys.PAGE_EXECUTOR_CREATE_TASK_TITLE)}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                placeholder={t(i18nKeys.PAGE_EXECUTOR_ENTER_URL)}
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1"
              />
              <Select
                value={customMethod}
                onChange={setCustomMethod}
                style={{ width: 120 }}
              >
                <Select.Option value="GET">GET</Select.Option>
                <Select.Option value="POST">POST</Select.Option>
                <Select.Option value="PUT">PUT</Select.Option>
                <Select.Option value="DELETE">DELETE</Select.Option>
              </Select>
              <Select
                value={customResponseType}
                onChange={setCustomResponseType}
                style={{ width: 120 }}
              >
                <Select.Option value="text">Text</Select.Option>
                <Select.Option value="json">JSON</Select.Option>
                <Select.Option value="blob">Blob</Select.Option>
              </Select>
              <Button type="primary" onClick={handleCreateTask}>
                {t(i18nKeys.PAGE_EXECUTOR_CREATE_BUTTON)}
              </Button>
            </div>
          </div>
        </section>

        {/* Task Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-elevated border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-text">{tasks.length}</div>
              <div className="text-sm text-text-secondary">
                {t(i18nKeys.PAGE_EXECUTOR_TASK_STATS_TOTAL)}
              </div>
            </div>
          </Card>
          <Card className="bg-elevated border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-text">
                {tasks.filter((t) => t.status === 'running').length}
              </div>
              <div className="text-sm text-text-secondary">
                {t(i18nKeys.PAGE_EXECUTOR_TASK_STATS_RUNNING)}
              </div>
            </div>
          </Card>
          <Card className="bg-elevated border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-text">
                {tasks.filter((t) => t.status === 'completed').length}
              </div>
              <div className="text-sm text-text-secondary">
                {t(i18nKeys.PAGE_EXECUTOR_TASK_STATS_COMPLETED)}
              </div>
            </div>
          </Card>
          <Card className="bg-elevated border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-text">
                {tasks.filter((t) => t.status === 'failed').length}
              </div>
              <div className="text-sm text-text-secondary">
                {t(i18nKeys.PAGE_EXECUTOR_TASK_STATS_FAILED)}
              </div>
            </div>
          </Card>
        </section>

        {/* Task List Section */}
        <section className="bg-secondary shadow sm:rounded-lg p-6 border border-border">
          <h2 className="text-xl font-medium text-text mb-4">
            {t(i18nKeys.PAGE_EXECUTOR_TASK_LIST_TITLE)}
          </h2>
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="bg-elevated border-border"
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-text">{task.name}</span>
                    <Space>
                      <Tag color={getTypeColor(task.type)}>{task.type}</Tag>
                      <Tag color={getStatusColor(task.status)}>
                        {task.status}
                      </Tag>
                    </Space>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-text-secondary">
                    <div>
                      <span className="font-medium">URL:</span> {task.url}
                    </div>
                    <div>
                      <span className="font-medium">Method:</span> {task.method}
                    </div>
                    <div>
                      <span className="font-medium">Response Type:</span>{' '}
                      {task.responseType}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>{' '}
                      {formatDuration(task.startTime, task.endTime)}
                    </div>
                  </div>
                  <Progress
                    percent={task.progress}
                    status={getStatusColor(task.status)}
                  />
                  <div className="flex justify-end space-x-2">
                    {task.status === 'pending' && (
                      <Button
                        type="primary"
                        onClick={() => handleStartTask(task.id)}
                      >
                        {t(i18nKeys.PAGE_EXECUTOR_TASK_START)}
                      </Button>
                    )}
                    {task.status === 'running' && (
                      <Button
                        type="primary"
                        danger
                        onClick={() => handleStopTask(task.id)}
                      >
                        {t(i18nKeys.PAGE_EXECUTOR_TASK_STOP)}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Task History */}
        <section className="bg-secondary shadow sm:rounded-lg p-6 border border-border">
          <h2 className="text-xl font-medium text-text mb-4">
            {t(i18nKeys.PAGE_EXECUTOR_TASK_HISTORY_TITLE)}
          </h2>
          <div className="space-y-2">
            {tasks
              .filter(
                (task) =>
                  task.status === 'completed' || task.status === 'failed'
              )
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-elevated rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                    <span className="text-text">{task.name}</span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {task.endTime?.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-text">
            {t(i18nKeys.PAGE_EXECUTOR_HELP_TITLE)}
          </h2>
          <p className="text-lg text-text-secondary mb-6">
            {t(i18nKeys.PAGE_EXECUTOR_HELP_DESCRIPTION)}
          </p>
          <Space>
            <Button type="primary" size="large">
              {t(i18nKeys.PAGE_EXECUTOR_VIEW_GUIDE)}
            </Button>
            <Button size="large">
              {t(i18nKeys.PAGE_EXECUTOR_CONTACT_SUPPORT)}
            </Button>
          </Space>
        </section>
      </div>
    </div>
  );
}
