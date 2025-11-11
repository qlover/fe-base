# 开发指南

> **📖 本文档提供完整的页面开发流程和实战指南，帮助你快速上手项目开发。**

## 📋 目录

- [开发一个页面需要什么](#-开发一个页面需要什么)
- [完整开发流程](#-完整开发流程)
- [实战示例：用户列表页](#-实战示例用户列表页)
- [常见场景](#-常见场景)
- [代码规范](#-代码规范)
- [开发工具](#-开发工具)

---

## 🎯 开发一个页面需要什么

### 核心清单

一个完整的页面通常需要以下组成部分：

```
✅ 1. 接口定义 (Port)           - base/port/XxxServiceInterface.ts
✅ 2. 服务实现 (Service)         - base/services/XxxService.ts
✅ 3. API 适配器 (可选)          - base/apis/xxxApi/XxxApi.ts
✅ 4. 路由配置                   - config/app.router.ts
✅ 5. i18n 文本定义              - config/Identifier/pages/page.xxx.ts
✅ 6. 页面组件                   - pages/xxx/XxxPage.tsx
✅ 7. IOC 注册 (如果是新服务)    - core/clientIoc/ClientIOCRegister.ts
✅ 8. 测试文件                   - __tests__/src/pages/xxx/XxxPage.test.tsx
```

### 依赖关系图

```
┌─────────────────────────────────────────┐
│  路由配置 (app.router.ts)                │
│  定义页面路径和元数据                    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  页面组件 (XxxPage.tsx)                  │
│  - 使用 useIOC 获取服务                  │
│  - 使用 useStore 订阅状态                │
│  - 使用 useAppTranslation 获取翻译       │
│  - 处理 UI 渲染和用户交互                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  服务层 (XxxService.ts)                  │
│  - 实现业务逻辑                          │
│  - 继承 StoreInterface                   │
│  - 依赖注入其他服务                      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  接口定义 (XxxServiceInterface.ts)       │
│  - 定义服务契约                          │
│  - 便于测试和 mock                       │
└─────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  API 适配器 (XxxApi.ts)                  │
│  - 封装 HTTP 请求                        │
│  - 转换数据格式                          │
└─────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  i18n 文本 (page.xxx.ts)                 │
│  - 定义页面所有文本的 Key                │
│  - 自动生成翻译文件                      │
└─────────────────────────────────────────┘
```

---

## 🚀 完整开发流程

### 流程图

```
📝 1. 需求分析
   ├── 确定页面功能
   ├── 确定数据来源（API）
   └── 确定交互逻辑
       ↓
🎨 2. 定义 i18n Key
   ├── 页面标题、按钮文本等
   └── 错误提示、成功提示等
       ↓
🔌 3. 定义接口 (Port)
   ├── 服务接口
   └── 数据类型
       ↓
⚙️ 4. 实现服务 (Service)
   ├── 继承 StoreInterface
   ├── 实现业务逻辑
   └── 依赖注入
       ↓
🌐 5. 实现 API 适配器（如果需要）
   ├── 封装 HTTP 请求
   └── 数据转换
       ↓
🗺️ 6. 配置路由
   ├── 添加路由配置
   └── 设置元数据
       ↓
🎭 7. 实现页面组件
   ├── 使用 useIOC 获取服务
   ├── 使用 useStore 订阅状态
   └── 实现 UI 渲染
       ↓
🔗 8. 注册到 IOC（如果是新服务）
   └── 在 ClientIOCRegister 中注册
       ↓
🧪 9. 编写测试
   ├── 服务测试（逻辑）
   ├── UI 测试（渲染）
   └── 集成测试（流程）
       ↓
✅ 10. 自测和提交
   ├── 功能自测
   ├── 代码检查
   └── 提交 PR
```

---

## 📚 实战示例：用户列表页

假设我们要开发一个用户列表页面，功能包括：

- 显示用户列表
- 搜索用户
- 分页加载
- 查看用户详情

### 1. 需求分析

**功能清单：**

- 📄 显示用户列表（头像、姓名、邮箱、角色）
- 🔍 搜索用户（按姓名搜索）
- 📃 分页（每页 10 条）
- 👁️ 查看详情（点击跳转详情页）
- 🔄 刷新列表

**数据来源：**

- API: `GET /api/users?page=1&pageSize=10&keyword=xxx`

### 2. 定义 i18n Key

```typescript
// config/Identifier/pages/page.users.ts

/**
 * @description User list page title
 * @localZh 用户列表
 * @localEn User List
 */
export const PAGE_USERS_TITLE = 'page.users.title';

/**
 * @description Search user placeholder
 * @localZh 搜索用户姓名
 * @localEn Search user name
 */
export const PAGE_USERS_SEARCH_PLACEHOLDER = 'page.users.search.placeholder';

/**
 * @description View user detail button
 * @localZh 查看详情
 * @localEn View Detail
 */
export const PAGE_USERS_VIEW_DETAIL = 'page.users.viewDetail';

/**
 * @description Refresh button
 * @localZh 刷新
 * @localEn Refresh
 */
export const PAGE_USERS_REFRESH = 'page.users.refresh';

/**
 * @description Loading message
 * @localZh 加载中...
 * @localEn Loading...
 */
export const PAGE_USERS_LOADING = 'page.users.loading';

/**
 * @description Empty message
 * @localZh 暂无用户数据
 * @localEn No users found
 */
export const PAGE_USERS_EMPTY = 'page.users.empty';
```

### 3. 定义接口和类型

```typescript
// base/port/UserServiceInterface.ts

import { StoreInterface } from '@qlover/corekit-bridge';

/**
 * 用户信息
 */
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
}

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
  list: UserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 用户服务状态
 */
export interface UserServiceState extends StoreStateInterface {
  users: UserInfo[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: Error | null;
}

/**
 * 用户服务接口
 */
export abstract class UserServiceInterface extends StoreInterface<UserServiceState> {
  /**
   * 获取用户列表
   */
  abstract fetchUsers(params: UserListParams): Promise<void>;

  /**
   * 搜索用户
   */
  abstract searchUsers(keyword: string): Promise<void>;

  /**
   * 刷新列表
   */
  abstract refreshUsers(): Promise<void>;

  /**
   * 选择器
   */
  abstract selector: {
    users: (state: UserServiceState) => UserInfo[];
    loading: (state: UserServiceState) => boolean;
    total: (state: UserServiceState) => number;
  };
}
```

### 4. 实现 API 适配器

```typescript
// base/apis/userApi/UserApi.ts

import { injectable, inject } from 'inversify';
import { HttpClient } from '@/base/cases/HttpClient';
import type {
  UserListParams,
  UserListResponse
} from '@/base/port/UserServiceInterface';

@injectable()
export class UserApi {
  constructor(@inject(HttpClient) private http: HttpClient) {}

  /**
   * 获取用户列表
   */
  async getUserList(params: UserListParams): Promise<UserListResponse> {
    const response = await this.http.get('/api/users', { params });

    // 转换后端数据格式
    return {
      list: response.data.items.map((item: any) => ({
        id: item.user_id,
        name: item.user_name,
        email: item.user_email,
        avatar: item.avatar_url,
        role: item.user_role
      })),
      total: response.data.total_count,
      page: response.data.current_page,
      pageSize: response.data.page_size
    };
  }
}
```

### 5. 实现服务

```typescript
// base/services/UserService.ts

import { injectable, inject } from 'inversify';
import {
  UserServiceInterface,
  UserServiceState
} from '@/base/port/UserServiceInterface';
import { UserApi } from '@/base/apis/userApi/UserApi';
import type { UserListParams } from '@/base/port/UserServiceInterface';

@injectable()
export class UserService extends UserServiceInterface {
  constructor(@inject(UserApi) private api: UserApi) {
    // 初始化状态
    super(() => ({
      users: [],
      total: 0,
      page: 1,
      pageSize: 10,
      loading: false,
      error: null
    }));
  }

  /**
   * 选择器
   */
  selector = {
    users: (state: UserServiceState) => state.users,
    loading: (state: UserServiceState) => state.loading,
    total: (state: UserServiceState) => state.total,
    page: (state: UserServiceState) => state.page,
    pageSize: (state: UserServiceState) => state.pageSize
  };

  /**
   * 获取用户列表
   */
  async fetchUsers(params: UserListParams): Promise<void> {
    try {
      // 1. 设置加载状态
      this.emit({ ...this.state, loading: true, error: null });

      // 2. 调用 API
      const response = await this.api.getUserList(params);

      // 3. 更新状态
      this.emit({
        users: response.list,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        loading: false,
        error: null
      });
    } catch (error) {
      // 4. 错误处理
      this.emit({
        ...this.state,
        loading: false,
        error: error as Error
      });
    }
  }

  /**
   * 搜索用户
   */
  async searchUsers(keyword: string): Promise<void> {
    await this.fetchUsers({
      page: 1,
      pageSize: this.state.pageSize,
      keyword
    });
  }

  /**
   * 刷新列表
   */
  async refreshUsers(): Promise<void> {
    await this.fetchUsers({
      page: this.state.page,
      pageSize: this.state.pageSize
    });
  }
}
```

### 6. 配置路由

```typescript
// config/app.router.ts

import * as i18nKeys from './Identifier/pages/page.users';

export const baseRoutes: RouteConfigValue[] = [
  {
    path: '/:lng',
    element: 'base/Layout',
    children: [
      // ... 其他路由
      {
        path: 'users',
        element: 'users/UserListPage',
        meta: {
          title: i18nKeys.PAGE_USERS_TITLE,
          requiresAuth: true, // 需要登录
          category: 'main'
        }
      }
    ]
  }
];
```

### 7. 实现页面组件

```typescript
// pages/users/UserListPage.tsx

import { useEffect, useState } from 'react';
import { Table, Input, Button, Avatar, Space } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useIOC } from '@/uikit/hooks/useIOC';
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { useAppTranslation } from '@/uikit/hooks/useAppTranslation';
import { IOCIdentifier } from '@config/IOCIdentifier';
import * as i18nKeys from '@config/Identifier/pages/page.users';
import type { UserInfo } from '@/base/port/UserServiceInterface';

export default function UserListPage() {
  // 1. 获取服务
  const userService = useIOC(IOCIdentifier.UserServiceInterface);
  const routeService = useIOC(IOCIdentifier.RouteServiceInterface);
  const { t } = useAppTranslation();

  // 2. 订阅状态
  const users = useStore(userService, userService.selector.users);
  const loading = useStore(userService, userService.selector.loading);
  const total = useStore(userService, userService.selector.total);
  const page = useStore(userService, userService.selector.page);
  const pageSize = useStore(userService, userService.selector.pageSize);

  // 3. 本地状态
  const [keyword, setKeyword] = useState('');

  // 4. 初始化加载
  useEffect(() => {
    userService.fetchUsers({ page: 1, pageSize: 10 });
  }, []);

  // 5. 事件处理
  const handleSearch = () => {
    userService.searchUsers(keyword);
  };

  const handleRefresh = () => {
    userService.refreshUsers();
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    userService.fetchUsers({ page: newPage, pageSize: newPageSize, keyword });
  };

  const handleViewDetail = (userId: string) => {
    routeService.push(`/users/${userId}`);
  };

  // 6. 表格列配置
  const columns = [
    {
      title: t(i18nKeys.PAGE_USERS_COLUMN_AVATAR),
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) => <Avatar src={avatar} />
    },
    {
      title: t(i18nKeys.PAGE_USERS_COLUMN_NAME),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t(i18nKeys.PAGE_USERS_COLUMN_EMAIL),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: t(i18nKeys.PAGE_USERS_COLUMN_ROLE),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => t(`common.role.${role}`)
    },
    {
      title: t(i18nKeys.PAGE_USERS_COLUMN_ACTIONS),
      key: 'actions',
      render: (_: any, record: UserInfo) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
        >
          {t(i18nKeys.PAGE_USERS_VIEW_DETAIL)}
        </Button>
      )
    }
  ];

  // 7. 渲染
  return (
    <div className="p-6">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold mb-4">
        {t(i18nKeys.PAGE_USERS_TITLE)}
      </h1>

      {/* 搜索栏 */}
      <div className="mb-4 flex gap-2">
        <Input.Search
          placeholder={t(i18nKeys.PAGE_USERS_SEARCH_PLACEHOLDER)}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          {t(i18nKeys.PAGE_USERS_REFRESH)}
        </Button>
      </div>

      {/* 用户表格 */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: handlePageChange,
          showSizeChanger: true,
          showTotal: (total) => `${t('common.total')} ${total} ${t('common.items')}`
        }}
        locale={{
          emptyText: t(i18nKeys.PAGE_USERS_EMPTY)
        }}
      />
    </div>
  );
}
```

### 8. 注册到 IOC（如果是新服务）

```typescript
// core/clientIoc/ClientIOCRegister.ts

export class ClientIOCRegister {
  protected registerImplement(ioc: IOCContainerInterface): void {
    // ... 其他服务注册

    // 注册 UserService
    ioc.bind(IOCIdentifier.UserServiceInterface, ioc.get(UserService));
  }
}
```

### 9. 编写测试

```typescript
// __tests__/src/base/services/UserService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/base/services/UserService';

describe('UserService', () => {
  let userService: UserService;
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      getUserList: vi.fn()
    };

    userService = new UserService(mockApi);
  });

  it('should fetch users and update state', async () => {
    const mockResponse = {
      list: [
        {
          id: '1',
          name: 'John',
          email: 'john@example.com',
          avatar: '',
          role: 'user'
        }
      ],
      total: 1,
      page: 1,
      pageSize: 10
    };

    mockApi.getUserList.mockResolvedValue(mockResponse);

    const states: any[] = [];
    userService.subscribe((state) => states.push({ ...state }));

    await userService.fetchUsers({ page: 1, pageSize: 10 });

    // 验证状态变化
    expect(states).toHaveLength(2);
    expect(states[0].loading).toBe(true);
    expect(states[1].loading).toBe(false);
    expect(states[1].users).toEqual(mockResponse.list);
    expect(states[1].total).toBe(1);
  });

  it('should handle error when fetch fails', async () => {
    mockApi.getUserList.mockRejectedValue(new Error('Network error'));

    await userService.fetchUsers({ page: 1, pageSize: 10 });

    expect(userService.getState().error).toBeTruthy();
    expect(userService.getState().loading).toBe(false);
  });
});
```

```typescript
// __tests__/src/pages/users/UserListPage.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserListPage from '@/pages/users/UserListPage';
import { IOCProvider } from '@/uikit/contexts/IOCContext';

describe('UserListPage', () => {
  it('should display user list', async () => {
    const mockUsers = [
      {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        avatar: '',
        role: 'user'
      }
    ];

    const mockUserService = {
      fetchUsers: vi.fn(),
      searchUsers: vi.fn(),
      refreshUsers: vi.fn(),
      subscribe: vi.fn(),
      getState: () => ({ users: mockUsers, loading: false, total: 1 }),
      selector: {
        users: (state: any) => state.users,
        loading: (state: any) => state.loading,
        total: (state: any) => state.total
      }
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
      if (identifier === 'RouteServiceInterface') return { push: vi.fn() };
    };

    render(
      <IOCProvider value={mockIOC}>
        <UserListPage />
      </IOCProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('should search users when search button clicked', async () => {
    const mockUserService = {
      fetchUsers: vi.fn(),
      searchUsers: vi.fn(),
      subscribe: vi.fn(),
      getState: () => ({ users: [], loading: false }),
      selector: {
        users: () => [],
        loading: () => false,
        total: () => 0
      }
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
      if (identifier === 'RouteServiceInterface') return { push: vi.fn() };
    };

    render(
      <IOCProvider value={mockIOC}>
        <UserListPage />
      </IOCProvider>
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    expect(mockUserService.searchUsers).toHaveBeenCalledWith('John');
  });
});
```

---

## 🎬 常见场景

### 场景 1：添加一个新按钮功能

假设要在用户列表页添加"批量删除"功能：

```typescript
// 1. 添加 i18n Key
/**
 * @description Delete selected users
 * @localZh 删除选中用户
 * @localEn Delete Selected
 */
export const PAGE_USERS_DELETE_SELECTED = 'page.users.deleteSelected';

// 2. 在服务中添加方法
@injectable()
export class UserService extends UserServiceInterface {
  async deleteUsers(userIds: string[]): Promise<void> {
    try {
      this.emit({ ...this.state, loading: true });
      await this.api.deleteUsers(userIds);
      await this.refreshUsers();  // 刷新列表
    } catch (error) {
      this.emit({ ...this.state, loading: false, error: error as Error });
    }
  }
}

// 3. 在页面中使用
function UserListPage() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const handleDelete = async () => {
    await userService.deleteUsers(selectedRowKeys);
    setSelectedRowKeys([]);
  };

  return (
    <div>
      <Button
        danger
        onClick={handleDelete}
        disabled={selectedRowKeys.length === 0}
      >
        {t(i18nKeys.PAGE_USERS_DELETE_SELECTED)}
      </Button>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        // ...
      />
    </div>
  );
}
```

### 场景 2：添加一个弹窗表单

假设要添加"编辑用户"弹窗：

```typescript
// 1. 创建弹窗组件
// components/UserEditModal.tsx
interface UserEditModalProps {
  user: UserInfo | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (user: UserInfo) => void;
}

export function UserEditModal({ user, visible, onClose, onSubmit }: UserEditModalProps) {
  const [form] = Form.useForm();
  const { t } = useAppTranslation();

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      title={t(i18nKeys.PAGE_USERS_EDIT_TITLE)}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t(i18nKeys.PAGE_USERS_FORM_NAME)}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label={t(i18nKeys.PAGE_USERS_FORM_EMAIL)}
          rules={[{ required: true, type: 'email' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

// 2. 在服务中添加更新方法
@injectable()
export class UserService extends UserServiceInterface {
  async updateUser(userId: string, data: Partial<UserInfo>): Promise<void> {
    this.emit({ ...this.state, loading: true });
    await this.api.updateUser(userId, data);
    await this.refreshUsers();
  }
}

// 3. 在页面中使用
function UserListPage() {
  const [editUser, setEditUser] = useState<UserInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleEdit = (user: UserInfo) => {
    setEditUser(user);
    setModalVisible(true);
  };

  const handleSubmit = async (values: UserInfo) => {
    await userService.updateUser(editUser!.id, values);
    setModalVisible(false);
    setEditUser(null);
  };

  return (
    <div>
      <Table
        columns={[
          // ...
          {
            title: 'Actions',
            render: (_, record) => (
              <Button onClick={() => handleEdit(record)}>Edit</Button>
            )
          }
        ]}
        // ...
      />

      <UserEditModal
        user={editUser}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

### 场景 3：添加实时搜索

假设要实现"输入时自动搜索"：

```typescript
function UserListPage() {
  const [keyword, setKeyword] = useState('');

  // 使用 debounce 优化搜索
  const debouncedKeyword = useDebounce(keyword, 500);

  useEffect(() => {
    if (debouncedKeyword !== undefined) {
      userService.searchUsers(debouncedKeyword);
    }
  }, [debouncedKeyword]);

  return (
    <Input
      placeholder={t(i18nKeys.PAGE_USERS_SEARCH_PLACEHOLDER)}
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
    />
  );
}

// 自定义 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 📐 代码规范

### 1. 命名规范

```typescript
// ✅ 好的命名
const userService = useIOC('UserServiceInterface'); // 服务：小驼峰
const UserListPage = () => {
  /* ... */
}; // 组件：大驼峰
const PAGE_USERS_TITLE = 'page.users.title'; // 常量：大写下划线
interface UserInfo {
  /* ... */
} // 接口：大驼峰
type UserRole = 'admin' | 'user'; // 类型：大驼峰

// ❌ 不好的命名
const UserService = useIOC('UserServiceInterface'); // 应该是小驼峰
const userListPage = () => {
  /* ... */
}; // 组件应该大驼峰
const pageUsersTitle = 'page.users.title'; // 常量应该大写
interface userInfo {
  /* ... */
} // 接口应该大驼峰
```

### 2. 文件组织

```typescript
// ✅ 好的文件组织
import { FC, useEffect, useState } from 'react'; // React
import { Button, Table, Input } from 'antd'; // 第三方 UI
import { useIOC } from '@/uikit/hooks/useIOC'; // 项目内部
import { useAppTranslation } from '@/uikit/hooks/useAppTranslation';
import * as i18nKeys from '@config/Identifier/pages/page.users';
import './UserListPage.css'; // 样式

// 类型定义
interface Props {
  /* ... */
}

// 组件
export default function UserListPage() {
  /* ... */
}

// ❌ 不好的文件组织
import './UserListPage.css'; // 样式不应该在最前
import * as i18nKeys from '@config/Identifier/pages/page.users';
import { Button } from 'antd';
import { useIOC } from '@/uikit/hooks/useIOC';
import { FC } from 'react';
```

### 3. 组件结构

```typescript
// ✅ 好的组件结构
export default function UserListPage() {
  // 1. Hooks
  const userService = useIOC('UserServiceInterface');
  const { t } = useAppTranslation();

  // 2. 状态
  const users = useStore(userService, userService.selector.users);
  const [keyword, setKeyword] = useState('');

  // 3. 副作用
  useEffect(() => {
    userService.fetchUsers({ page: 1, pageSize: 10 });
  }, []);

  // 4. 事件处理
  const handleSearch = () => {
    userService.searchUsers(keyword);
  };

  // 5. 渲染函数
  const renderActions = (record: UserInfo) => {
    return <Button onClick={() => handleEdit(record)}>Edit</Button>;
  };

  // 6. 返回 JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### 4. 注释规范

```typescript
/**
 * 用户列表页面
 *
 * @description 显示用户列表，支持搜索、分页、查看详情等功能
 */
export default function UserListPage() {
  /**
   * 处理搜索
   * 根据关键词搜索用户
   */
  const handleSearch = () => {
    userService.searchUsers(keyword);
  };

  // 初始化加载用户列表
  useEffect(() => {
    userService.fetchUsers({ page: 1, pageSize: 10 });
  }, []);

  return (
    <div>
      {/* 搜索栏 */}
      <Input.Search onSearch={handleSearch} />

      {/* 用户表格 */}
      <Table dataSource={users} />
    </div>
  );
}
```

---

## 🛠️ 开发工具

### 推荐的 VSCode 插件

```
✅ ESLint - 代码检查
✅ Prettier - 代码格式化
✅ TypeScript Vue Plugin (Volar) - Vue/React 支持
✅ Tailwind CSS IntelliSense - Tailwind 智能提示
✅ i18n Ally - i18n 管理
✅ GitLens - Git 增强
✅ Error Lens - 错误提示
✅ Auto Rename Tag - 标签自动重命名
```

### 快捷命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run dev:staging      # 启动测试环境

# 构建
npm run build            # 生产构建
npm run preview          # 预览构建结果

# 代码检查
npm run lint             # ESLint 检查
npm run lint:fix         # ESLint 自动修复
npm run type-check       # TypeScript 类型检查

# 测试
npm run test             # 运行测试
npm run test:watch       # 监听模式测试
npm run test:coverage    # 测试覆盖率

# i18n
npm run i18n:generate    # 生成翻译文件
```

### 调试技巧

```typescript
// 1. 使用 logger
import { logger } from '@/core/globals';

logger.debug('User data:', user);
logger.error('Failed to fetch users:', error);

// 2. 使用 React DevTools
// 安装 React Developer Tools 浏览器插件

// 3. 使用 Redux DevTools（如果需要）
// 查看 Store 状态变化

// 4. 使用 VSCode 断点调试
// 在代码行左侧点击设置断点，然后 F5 启动调试
```

---

## 🎯 开发 Checklist

### 功能开发

- [ ] 定义 i18n Key
- [ ] 定义接口和类型
- [ ] 实现 API 适配器（如果需要）
- [ ] 实现服务
- [ ] 配置路由
- [ ] 实现页面组件
- [ ] 注册到 IOC（如果是新服务）
- [ ] 功能自测

### 代码质量

- [ ] 通过 ESLint 检查
- [ ] 通过 TypeScript 类型检查
- [ ] 代码格式化（Prettier）
- [ ] 移除 console.log 和调试代码
- [ ] 移除未使用的导入

### 测试

- [ ] 编写服务测试
- [ ] 编写 UI 测试
- [ ] 测试覆盖率 > 80%
- [ ] 所有测试通过

### 文档

- [ ] 更新相关文档
- [ ] 添加必要的代码注释
- [ ] 更新 API 文档（如果有）

### 提交

- [ ] Git commit 符合规范
- [ ] 代码已 review
- [ ] 合并到主分支

---

## 📚 相关文档

- **[项目架构设计](./index.md)** - 了解整体架构
- **[IOC 容器](./ioc.md)** - 依赖注入和 UI 分离
- **[Store 状态管理](./store.md)** - 应用层如何通知 UI 层
- **[Bootstrap 启动器](./bootstrap.md)** - 应用启动和初始化
- **[环境变量管理](./env.md)** - 多环境配置
- **[国际化](./i18n.md)** - i18n Key 和翻译管理

---

**问题反馈：**  
如果你在开发过程中遇到任何问题，请在团队频道中讨论或提交 Issue。
