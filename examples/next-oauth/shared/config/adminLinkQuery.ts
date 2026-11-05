/**
 * 后台列表 / 页面直达用的地址查询参数名。
 *
 * - `/admin/users?q=<邮箱 / 昵称 / 用户 id>`：带关键词搜索
 * - `/admin/roles?role=<角色 key>`：选中该角色（可再带 `#权限key` 定位）
 */
export const ADMIN_LINK_QUERY = {
  userKeyword: 'q',
  roleKey: 'role'
} as const;
