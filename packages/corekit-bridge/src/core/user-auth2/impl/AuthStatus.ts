export const AuthStatus = Object.freeze({
  INITIAL: 'initial',
  LOADING: 'loading',
  SUCCESS: 'success',
  STOPPED: 'stopped',
  FAILED: 'failed'
});

export type AuthStatusType = (typeof AuthStatus)[keyof typeof AuthStatus];
