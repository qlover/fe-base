# next-oauth / PAM 角色 · 组织 · 组（完整方案 · 已拍板）

> **状态：已决定 — 完整模型，含系统角色 + 组织 + 组**  
> **范围：** fe-base `examples/next-oauth` 模板先落地 → PAM 兼容迁移 → 回灌 fe-base  
> **澄清：** 「完整」= 模型与能力一次设计齐全（含组），**不是**先砍成简化版。性能靠热路径设计，不靠砍功能。

### 分支策略（已定）

| 项 | 决定 |
| --- | --- |
| 集成分支 | **`feat/role-system`**（长期存在，直到完整 role 可合主线） |
| 开发方式 | 所有 role / org / group 相关改动 **向该分支合并**（子 PR → `feat/role-system`，最后再合 `master`） |
| 仓库 | **fe-base**（模板 next-oauth 实现）与 **brain-toolkit**（设计文档 + 后续 PAM）各自建同名分支，按依赖顺序推进 |
| 范围 | 该分支只做**完整 role 体系**；不往里面塞无关需求 |

---

## 0. 完整模型长什么样

```
平台（本站）
 └─ 系统角色 system_role: user | operator | admin
      └─ 决定：能否进全局 Admin、管全站用户等

组织 Organization（公司 / 租户）
 └─ 组织成员 + 组织角色: org_owner | org_admin | org_member
      └─ 组 Group（团队 / 部门，隶属于某个组织）
           └─ 组成员 + 组角色: group_admin | group_member
                └─（PAM 等）资源 ACL：项目 owner/admin/member … 仍独立
```

这就是常见 SaaS 的完整结构：**系统管理员 ≠ 公司管理员 ≠ 小组管理员 ≠ 某个项目成员**。

---

## 1. 先前表述的纠正

| 误解 | 正确决定 |
| --- | --- |
| 「完整 role」却把组推到二期 | **组是完整模型的一部分，第一期就要有** |
| 完整 = 一上来做权限可视化编辑器 / Casbin | **不需要**；完整指角色/组织/组/鉴权面齐，不是堆引擎 |
| 完整 = 每请求查库算权限 | **禁止**；完整与高性能同时成立（见 §5） |

实现可以按 PR 拆步（先表结构与服务，再 UI），但 **schema 与鉴权 API 按完整模型一次定死**，避免以后推翻。

---

## 2. 三层 + 资源层（全部要做）

### 2.1 系统角色（全局）

| 角色 | 职责 |
| --- | --- |
| `user` | 默认登录用户 |
| `operator` | 全局只读后台（用户列表、审计） |
| `admin` | 平台管理员（改系统角色、跨组织超管等） |

第一期：**一人一个** `system_role`（字段即可）。多系统角色若以后需要，再加绑定表，不挡完整组织/组模型。

系统权限（代码映射，完整第一批）：

| Permission | user | operator | admin |
| --- | --- | --- | --- |
| `admin.access` | | ✓ | ✓ |
| `users.read` | | ✓ | ✓ |
| `users.write` | | | ✓ |
| `orgs.manage`（跨组织超管） | | | ✓ |
| `audit.read` | | ✓ | ✓ |

登录用户均可「创建自己的组织」（认证即可），不占用 `orgs.manage`。

### 2.2 组织 Organization（公司）

**表：**

- `organizations`：`id, name, slug, status, created_at, …`
- `organization_members`：`org_id, user_id, role, status`  
  - `role`: `org_owner` | `org_admin` | `org_member`  
  - 唯一 `(org_id, user_id)`；一人在同一组织内**一个**组织角色  
  - 用户可属于**多个**组织；会话有 **当前 `orgId`**

组织权限（代码映射）：

| Permission | member | admin | owner |
| --- | --- | --- | --- |
| `org.read` | ✓ | ✓ | ✓ |
| `org.members.read` | ✓ | ✓ | ✓ |
| `org.members.write` | | ✓ | ✓ |
| `org.groups.write`（创建/删组、改组设置） | | ✓ | ✓ |
| `org.settings.write` | | ✓ | ✓ |
| `org.delete` | | | ✓ |

### 2.3 组 Group（完整模型必含）

组**必须**属于某个组织：`groups.org_id`。

**表：**

- `groups`：`id, org_id, name, slug, status, created_at, …`
- `group_members`：`group_id, user_id, role, status`  
  - `role`: `group_admin` | `group_member`  
  - 唯一 `(group_id, user_id)`

**规则（已定）：**

1. 进组的前提：该用户必须已是该组织的 **active** 成员（否则不能加入组）。  
2. 组不能跨组织。  
3. `org_owner` / `org_admin` **默认具备**对该组织下所有组的管理能力（通过 `org.groups.write` + 服务端校验），不必把他们逐个加进每个组。  
4. 普通 `org_member` 只对**自己所在组**有组权限。  
5. 组权限与组织权限分离：组管理员不能改组织级成员，除非同时也是 `org_admin`。

组权限（代码映射）：

| Permission | group_member | group_admin |
| --- | --- | --- |
| `group.read` | ✓ | ✓ |
| `group.members.read` | ✓ | ✓ |
| `group.members.write` | | ✓ |
| `group.settings.write` | | ✓ |

### 2.4 资源 ACL（PAM 项目等）

保持独立：`owner / admin / member`。  
后续项目可挂 `org_id`（可选再挂 `group_id` 做默认可见范围），**不**用组角色自动替代项目协作，除非产品显式加策略。

---

## 3. 用户心智（完整）

```
登录
 ├─ system_role = admin？ → 全站 Admin
 └─ 当前组织 Acme（org_admin）
      ├─ 能管 Acme 成员、建组
      └─ 组「支付组」(group_member)
           └─ 能看组、不能改组成员
                └─ 另：某 PAM 项目里是 member → 只能动该项目
```

---

## 4. 鉴权 API 表面（完整）

统一入口，禁止满地 `if (isAdmin)`：

```ts
assertAuthenticated()
assertPermission('users.write')                    // 系统
assertOrgPermission(orgId, 'org.members.write')  // 组织（含：当前用户在该 org 的角色）
assertGroupPermission(groupId, 'group.members.write')
// 内部：org_admin 对组管理走 org.groups.write 短路；否则查 group_members
```

页面与 API **同一 permission 名**：

| 页面 | API | Permission |
| --- | --- | --- |
| `/admin/*` | `/api/admin/*` | `admin.access` 等 |
| `/orgs/[orgId]/members` | `/api/orgs/:orgId/members` | `org.members.*` |
| `/orgs/[orgId]/groups/[groupId]` | `/api/groups/:groupId/*` | `group.*` 或 org 管理短路 |

前端菜单用 session 的 permissions；**安全以后端为准**。

---

## 5. 完整且高性能（热路径）

### 5.1 JWT（瘦，但信息够用）

```ts
{
  userId: string
  roles: ['user' | 'operator' | 'admin']   // 系统，长度 1
  orgId?: string
  orgRole?: 'org_owner' | 'org_admin' | 'org_member'
  /** 当前组织下的组摘要；通常几十条内，可接受 */
  groups?: { id: string; role: 'group_admin' | 'group_member' }[]
  rv: number  // 系统角色 / 组织成员 / 组成员 任一变更则 +1
}
```

- **不写**全量 permission 字符串列表进 Cookie。  
- Permission 用代码表在内存展开（系统 / 组织 / 组三套映射）。

### 5.2 热路径（middleware / 多数 API）

1. 验签  
2. 内存判断 `hasPermission` / `hasOrgPermission` / `hasGroupPermission`（组：先看 org 管理短路，再看 `groups[]`）  
3. **零 DB**

### 5.3 写路径 / 刷新

登录、切换组织、`refreshSession`：从 DB 装载角色 + 当前组织下组列表 → 重签 JWT。  
改系统角色、组织角色、组成员：`rv++` 并 **refresh 被影响用户的 session**（模板提供 `refreshSession`）。

若单组织下组数量极大（成百上千）再优化为「JWT 不带全量 groups、改短缓存」；**默认完整方案带当前组织的 groups 摘要**，模板与早期 PAM 足够。

---

## 6. Session 响应形状（完整）

```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "capabilities": {
    "roles": ["user"],
    "permissions": [],
    "orgId": "...",
    "orgRole": "org_admin",
    "orgPermissions": ["org.read", "org.members.write", "org.groups.write", "..."],
    "groups": [{ "id": "...", "name": "支付组", "role": "group_member" }],
    "platformAdmin": false
  },
  "organizations": [{ "id": "...", "name": "Acme", "role": "org_admin" }]
}
```

---

## 7. 落地顺序（完整模型；全部合入 `feat/role-system`）

子 PR 都开向 **`feat/role-system`**，合完再考虑进 `master`。

### 切片 A — 数据与核心库（一次建齐表）

- [ ] `system_role`  
- [ ] `organizations` + `organization_members`  
- [ ] `groups` + `group_members`  
- [ ] `RoleService` / `OrgService` / `GroupService` + 三套权限映射  
- [ ] JWT 声明与 `refreshSession`

### 切片 B — 闸门

- [ ] 页面路径权限表  
- [ ] `RequirePermission` / `RequireOrgPermission` / `RequireGroupPermission`

### 切片 C — 模板 UI

- [ ] Admin：改系统角色  
- [ ] 组织：成员与角色  
- [ ] 组：创建组、组成员与角色  
- [ ] 当前组织切换  

### 切片 D — PAM（brain-toolkit `feat/role-system`）

- [ ] `is_platform_admin` → `system_role=admin` 双读迁移  
- [ ] 组织/组接入；项目 ACL 保留  

### 切片 E — 回灌共享约定 / 小模块 → 集成分支收齐后合主线

---

## 8. 明确不做（避免假「完整」）

这些**不是**完整 RBAC 的必要部分，本期不做：

- 权限矩阵可视化编辑器、Casbin 策略引擎  
- OAuth scope / Brain `feature_tags` 当本站权限  
- 每页查库算权限  
- 平台 admin 默认穿透所有组织/组/项目  
- 用 `UserSchema.role` 的 0/1 继续扩展  

**组、组织、系统角色 —— 要做，且算在完整方案内。**

---

## 9. 产品口径（你对外可以这么说）

我们做的是一套**完整**的角色体系：

1. **系统角色**管平台后台  
2. **组织**管公司/租户与公司级管理员  
3. **组**管公司下的团队/部门与组内管理员  
4. **资源 ACL**（如 PAM 项目）管具体业务资源  
5. **页面和 API 同一套权限**；热路径内存鉴权，保证性能  

---

*已拍板。长期集成分支：`feat/role-system`。实现以 next-oauth 模板为准，表结构按 §2 一次建齐，子 PR 合入集成分支，范围不降级。*
