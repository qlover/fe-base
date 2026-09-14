# next-oauth / PAM 角色 · 机构（完整方案 · 已拍板）

> **状态：已决定**  
> **产品核心：机构 = 协作容器（PAM 里就是「项目协作」这一层）**  
> **机构角色：`owner` / `admin` / `member`（三种够用；枚举可扩展，首期只实现这三种）**  
> **另有：系统角色（全站后台）—— 与机构协作分开**  
> **分支：** `feat/role-system`（子 PR 合入此分支）

---

## 0. 产品定论（与你对齐）

| 你的观点 | 决定 |
| --- | --- |
| PAM 协作就是一个机构 | **同意**。用户加入「当前机构」= 加入该协作容器 |
| 小机构 / 小团体各自有拥有者、管理员、成员 | **同意**。每个机构独立一席成员表 |
| 三种角色即可，以后可扩展 | **同意**。首期只实现三档；角色字符串预留扩展 |

**不做：** 在 PAM 项目协作之上再叠一套平行的「Organization 表」导致「项目成员」和「机构成员」两套人马。  
**要做：** 概念与权限模型与现有协作对齐；模板（next-oauth）按同一套「机构 + 三角色」实现，再回灌 / 对齐 PAM。

```
平台
 └─ 系统角色：user | operator | admin     → 全站 Admin 等

机构（协作容器）
 └─ PAM：现有「项目」即机构入口
 └─ 模板：organizations（同一语义）
      └─ 成员角色：owner | admin | member
           └─ 权限按角色等级包含：owner ⊃ admin ⊃ member
```

---

## 1. 机构角色（与 PAM 协作对齐）

| 角色 | 含义（产品） | 与现 PAM |
| --- | --- | --- |
| `owner` | 拥有者 | `pam_projects.owner_id`（可继续不放在协作者行里） |
| `admin` | 管理员 | `pam_project_collaborators.role = admin` |
| `member` | 成员 | `pam_project_collaborators.role = member` |

等级：`none < member < admin < owner`（沿用现 `projectAccessRole` 思路）。

**继承（仅此一种）：** 更高机构角色自动具备更低角色的能力（写在代码权限表里），不是「没有权限再回落另一套组」。

**系统角色不与机构角色互转：** 平台 `admin` ≠ 每个机构的 `owner`。

---

## 2. 系统角色（仍然需要，且独立）

机构解决「这个小团体里谁能管人、谁能改资源」；  
全站还要「谁能进平台后台、停用用户」——继续用系统角色：

| 角色 | 职责 |
| --- | --- |
| `user` | 默认 |
| `operator` | 全局只读后台 |
| `admin` | 平台管理员 |

| Permission | user | operator | admin |
| --- | --- | --- | --- |
| `admin.access` | | ✓ | ✓ |
| `users.read` | | ✓ | ✓ |
| `users.write` | | | ✓ |
| `audit.read` | | ✓ | ✓ |

PAM：`is_platform_admin` → 映射为 `system_role = admin`（双读迁移）。

---

## 3. 机构权限（三角色，可扩展）

首期权限表示例（可按产品微调，但角色只有三档）：

| Permission / 能力 | member | admin | owner |
| --- | --- | --- | --- |
| 读机构 / 读资源（按现 PAM：可见性规则） | ✓ | ✓ | ✓ |
| 编辑内容（现 `can_edit`：member+） | ✓ | ✓ | ✓ |
| 管理成员（现 `can_manage_collaborators`：admin+） | | ✓ | ✓ |
| 删除机构 / 转让拥有者 | | | ✓ |

以后若加 `viewer` 等，只扩枚举与映射表，不改「机构 = 协作容器」的产品结构。

---

## 4. 模板 vs PAM 怎么落地

### next-oauth（模板先做完整形态）

- 表：`organizations` + `organization_members`（`owner` 可用字段或成员角色表达，与 PAM 语义一致即可）  
- API / 页面：按机构鉴权；Admin 按系统角色鉴权  
- 会话 JWT：`roles`（系统）+ `orgId` + `orgRole` + `rv`

### PAM（对齐，不重复造轮）

- **机构 = 现有项目协作模型**（命名上产品可叫「机构/项目」，模型不分裂）  
- 增强点在：系统角色规范化、session `capabilities`、页面/API 统一 `assert*`、文档与模板同构  
- 若产品要统一叫「机构」，UI 文案可改；表可不强行改名（避免大迁移），或逐步别名

---

## 5. 高性能（不变）

- JWT 瘦载荷：系统角色 + 当前 `orgId`/`orgRole`（PAM 即当前项目上下文）+ `rv`  
- 权限内存展开；热路径零 DB  
- 改角色 → `rv++` + refresh session  

---

## 6. Session 示意

```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "capabilities": {
    "roles": ["user"],
    "permissions": [],
    "orgId": "...",
    "orgRole": "admin",
    "orgPermissions": ["…"],
    "platformAdmin": false
  }
}
```

PAM 可继续暴露现有 `my_role` / `can_edit` / `can_manage_collaborators`，与 `orgRole` 同源。

---

## 7. 落地切片（合入 `feat/role-system`）

1. **A** 模板：机构表 + 三角色 + Role/OrgService + JWT  
2. **B** 模板：页面 / API 闸门  
3. **C** 模板：机构成员 UI + 系统 Admin  
4. **D** PAM：系统角色迁移；协作模型确认为机构；capabilities 对齐  
5. **E** 回灌共享约定 → 合主线  

---

## 8. 明确不做

- 机构上再套一层平行 Organization，与项目成员两套名单  
- 机构下再嵌套「组/部门」（产品已认为与机构同一层）  
- 平台 admin 默认拥有所有机构的 owner 权限  
- 每页查库；Casbin；OAuth scope 当机构权限  

---

## 9. 对外口径

1. **机构** = 一个协作小团体（PAM 项目协作）  
2. 成员三角色：**拥有者 / 管理员 / 成员**（可扩展，首期三种）  
3. **系统角色**管平台后台，不管「进没进某个机构」  
4. 页面与 API 同一套鉴权；热路径要快  

---

*已拍板：你的协作即机构 + 三角色方案成立，并作为完整 role 的产品主线。*
