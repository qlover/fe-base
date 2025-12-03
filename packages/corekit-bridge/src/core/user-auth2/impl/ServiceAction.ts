/**
 * Predefined service action types
 *
 * - LOGIN: login
 * - LOGOUT: logout
 * - REGISTER: register
 * - GET_USER_INFO: getUserInfo
 * - REFRESH_USER: refreshUserInfo
 */
export const ServiceAction = Object.freeze({
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  GET_USER_INFO: 'getUserInfo',
  REFRESH_USER: 'refreshUserInfo'
});

export type ServiceActionType =
  (typeof ServiceAction)[keyof typeof ServiceAction];
