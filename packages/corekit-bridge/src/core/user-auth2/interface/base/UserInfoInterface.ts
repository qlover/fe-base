export interface UserInfoInterface<User> {
  /**
   * Get current user information
   * @param params - Optional parameters for fetching user info (e.g., login data)
   * @returns Promise resolving to user information
   */
  getUserInfo<Params>(params?: Params): Promise<User>;

  /**
   * Refresh user information
   * @param params - Optional parameters for refreshing user info (e.g., login data)
   * @returns Promise resolving to user information
   */
  refreshUserInfo<Params>(params?: Params): Promise<User>;
}
