import {
  Button,
  Progress,
  Tag,
  Space,
  Card,
  message,
  Input,
  Select
} from 'antd';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { useState, useEffect } from 'react';
import { IOC } from '@/core/IOC';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { ExecutorController } from '@/uikit/controllers/ExecutorController';
import { useSliceStore } from '@qlover/slice-store-react';

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
  const requestTimeout = useSliceStore(
    jSONStorageController,
    jSONStorageController.selector.requestTimeout
  );

  const helloState = useSliceStore(
    executorController,
    executorController.selector.helloState
  );

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: '测试插件任务',
      status: 'pending',
      progress: 0,
      type: 'data-sync',
      responseType: 'text',
      url: '/api/v1/executor/test',
      method: 'GET'
    },
    {
      id: '2',
      name: '数据同步任务',
      status: 'pending',
      progress: 0,
      type: 'data-sync',
      responseType: 'json',
      url: '/api/v1/data/sync',
      method: 'POST'
    },
    {
      id: '3',
      name: '系统维护任务',
      status: 'pending',
      progress: 0,
      type: 'system-maintenance',
      responseType: 'json',
      url: '/api/v1/system/maintenance',
      method: 'PUT'
    },
    {
      id: '4',
      name: '数据备份任务',
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
      message.success('插件测试成功');
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
      message.error('插件测试失败');
      // 更新任务状态
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === '1'
            ? { ...task, status: 'failed', endTime: new Date() }
            : task
        )
      );
    }
  }, [helloState.result, helloState.error]);

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
    return `${minutes} 分钟`;
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

      message.success(`任务 ${task.name} 执行成功`);
    } catch {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: 'failed', endTime: new Date() } : t
        )
      );

      message.error(`任务 ${task.name} 执行失败`);
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
      message.error('请输入URL');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      name: `自定义任务 ${customMethod} ${customUrl}`,
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
              {t('executor')}
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              {t('executor_description')}
            </p>
          </div>
        </section>

        {/* Test Plugin Section */}
        <section className="bg-secondary shadow sm:rounded-lg p-6 border border-border">
          <h2 className="text-xl font-medium text-text mb-4">
            {t('executorTestPlugin')}
          </h2>
          <div className="space-y-4">
            <div className="text-text-secondary">
              {t('requestTimeout')}: {requestTimeout}
            </div>
            <div>
              {helloState.loading ? (
                <div className="text-text-secondary">Loading...</div>
              ) : (
                <Button
                  type="primary"
                  onClick={executorController.onTestPlugins}
                >
                  {t('testPlugin')}
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
            {t('createTask')}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder={t('url')}
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="md:col-span-2"
              />
              <Select
                value={customMethod}
                onChange={(value) => setCustomMethod(value)}
                options={[
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                  { value: 'DELETE', label: 'DELETE' }
                ]}
              />
              <Select
                value={customResponseType}
                onChange={(value) => setCustomResponseType(value)}
                options={[
                  { value: 'text', label: 'Text' },
                  { value: 'json', label: 'JSON' },
                  { value: 'blob', label: 'Blob' }
                ]}
              />
            </div>
            <Button type="primary" onClick={handleCreateTask}>
              {t('createTask')}
            </Button>
          </div>
        </section>

        {/* Task Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-elevated border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-text">{tasks.length}</div>
              <div className="text-sm text-text-secondary">总任务数</div>
            </div>
          </Card>
          <Card className="bg-elevated border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-text">
                {tasks.filter((t) => t.status === 'running').length}
              </div>
              <div className="text-sm text-text-secondary">运行中</div>
            </div>
          </Card>
          <Card className="bg-elevated border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-text">
                {tasks.filter((t) => t.status === 'completed').length}
              </div>
              <div className="text-sm text-text-secondary">已完成</div>
            </div>
          </Card>
          <Card className="bg-elevated border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-text">
                {tasks.filter((t) => t.status === 'failed').length}
              </div>
              <div className="text-sm text-text-secondary">失败</div>
            </div>
          </Card>
        </section>

        {/* Task List Section */}
        <section className="bg-secondary shadow sm:rounded-lg p-6 border border-border">
          <h2 className="text-xl font-medium text-text mb-4">
            {t('taskList')}
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
                        {t('start')}
                      </Button>
                    )}
                    {task.status === 'running' && (
                      <Button danger onClick={() => handleStopTask(task.id)}>
                        {t('stop')}
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
          <h2 className="text-xl font-medium text-text mb-4">执行历史</h2>
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
            {t('Need Help?')}
          </h2>
          <p className="text-lg text-text-secondary mb-6">
            遇到问题？查看我们的任务执行指南或联系支持团队
          </p>
          <Space>
            <Button type="primary" size="large">
              查看指南
            </Button>
            <Button size="large">联系支持</Button>
          </Space>
        </section>
      </div>
    </div>
  );
}
