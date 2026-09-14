# next-oauth / PAM 角色 · 机构（完整方案 · 已拍板）

> **状态：已决定**  
> **产品核心：机构 = 协作容器（PAM 里就是「项目协作」这一层）**  
> **机构角色：`owner` / `admin` / `member`（三种够用；枚举可扩展，首期只实现这三种）**  
> **另有：系统角色（全站后台）—— 与机构协作分开**  
> **分支：** `feat/role-system`（子 PR 合入此分支）  
> **落地顺序（已改）：先 PAM 做完整 → 再抽通用能力移植到 next-oauth 模板**

---

## 0. 产品定论（与你对齐）

| 你的观点 | 决定 |
| --- | --- |
| PAM 协作就是一个机构 | **同意**。用户加入「当前机构」= 加入该协作容器 |
| 小机构 / 小团体各自有拥有者、管理员、成员 | **同意**。每个机构独立一席成员表 |
| 三种角色即可，以后可扩展 | **同意**。首期只实现三档；角色字符串预留扩展 |

**不做：** 在 PAM 项目协作之上再叠一套平行的「Organization 表」导致两套人马。  
**要做：** 先在 PAM 把完整 role 跑通；稳定后再抽通用能力移植到 next-oauth。

```
平台
 └─ 系统角色：user | operator | admin     → 全站 Admin 等

机构（协作容器）= PAM「项目」协作
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

PAM：直接使用 `system_role`（迁移 SQL 从 `is_platform_admin` 写入后删掉旧列，**不做双读**）。

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

## 4. PAM 先行 → 再移植模板

### PAM（先做完整）

- **机构 = 现有项目协作模型**（不另叠平行 Organization 成员表）  
- 系统角色：`system_role`（迁移后删除 `is_platform_admin`，不做双读）  
- Session `capabilities`（系统 + 当前机构/项目角色）  
- 页面 middleware + API Plugin 统一 `assertPermission` / 机构（项目）访问  
- 产品文案可称「机构」；表结构优先兼容现有 `pam_projects` / collaborators  

### next-oauth（PAM 稳定后再移植）

- 将 PAM 验证过的：权限常量、RoleService 形态、JWT 声明、`Require*Plugin`、session capabilities  
- 落成模板通用表 `organizations` + `organization_members`（与 PAM 语义同构）  
- 避免模板先行导致与线上 PAM 二次对齐成本  

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

### 阶段 1 — PAM（brain-toolkit）

1. **A** `system_role` 字段（迁移并删除 `is_platform_admin`）；Role/权限映射；session capabilities  
2. **B** 明确「项目 = 机构」：统一 assert / capabilities 与现有协作三角色  
3. **C** 页面 + API 闸门（Admin 用系统角色；项目用机构角色）  
4. **D** Admin / 协作 UI 与文案对齐（按需）  

### 阶段 2 — 移植 next-oauth（fe-base）

5. **E** 抽通用权限常量 / Plugin / session 形状  
6. **F** 模板机构表 + UI，语义与 PAM 对齐  
7. **G** 集成分支收齐 → 合主线  

---

## 8. 明确不做

- 机构上再叠一层平行 Organization，与项目成员两套名单  
- 机构下再嵌套「组/部门」  
- 平台 admin 默认拥有所有机构的 owner 权限  
- 每页查库；Casbin；OAuth scope 当机构权限  
- **先改模板再倒逼 PAM**（顺序已定为 PAM 先行）  

---

## 9. 对外口径

1. **机构** = 一个协作小团体（PAM 项目协作）  
2. 成员三角色：**拥有者 / 管理员 / 成员**（可扩展，首期三种）  
3. **系统角色**管平台后台，不管「进没进某个机构」  
4. **先 PAM，后 next-oauth**；页面与 API 同一套鉴权；热路径要快  

---

*已拍板：协作即机构 + 三角色；实现顺序 PAM → next-oauth。*
