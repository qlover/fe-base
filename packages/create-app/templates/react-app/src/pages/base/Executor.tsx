import { Button, Progress, Tag, Space, Card, message, Input, Select } from 'antd';
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

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customMethod, setCustomMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [customResponseType, setCustomResponseType] = useState<'text' | 'json' | 'blob'>('text');

  // 监听 helloState 变化，更新任务状态
  useEffect(() => {
    if (helloState.result) {
      message.success('插件测试成功');
      // 更新任务状态
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === '1' 
            ? { ...task, status: 'completed', progress: 100, endTime: new Date() }
            : task
        )
      );
    } else if (helloState.error) {
      message.error('插件测试失败');
      // 更新任务状态
      setTasks(prevTasks => 
        prevTasks.map(task => 
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
        return 'processing';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
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
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId
          ? { ...t, status: 'running', startTime: new Date() }
          : t
      )
    );

    try {
      await executorController.onTestPlugins();

      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId
            ? { ...t, status: 'completed', progress: 100, endTime: new Date() }
            : t
        )
      );

      message.success(`任务 ${task.name} 执行成功`);
    } catch (error) {
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId
            ? { ...t, status: 'failed', endTime: new Date() }
            : t
        )
      );

      message.error(`任务 ${task.name} 执行失败`);
    }
  };

  const handleStopTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
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

    setTasks(prev => [...prev, newTask]);
    setCustomUrl('');
    setCustomMethod('GET');
    setCustomResponseType('text');
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-base))] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <section className="py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[rgb(var(--color-text-primary))]">
              {t('executor')}
            </h1>
            <p className="text-xl text-[rgb(var(--color-text-secondary))] mb-8">
              {t('executor_description')}
            </p>
          </div>
        </section>

        {/* Test Plugin Section */}
        <section className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))]">
          <h2 className="text-xl font-medium text-[rgb(var(--color-text-primary))] mb-4">
            {t('executorTestPlugin')}
          </h2>
          <div className="space-y-4">
            <div className="text-[rgb(var(--color-text-secondary))]">
              {t('requestTimeout')}: {requestTimeout}
            </div>
            <div>
              {helloState.loading ? (
                <div className="text-[rgb(var(--color-text-secondary))]">Loading...</div>
              ) : (
                <Button
                  type="primary"
                  onClick={executorController.onTestPlugins}
                >
                  {t('testPlugin')}
                </Button>
              )}
            </div>
            <div className="bg-[rgb(var(--color-bg-base))] p-4 rounded-lg">
              {helloState.error instanceof Error ? (
                <div className="text-red-500">{helloState.error.message}</div>
              ) : (
                <pre className="text-[rgb(var(--color-text-secondary))]">
                  {IOC('JSON').stringify(helloState.result?.data)}
                </pre>
              )}
            </div>
          </div>
        </section>

        {/* Create New Task Section */}
        <section className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))]">
          <h2 className="text-xl font-medium text-[rgb(var(--color-text-primary))] mb-4">
            创建新任务
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="输入URL"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                className="flex-1"
              />
              <Select
                value={customMethod}
                onChange={value => setCustomMethod(value)}
                style={{ width: 120 }}
                className="fe-theme ant-select-css-var"
                options={[
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                  { value: 'DELETE', label: 'DELETE' }
                ]}
              />
              <Select
                value={customResponseType}
                onChange={value => setCustomResponseType(value)}
                style={{ width: 120 }}
                className="fe-theme ant-select-css-var"
                options={[
                  { value: 'text', label: 'Text' },
                  { value: 'json', label: 'JSON' },
                  { value: 'blob', label: 'Blob' }
                ]}
              />
              <Button type="primary" onClick={handleCreateTask}>
                创建任务
              </Button>
            </div>
          </div>
        </section>

        {/* Task Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border))]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                {tasks.length}
              </div>
              <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                总任务数
              </div>
            </div>
          </Card>
          <Card className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border))]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                {tasks.filter(t => t.status === 'running').length}
              </div>
              <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                运行中
              </div>
            </div>
          </Card>
          <Card className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border))]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                {tasks.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                已完成
              </div>
            </div>
          </Card>
          <Card className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border))]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                {tasks.filter(t => t.status === 'failed').length}
              </div>
              <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                失败
              </div>
            </div>
          </Card>
        </section>

        {/* Task List */}
        <section className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-[rgb(var(--color-text-primary))]">
              任务列表
            </h2>
            <Space>
              <Button type="primary" onClick={() => setSelectedTask(null)}>
                新建任务
              </Button>
              <Button>刷新</Button>
            </Space>
          </div>
          <div className="space-y-4">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-[rgb(var(--color-bg-base))] p-4 rounded-lg border border-[rgb(var(--color-border))]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-[rgb(var(--color-text-primary))]">
                      {task.name}
                    </span>
                    <Tag color={getTypeColor(task.type)}>
                      {task.type}
                    </Tag>
                    <Tag color={getStatusColor(task.status)}>
                      {task.status}
                    </Tag>
                    <Tag color="blue">
                      {task.method} {task.responseType}
                    </Tag>
                  </div>
                  <div className="text-sm text-[rgb(var(--color-text-secondary))] mt-2 sm:mt-0">
                    持续时间: {formatDuration(task.startTime, task.endTime)}
                  </div>
                </div>
                <div className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">
                  URL: {task.url}
                </div>
                <Progress
                  percent={task.progress}
                  status={task.status === 'failed' ? 'exception' : undefined}
                  className="mb-2"
                />
                <div className="flex justify-end space-x-2">
                  {task.status === 'pending' && (
                    <Button 
                      type="primary" 
                      size="small"
                      onClick={() => handleStartTask(task.id)}
                    >
                      开始执行
                    </Button>
                  )}
                  {task.status === 'running' && (
                    <Button 
                      danger 
                      size="small"
                      onClick={() => handleStopTask(task.id)}
                    >
                      停止
                    </Button>
                  )}
                  <Button size="small">查看详情</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Task History */}
        <section className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))]">
          <h2 className="text-xl font-medium text-[rgb(var(--color-text-primary))] mb-4">
            执行历史
          </h2>
          <div className="space-y-2">
            {tasks
              .filter(task => task.status === 'completed' || task.status === 'failed')
              .map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-[rgb(var(--color-bg-base))] rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Tag color={getStatusColor(task.status)}>
                      {task.status}
                    </Tag>
                    <span className="text-[rgb(var(--color-text-primary))]">
                      {task.name}
                    </span>
                    <Tag color="blue">
                      {task.method} {task.responseType}
                    </Tag>
                  </div>
                  <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {task.endTime?.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-[rgb(var(--color-text-primary))]">
            {t('Need Help?')}
          </h2>
          <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-6">
            遇到问题？查看我们的任务执行指南或联系支持团队
          </p>
          <Space>
            <Button type="primary" size="large">
              查看指南
            </Button>
            <Button size="large">
              联系支持
            </Button>
          </Space>
        </section>
      </div>
    </div>
  );
}
