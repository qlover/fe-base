# Development Guide

> **📖 This document provides a complete page development workflow and practical guide to help you quickly get started with project development.**

## 📋 Table of Contents

- [What's Needed to Develop a Page](#-whats-needed-to-develop-a-page)
- [Complete Development Workflow](#-complete-development-workflow)
- [Practical Example: User List Page](#-practical-example-user-list-page)
- [Common Scenarios](#-common-scenarios)
- [Code Standards](#-code-standards)
- [Development Tools](#-development-tools)

---

## 🎯 What's Needed to Develop a Page

### Core Checklist

A complete page typically requires the following components:

```
✅ 1. Interface Definition (Port)      - base/port/XxxServiceInterface.ts
✅ 2. Service Implementation           - base/services/XxxService.ts
✅ 3. API Adapter (Optional)           - base/apis/xxxApi/XxxApi.ts
✅ 4. Route Configuration              - config/app.router.ts
✅ 5. i18n Text Definition             - config/Identifier/pages/page.xxx.ts
✅ 6. Page Component                   - pages/xxx/XxxPage.tsx
✅ 7. IOC Registration (New Services)  - core/clientIoc/ClientIOCRegister.ts
✅ 8. Test Files                       - __tests__/src/pages/xxx/XxxPage.test.tsx
```

### Dependency Diagram

```
┌─────────────────────────────────────────┐
│  Route Configuration (app.router.ts)    │
│  Define page paths and metadata         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Page Component (XxxPage.tsx)           │
│  - Use useIOC to get services           │
│  - Use useStore to subscribe to state   │
│  - Use useAppTranslation for i18n       │
│  - Handle UI rendering & interactions   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Service Layer (XxxService.ts)          │
│  - Implement business logic             │
│  - Extend StoreInterface                │
│  - Dependency injection                 │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Interface Definition (XxxServiceInterface.ts) │
│  - Define service contract              │
│  - Easy to test and mock                │
└─────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  API Adapter (XxxApi.ts)                │
│  - Encapsulate HTTP requests            │
│  - Transform data formats               │
└─────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  i18n Text (page.xxx.ts)                │
│  - Define all text keys for page        │
│  - Auto-generate translation files      │
└─────────────────────────────────────────┘
```

---

## 🚀 Complete Development Workflow

### Workflow Diagram

```
📝 1. Requirements Analysis
   ├── Determine page features
   ├── Determine data sources (API)
   └── Determine interaction logic
       ↓
🎨 2. Define i18n Keys
   ├── Page titles, button text, etc.
   └── Error messages, success messages, etc.
       ↓
🔌 3. Define Interfaces (Port)
   ├── Service interfaces
   └── Data types
       ↓
⚙️ 4. Implement Service
   ├── Extend StoreInterface
   ├── Implement business logic
   └── Dependency injection
       ↓
🌐 5. Implement API Adapter (if needed)
   ├── Encapsulate HTTP requests
   └── Data transformation
       ↓
🗺️ 6. Configure Routes
   ├── Add route configuration
   └── Set metadata
       ↓
🎭 7. Implement Page Component
   ├── Use useIOC to get services
   ├── Use useStore to subscribe to state
   └── Implement UI rendering
       ↓
🔗 8. Register to IOC (if new service)
   └── Register in ClientIOCRegister
       ↓
🧪 9. Write Tests
   ├── Service tests (logic)
   ├── UI tests (rendering)
   └── Integration tests (workflow)
       ↓
✅ 10. Self-test and Submit
   ├── Feature testing
   ├── Code review
   └── Submit PR
```

---

## 📚 Practical Example: User List Page

Let's assume we want to develop a user list page with the following features:

- Display user list
- Search users
- Pagination
- View user details

### 1. Requirements Analysis

**Feature List:**

- 📄 Display user list (avatar, name, email, role)
- 🔍 Search users (by name)
- 📃 Pagination (10 items per page)
- 👁️ View details (click to navigate to detail page)
- 🔄 Refresh list

**Data Source:**

- API: `GET /api/users?page=1&pageSize=10&keyword=xxx`

### 2. Define i18n Keys

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

### 3. Define Interfaces and Types

```typescript
// base/port/UserServiceInterface.ts

import { StoreInterface } from '@qlover/corekit-bridge';

/**
 * User information
 */
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
}

/**
 * User list query parameters
 */
export interface UserListParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

/**
 * User list response
 */
export interface UserListResponse {
  list: UserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * User service state
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
 * User service interface
 */
export abstract class UserServiceInterface extends StoreInterface<UserServiceState> {
  /**
   * Fetch user list
   */
  abstract fetchUsers(params: UserListParams): Promise<void>;

  /**
   * Search users
   */
  abstract searchUsers(keyword: string): Promise<void>;

  /**
   * Refresh list
   */
  abstract refreshUsers(): Promise<void>;

  /**
   * Selectors
   */
  abstract selector: {
    users: (state: UserServiceState) => UserInfo[];
    loading: (state: UserServiceState) => boolean;
    total: (state: UserServiceState) => number;
  };
}
```

### 4. Implement API Adapter

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
   * Get user list
   */
  async getUserList(params: UserListParams): Promise<UserListResponse> {
    const response = await this.http.get('/api/users', { params });

    // Transform backend data format
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

### 5. Implement Service

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
    // Initialize state
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
   * Selectors
   */
  selector = {
    users: (state: UserServiceState) => state.users,
    loading: (state: UserServiceState) => state.loading,
    total: (state: UserServiceState) => state.total,
    page: (state: UserServiceState) => state.page,
    pageSize: (state: UserServiceState) => state.pageSize
  };

  /**
   * Fetch user list
   */
  async fetchUsers(params: UserListParams): Promise<void> {
    try {
      // 1. Set loading state
      this.emit({ ...this.state, loading: true, error: null });

      // 2. Call API
      const response = await this.api.getUserList(params);

      // 3. Update state
      this.emit({
        users: response.list,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        loading: false,
        error: null
      });
    } catch (error) {
      // 4. Error handling
      this.emit({
        ...this.state,
        loading: false,
        error: error as Error
      });
    }
  }

  /**
   * Search users
   */
  async searchUsers(keyword: string): Promise<void> {
    await this.fetchUsers({
      page: 1,
      pageSize: this.state.pageSize,
      keyword
    });
  }

  /**
   * Refresh list
   */
  async refreshUsers(): Promise<void> {
    await this.fetchUsers({
      page: this.state.page,
      pageSize: this.state.pageSize
    });
  }
}
```

### 6. Configure Routes

```typescript
// config/app.router.ts

import * as i18nKeys from './Identifier/pages/page.users';

export const baseRoutes: RouteConfigValue[] = [
  {
    path: '/:lng',
    element: 'base/Layout',
    children: [
      // ... other routes
      {
        path: 'users',
        element: 'users/UserListPage',
        meta: {
          title: i18nKeys.PAGE_USERS_TITLE,
          requiresAuth: true, // Requires authentication
          category: 'main'
        }
      }
    ]
  }
];
```

### 7. Implement Page Component

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
  // 1. Get services
  const userService = useIOC(IOCIdentifier.UserServiceInterface);
  const routeService = useIOC(IOCIdentifier.RouteServiceInterface);
  const { t } = useAppTranslation();

  // 2. Subscribe to state
  const users = useStore(userService, userService.selector.users);
  const loading = useStore(userService, userService.selector.loading);
  const total = useStore(userService, userService.selector.total);
  const page = useStore(userService, userService.selector.page);
  const pageSize = useStore(userService, userService.selector.pageSize);

  // 3. Local state
  const [keyword, setKeyword] = useState('');

  // 4. Initialize loading
  useEffect(() => {
    userService.fetchUsers({ page: 1, pageSize: 10 });
  }, []);

  // 5. Event handlers
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

  // 6. Table column configuration
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

  // 7. Render
  return (
    <div className="p-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold mb-4">
        {t(i18nKeys.PAGE_USERS_TITLE)}
      </h1>

      {/* Search bar */}
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

      {/* User table */}
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

### 8. Register to IOC (if new service)

```typescript
// core/clientIoc/ClientIOCRegister.ts

export class ClientIOCRegister {
  protected registerImplement(ioc: IOCContainerInterface): void {
    // ... other service registrations

    // Register UserService
    ioc.bind(IOCIdentifier.UserServiceInterface, ioc.get(UserService));
  }
}
```

### 9. Write Tests

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

    // Verify state changes
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

## 🎬 Common Scenarios

### Scenario 1: Adding a New Button Feature

Suppose we want to add a "bulk delete" feature to the user list page:

```typescript
// 1. Add i18n Key
/**
 * @description Delete selected users
 * @localZh 删除选中用户
 * @localEn Delete Selected
 */
export const PAGE_USERS_DELETE_SELECTED = 'page.users.deleteSelected';

// 2. Add method to service
@injectable()
export class UserService extends UserServiceInterface {
  async deleteUsers(userIds: string[]): Promise<void> {
    try {
      this.emit({ ...this.state, loading: true });
      await this.api.deleteUsers(userIds);
      await this.refreshUsers(); // Refresh list
    } catch (error) {
      this.emit({ ...this.state, loading: false, error: error as Error });
    }
  }
}

// 3. Use in page
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

### Scenario 2: Adding a Modal Form

Suppose we want to add an "edit user" modal:

```typescript
// 1. Create modal component
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

// 2. Add update method to service
@injectable()
export class UserService extends UserServiceInterface {
  async updateUser(userId: string, data: Partial<UserInfo>): Promise<void> {
    this.emit({ ...this.state, loading: true });
    await this.api.updateUser(userId, data);
    await this.refreshUsers();
  }
}

// 3. Use in page
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

### Scenario 3: Adding Real-time Search

Suppose we want to implement "auto-search while typing":

```typescript
function UserListPage() {
  const [keyword, setKeyword] = useState('');

  // Use debounce to optimize search
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

// Custom Hook
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

## 📐 Code Standards

### 1. Naming Conventions

```typescript
// ✅ Good naming
const userService = useIOC('UserServiceInterface'); // Service: camelCase
const UserListPage = () => {
  /* ... */
}; // Component: PascalCase
const PAGE_USERS_TITLE = 'page.users.title'; // Constant: UPPER_SNAKE_CASE
interface UserInfo {
  /* ... */
} // Interface: PascalCase
type UserRole = 'admin' | 'user'; // Type: PascalCase

// ❌ Bad naming
const UserService = useIOC('UserServiceInterface'); // Should be camelCase
const userListPage = () => {
  /* ... */
}; // Component should be PascalCase
const pageUsersTitle = 'page.users.title'; // Constant should be UPPER_CASE
interface userInfo {
  /* ... */
} // Interface should be PascalCase
```

### 2. File Organization

```typescript
// ✅ Good file organization
import { FC, useEffect, useState } from 'react'; // React
import { Button, Table, Input } from 'antd'; // Third-party UI
import { useIOC } from '@/uikit/hooks/useIOC'; // Internal project
import { useAppTranslation } from '@/uikit/hooks/useAppTranslation';
import * as i18nKeys from '@config/Identifier/pages/page.users';
import './UserListPage.css'; // Styles

// Type definitions
interface Props {
  /* ... */
}

// Component
export default function UserListPage() {
  /* ... */
}

// ❌ Bad file organization
import './UserListPage.css'; // Styles shouldn't be first
import * as i18nKeys from '@config/Identifier/pages/page.users';
import { Button } from 'antd';
import { useIOC } from '@/uikit/hooks/useIOC';
import { FC } from 'react';
```

### 3. Component Structure

```typescript
// ✅ Good component structure
export default function UserListPage() {
  // 1. Hooks
  const userService = useIOC('UserServiceInterface');
  const { t } = useAppTranslation();

  // 2. State
  const users = useStore(userService, userService.selector.users);
  const [keyword, setKeyword] = useState('');

  // 3. Side effects
  useEffect(() => {
    userService.fetchUsers({ page: 1, pageSize: 10 });
  }, []);

  // 4. Event handlers
  const handleSearch = () => {
    userService.searchUsers(keyword);
  };

  // 5. Render functions
  const renderActions = (record: UserInfo) => {
    return <Button onClick={() => handleEdit(record)}>Edit</Button>;
  };

  // 6. Return JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### 4. Comment Standards

```typescript
/**
 * User list page
 *
 * @description Display user list with search, pagination, and view details functionality
 */
export default function UserListPage() {
  /**
   * Handle search
   * Search users by keyword
   */
  const handleSearch = () => {
    userService.searchUsers(keyword);
  };

  // Initialize user list loading
  useEffect(() => {
    userService.fetchUsers({ page: 1, pageSize: 10 });
  }, []);

  return (
    <div>
      {/* Search bar */}
      <Input.Search onSearch={handleSearch} />

      {/* User table */}
      <Table dataSource={users} />
    </div>
  );
}
```

---

## 🛠️ Development Tools

### Recommended VSCode Extensions

```
✅ ESLint - Code linting
✅ Prettier - Code formatting
✅ TypeScript Vue Plugin (Volar) - Vue/React support
✅ Tailwind CSS IntelliSense - Tailwind autocomplete
✅ i18n Ally - i18n management
✅ GitLens - Git enhancement
✅ Error Lens - Error display
✅ Auto Rename Tag - Tag auto-rename
```

### Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:staging      # Start staging environment

# Build
npm run build            # Production build
npm run preview          # Preview build result

# Code quality
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Watch mode testing
npm run test:coverage    # Test coverage

# i18n
npm run i18n:generate    # Generate translation files
```

### Debugging Tips

```typescript
// 1. Use logger
import { logger } from '@/core/globals';

logger.debug('User data:', user);
logger.error('Failed to fetch users:', error);

// 2. Use React DevTools
// Install React Developer Tools browser extension

// 3. Use Redux DevTools (if needed)
// View Store state changes

// 4. Use VSCode breakpoint debugging
// Click on the left side of a code line to set breakpoint, then F5 to start debugging
```

---

## 🎯 Development Checklist

### Feature Development

- [ ] Define i18n Keys
- [ ] Define interfaces and types
- [ ] Implement API adapter (if needed)
- [ ] Implement service
- [ ] Configure routes
- [ ] Implement page component
- [ ] Register to IOC (if new service)
- [ ] Feature self-testing

### Code Quality

- [ ] Pass ESLint check
- [ ] Pass TypeScript type check
- [ ] Code formatting (Prettier)
- [ ] Remove console.log and debug code
- [ ] Remove unused imports

### Testing

- [ ] Write service tests
- [ ] Write UI tests
- [ ] Test coverage > 80%
- [ ] All tests passing

### Documentation

- [ ] Update related documentation
- [ ] Add necessary code comments
- [ ] Update API documentation (if any)

### Submission

- [ ] Git commit follows conventions
- [ ] Code reviewed
- [ ] Merged to main branch

---

## 📚 Related Documentation

- **[Project Architecture Design](./index.md)** - Understand overall architecture
- **[IOC Container](./ioc.md)** - Dependency injection and UI separation
- **[Store State Management](./store.md)** - How application layer notifies UI layer
- **[Bootstrap Initializer](./bootstrap.md)** - Application startup and initialization
- **[Environment Variables](./env.md)** - Multi-environment configuration
- **[Internationalization](./i18n.md)** - i18n Key and translation management

---

**Feedback:**  
If you encounter any problems during development, please discuss in the team channel or submit an Issue.
