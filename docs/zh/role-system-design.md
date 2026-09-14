# next-oauth / PAM 角色 · 机构（完整方案 · 已拍板）

> **状态：已决定 — 完整模型 = 系统角色 + 机构 + 资源 ACL**  
> **产品口径：机构 = 公司 / 组织 / 工作空间（只保留这一层容器；不再另做嵌套「组」）**  
> **范围：** fe-base `examples/next-oauth` 模板先落地 → PAM 兼容迁移 → 回灌 fe-base  
> **性能：** 热路径 JWT + 内存权限，不靠砍功能。

### 分支策略（已定）

| 项 | 决定 |
| --- | --- |
| 集成分支 | **`feat/role-system`**（长期存在，直到完整 role 可合主线） |
| 开发方式 | 所有 role / 机构相关改动 **向该分支合并**（子 PR → `feat/role-system`，最后再合 `master`） |
| 仓库 | **fe-base**（模板 next-oauth 实现）与 **brain-toolkit**（设计文档 + 后续 PAM）各自同名分支 |
| 范围 | 该分支只做**完整 role 体系**；不往里面塞无关需求 |

---

## 0. 完整模型（产品层）

```
平台（本站）
 └─ 系统角色 system_role: user | operator | admin
      └─ 能否进全局 Admin、管全站用户等

机构 Organization（公司 / 租户 / 工作空间）—— 唯一的成员容器
 └─ 机构成员 + 机构角色: org_owner | org_admin | org_member
      └─（PAM 等）资源 ACL：项目 owner/admin/member … 仍独立
```

**系统管理员 ≠ 机构管理员 ≠ 某个项目成员。**  
产品上说的「组 / 公司 / 机构」统一叫 **机构**，只做这一层。

---

## 1. 产品决定

| 议题 | 决定 |
| --- | --- |
| 组 vs 机构 | **同一产品概念，只保留「机构」** |
| 要不要机构下再套部门/小组 | **本期不做**（完整 role 不依赖嵌套组） |
| 完整 = 可视化权限编辑器 / Casbin | **不需要** |
| 完整 = 每请求查库算权限 | **禁止** |

实现可按 PR 切片，但 schema / 鉴权 API 按本文一次定死。

---

## 2. 两层角色 + 资源 ACL

### 2.1 系统角色（全局）

| 角色 | 职责 |
| --- | --- |
| `user` | 默认登录用户 |
| `operator` | 全局只读后台（用户列表、审计） |
| `admin` | 平台管理员（改系统角色、跨机构超管等） |

一人一个 `system_role`（用户档案字段即可）。

| Permission | user | operator | admin |
| --- | --- | --- | --- |
| `admin.access` | | ✓ | ✓ |
| `users.read` | | ✓ | ✓ |
| `users.write` | | | ✓ |
| `orgs.manage`（跨机构超管） | | | ✓ |
| `audit.read` | | ✓ | ✓ |

登录用户可「创建自己的机构」（只需已登录），不占用 `orgs.manage`。

### 2.2 机构 Organization

**表：**

- `organizations`：`id, name, slug, status, created_at, …`
- `organization_members`：`org_id, user_id, role, status`  
  - `role`: `org_owner` | `org_admin` | `org_member`  
  - 唯一 `(org_id, user_id)`；同一机构内一人一个机构角色  
  - 用户可属于多个机构；会话有 **当前 `orgId`**

| Permission | member | admin | owner |
| --- | --- | --- | --- |
| `org.read` | ✓ | ✓ | ✓ |
| `org.members.read` | ✓ | ✓ | ✓ |
| `org.members.write` | | ✓ | ✓ |
| `org.settings.write` | | ✓ | ✓ |
| `org.delete` | | | ✓ |

### 2.3 资源 ACL（PAM 项目等）

保持独立：`owner / admin / member`。  
后续项目可挂可选 `org_id`；**机构成员不会自动拥有该机构下所有项目权限**，除非产品另定策略。

---

## 3. 用户心智

```
登录
 ├─ system_role = admin？ → 全站 Admin
 └─ 当前机构 Acme（org_admin）
      ├─ 能管 Acme 成员与设置
      └─ 另：某 PAM 项目里是 member → 只能动该项目
```

---

## 4. 鉴权 API

```ts
assertAuthenticated()
assertPermission('users.write')                   // 系统
assertOrgPermission(orgId, 'org.members.write') // 机构
```

| 页面 | API | Permission |
| --- | --- | --- |
| `/admin/*` | `/api/admin/*` | `admin.access` 等 |
| `/orgs/[orgId]/members` | `/api/orgs/:orgId/members` | `org.members.*` |

前端菜单可用 session permissions；**安全以后端为准**。页面与 API 同一套权限码。

---

## 5. 高性能会话

### 5.1 JWT（瘦）

```ts
{
  userId: string
  roles: ['user' | 'operator' | 'admin']
  orgId?: string
  orgRole?: 'org_owner' | 'org_admin' | 'org_member'
  rv: number  // 系统角色或机构成员变更则 +1
}
```

- 不把全量 `permissions[]` 写入 Cookie。  
- 权限用代码表内存展开。

### 5.2 热路径

验签 → 内存 `hasPermission` / `hasOrgPermission` → **零 DB**。

### 5.3 写路径

登录、切换机构、`refreshSession`：读 DB → 重签 JWT。  
改系统角色 / 机构角色 / 移出机构：`rv++` 并 refresh 被影响用户 session。

---

## 6. Session 响应

```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "capabilities": {
    "roles": ["user"],
    "permissions": [],
    "orgId": "...",
    "orgRole": "org_admin",
    "orgPermissions": ["org.read", "org.members.write", "org.settings.write", "..."],
    "platformAdmin": false
  },
  "organizations": [{ "id": "...", "name": "Acme", "role": "org_admin" }]
}
```

---

## 7. 落地顺序（全部合入 `feat/role-system`）

### 切片 A — 数据与核心库

- [ ] `system_role`  
- [ ] `organizations` + `organization_members`  
- [ ] `RoleService` / `OrgService` + 权限映射  
- [ ] JWT 声明与 `refreshSession`

### 切片 B — 闸门

- [ ] 页面路径权限表  
- [ ] `RequirePermission` / `RequireOrgPermission`

### 切片 C — 模板 UI

- [ ] Admin：改系统角色  
- [ ] 机构：成员与角色  
- [ ] 当前机构切换  

### 切片 D — PAM

- [ ] `is_platform_admin` → `system_role=admin` 双读迁移  
- [ ] 机构接入；项目 ACL 保留  

### 切片 E — 回灌共享约定 → 集成分支收齐后合主线

---

## 8. 明确不做

- 机构下再套「组 / 部门」嵌套（产品已合并为机构）  
- 权限矩阵可视化编辑器、Casbin  
- OAuth scope / Brain `feature_tags` 当本站权限  
- 每页查库算权限  
- 平台 admin 默认穿透所有机构与项目  
- 用 `UserSchema.role` 的 0/1 继续扩展鉴权  

---

## 9. 对外口径

1. **系统角色**管平台后台  
2. **机构**管公司/租户及机构内管理员与成员（产品上的「组」就是它）  
3. **资源 ACL**（如 PAM 项目）管具体业务资源  
4. **页面和 API 同一套权限**；热路径内存鉴权  

---

*已拍板。集成分支：`feat/role-system`。容器层只保留「机构」。*
