/**
 * 从 /user/info 修改成 /userinfo 为了兼容 oauth 的用户信息接口
 */
export const EP_USER_INFO = 'GET /user/info';

export const EP_USER_LOGIN = 'POST /user/login';

export const EP_USER_REGISTER = 'POST /user/register';

export const EP_USER_LOGOUT = 'POST /user/logout';
