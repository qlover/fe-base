/**
 * @description Account page title
 * @localZh 个人中心
 * @localEn Account
 */
export const PAGE_ACCOUNT_TITLE = 'page_account:title';

/**
 * @description Account page description / SEO
 * @localZh 查看账号信息并修改登录密码
 * @localEn View your profile and change your password
 */
export const PAGE_ACCOUNT_DESCRIPTION = 'page_account:description';

/**
 * @description Account page keywords
 * @localZh 个人中心,账号,修改密码
 * @localEn account,profile,change password
 */
export const PAGE_ACCOUNT_KEYWORDS = 'page_account:keywords';

/**
 * @description Account section heading
 * @localZh 账号信息
 * @localEn Account details
 */
export const PAGE_ACCOUNT_SECTION_TITLE = 'page_account:section_title';

/**
 * @description Display name field label
 * @localZh 显示名称
 * @localEn Display name
 */
export const PAGE_ACCOUNT_DISPLAY_NAME_LABEL =
  'page_account:display_name_label';

/**
 * @description Display name input placeholder
 * @localZh 1–32 位字母、数字或下划线
 * @localEn 1–32 letters, numbers, or underscores
 */
export const PAGE_ACCOUNT_DISPLAY_NAME_PLACEHOLDER =
  'page_account:display_name_placeholder';

/**
 * @description Start editing display name
 * @localZh 修改
 * @localEn Edit
 */
export const PAGE_ACCOUNT_DISPLAY_NAME_EDIT = 'page_account:display_name_edit';

/**
 * @description Display name updated successfully
 * @localZh 显示名称已更新
 * @localEn Display name updated
 */
export const PAGE_ACCOUNT_DISPLAY_NAME_SUCCESS =
  'page_account:display_name_success';

/**
 * @description Display name update failed (fallback)
 * @localZh 更新显示名称失败，请重试
 * @localEn Failed to update display name. Please try again.
 */
export const PAGE_ACCOUNT_DISPLAY_NAME_ERROR =
  'page_account:display_name_error';

/**
 * @description Display name format invalid
 * @localZh 显示名需为 1–32 位字母、数字或下划线
 * @localEn Display name must be 1–32 letters, numbers, or underscores
 */
export const PAGE_ACCOUNT_DISPLAY_NAME_INVALID =
  'page_account:display_name_invalid';

/**
 * @description Phone field label
 * @localZh 手机号
 * @localEn Phone
 */
export const PAGE_ACCOUNT_PHONE_LABEL = 'page_account:phone_label';

/**
 * @description Email field label
 * @localZh 邮箱
 * @localEn Email
 */
export const PAGE_ACCOUNT_EMAIL_LABEL = 'page_account:email_label';

/**
 * @description User id field label
 * @localZh 用户 ID
 * @localEn User ID
 */
export const PAGE_ACCOUNT_USER_ID_LABEL = 'page_account:user_id_label';

/**
 * @description Empty value placeholder
 * @localZh 未设置
 * @localEn Not set
 */
export const PAGE_ACCOUNT_VALUE_EMPTY = 'page_account:value_empty';

/**
 * @description Change password section title
 * @localZh 修改密码
 * @localEn Change password
 */
export const PAGE_ACCOUNT_PASSWORD_SECTION_TITLE =
  'page_account:password_section_title';

/**
 * @description Change password section description
 * @localZh 输入当前密码验证身份后设置新密码，当前设备会保持登录
 * @localEn Confirm your current password to set a new one. You stay signed in on this device.
 */
export const PAGE_ACCOUNT_PASSWORD_DESCRIPTION =
  'page_account:password_description';

/**
 * @description Hint for accounts that never set a password
 * @localZh 仅使用验证码或第三方登录、从未设置过密码的账号暂不支持修改密码
 * @localEn Accounts that only sign in with codes or third-party providers and never set a password cannot change it here
 */
export const PAGE_ACCOUNT_PASSWORD_NO_PASSWORD_HINT =
  'page_account:password_no_password_hint';

/**
 * @description Shown instead of the form when the account has no email
 * @localZh 当前账号没有邮箱，无法使用密码登录，也无法修改密码
 * @localEn This account has no email, so password sign-in and password changes are unavailable
 */
export const PAGE_ACCOUNT_PASSWORD_EMAIL_REQUIRED =
  'page_account:password_email_required';

/**
 * @description Current password input placeholder
 * @localZh 当前密码
 * @localEn Current password
 */
export const PAGE_ACCOUNT_PASSWORD_CURRENT_PLACEHOLDER =
  'page_account:password_current_placeholder';

/**
 * @description New password input placeholder
 * @localZh 新密码（6–50 位，不含空格）
 * @localEn New password (6–50 characters, no spaces)
 */
export const PAGE_ACCOUNT_PASSWORD_NEW_PLACEHOLDER =
  'page_account:password_new_placeholder';

/**
 * @description Confirm new password input placeholder
 * @localZh 再次输入新密码
 * @localEn Confirm new password
 */
export const PAGE_ACCOUNT_PASSWORD_CONFIRM_PLACEHOLDER =
  'page_account:password_confirm_placeholder';

/**
 * @description Change password submit button
 * @localZh 确认修改
 * @localEn Update password
 */
export const PAGE_ACCOUNT_PASSWORD_SUBMIT = 'page_account:password_submit';

/**
 * @description Password changed successfully
 * @localZh 密码已修改
 * @localEn Password updated
 */
export const PAGE_ACCOUNT_PASSWORD_SUCCESS = 'page_account:password_success';

/**
 * @description Change password failed (fallback)
 * @localZh 修改密码失败，请重试
 * @localEn Failed to change password. Please try again.
 */
export const PAGE_ACCOUNT_PASSWORD_ERROR = 'page_account:password_error';

/**
 * @description New password format invalid
 * @localZh 新密码需为 6–50 位且不能包含空格
 * @localEn New password must be 6–50 characters with no spaces
 */
export const PAGE_ACCOUNT_PASSWORD_INVALID = 'page_account:password_invalid';

/**
 * @description Confirmation does not match the new password
 * @localZh 两次输入的新密码不一致
 * @localEn The new passwords do not match
 */
export const PAGE_ACCOUNT_PASSWORD_MISMATCH = 'page_account:password_mismatch';

/**
 * @description New password equals the current password
 * @localZh 新密码不能与当前密码相同
 * @localEn New password must differ from the current password
 */
export const PAGE_ACCOUNT_PASSWORD_SAME = 'page_account:password_same';

/**
 * @description Hint when account has no business email
 * @localZh 当前为手机号登录账号，绑定邮箱后可改密并接收安全通知
 * @localEn This account signed in with a phone number. Bind an email to change password and receive security notices.
 */
export const PAGE_ACCOUNT_BIND_HINT = 'page_account:bind_hint';

/**
 * @description Bind email section title
 * @localZh 绑定邮箱
 * @localEn Bind email
 */
export const PAGE_ACCOUNT_BIND_SECTION_TITLE =
  'page_account:bind_section_title';

/**
 * @description Bind email form description
 * @localZh 验证后可将邮箱绑定到当前账号；若邮箱已存在将合并到该邮箱账号
 * @localEn Verify to bind this email. If it already belongs to another account, accounts will be merged.
 */
export const PAGE_ACCOUNT_BIND_DESCRIPTION = 'page_account:bind_description';

/**
 * @description Bind email merge hint
 * @localZh 合并后仅保留邮箱账号，手机号会挂到该账号
 * @localEn After merge only the email account remains; your phone moves to it.
 */
export const PAGE_ACCOUNT_BIND_MERGE_HINT = 'page_account:bind_merge_hint';

/**
 * @description Bind email input placeholder
 * @localZh 邮箱地址
 * @localEn Email address
 */
export const PAGE_ACCOUNT_BIND_EMAIL_PLACEHOLDER =
  'page_account:bind_email_placeholder';

/**
 * @description Bind email OTP placeholder
 * @localZh 邮箱验证码
 * @localEn Email verification code
 */
export const PAGE_ACCOUNT_BIND_OTP_PLACEHOLDER =
  'page_account:bind_otp_placeholder';

/**
 * @description Bind email send code button
 * @localZh 发送验证码
 * @localEn Send code
 */
export const PAGE_ACCOUNT_BIND_SEND = 'page_account:bind_send';

/**
 * @description Bind email resend code button
 * @localZh 重新发送
 * @localEn Resend
 */
export const PAGE_ACCOUNT_BIND_RESEND = 'page_account:bind_resend';

/**
 * @description Bind email verify button
 * @localZh 确认绑定
 * @localEn Confirm
 */
export const PAGE_ACCOUNT_BIND_VERIFY = 'page_account:bind_verify';

/**
 * @description Bind email success (bound to current)
 * @localZh 邮箱绑定成功
 * @localEn Email bound successfully
 */
export const PAGE_ACCOUNT_BIND_SUCCESS = 'page_account:bind_success';

/**
 * @description Bind email success (merged)
 * @localZh 账号已合并到邮箱账号
 * @localEn Account merged into the email account
 */
export const PAGE_ACCOUNT_BIND_SUCCESS_MERGED =
  'page_account:bind_success_merged';

/**
 * @description Bind email generic error
 * @localZh 绑定失败，请重试
 * @localEn Binding failed. Please try again.
 */
export const PAGE_ACCOUNT_BIND_ERROR = 'page_account:bind_error';

/**
 * @description Linked third-party logins section title
 * @localZh 已关联登录
 * @localEn Linked logins
 */
export const PAGE_ACCOUNT_LINKED_SECTION_TITLE =
  'page_account:linked_section_title';

/**
 * @description Empty linked logins list
 * @localZh 暂无关联的第三方登录
 * @localEn No linked third-party logins
 */
export const PAGE_ACCOUNT_LINKED_EMPTY = 'page_account:linked_empty';

/**
 * @description Linked status label
 * @localZh 已关联
 * @localEn Linked
 */
export const PAGE_ACCOUNT_LINKED = 'page_account:linked';

/**
 * @description Last login prefix
 * @localZh 最近登录
 * @localEn Last login
 */
export const PAGE_ACCOUNT_LINKED_LAST_LOGIN = 'page_account:linked_last_login';

/**
 * @description Failed to load linked logins
 * @localZh 加载关联登录失败，请稍后重试
 * @localEn Failed to load linked logins. Please try again.
 */
export const PAGE_ACCOUNT_LINKED_ERROR = 'page_account:linked_error';

/**
 * @description Feedback section title
 * @localZh �������
 * @localEn Feedback
 */
export const PAGE_ACCOUNT_FEEDBACK_SECTION_TITLE =
  'page_account:feedback_section_title';

/**
 * @description Feedback section description
 * @localZh ���������������������Ľ�����
 * @localEn Tell us about issues or ideas for improvement
 */
export const PAGE_ACCOUNT_FEEDBACK_DESCRIPTION =
  'page_account:feedback_description';

/**
 * @description Feedback category label
 * @localZh ����
 * @localEn Category
 */
export const PAGE_ACCOUNT_FEEDBACK_CATEGORY_LABEL =
  'page_account:feedback_category_label';

/**
 * @description Feedback body label
 * @localZh ����
 * @localEn Details
 */
export const PAGE_ACCOUNT_FEEDBACK_BODY_LABEL =
  'page_account:feedback_body_label';

/**
 * @description Feedback body placeholder
 * @localZh �뾡���������ֲ������������
 * @localEn Include steps to reproduce and what you expected
 */
export const PAGE_ACCOUNT_FEEDBACK_BODY_PLACEHOLDER =
  'page_account:feedback_body_placeholder';

/**
 * @description Feedback submit
 * @localZh �ύ����
 * @localEn Submit feedback
 */
export const PAGE_ACCOUNT_FEEDBACK_SUBMIT = 'page_account:feedback_submit';

/**
 * @description Feedback success
 * @localZh ��л�������������յ�
 * @localEn Thanks �� we received your feedback
 */
export const PAGE_ACCOUNT_FEEDBACK_SUCCESS = 'page_account:feedback_success';

/**
 * @description Feedback error
 * @localZh �ύʧ�ܣ����Ժ�����
 * @localEn Failed to submit. Please try again.
 */
export const PAGE_ACCOUNT_FEEDBACK_ERROR = 'page_account:feedback_error';

/**
 * @description Feedback category bug
 * @localZh ȱ��
 * @localEn Bug
 */
export const PAGE_ACCOUNT_FEEDBACK_CATEGORY_BUG =
  'page_account:feedback_category_bug';

/**
 * @description Feedback category ux
 * @localZh ����
 * @localEn UX
 */
export const PAGE_ACCOUNT_FEEDBACK_CATEGORY_UX =
  'page_account:feedback_category_ux';

/**
 * @description Feedback category feature
 * @localZh ���ܽ���
 * @localEn Feature
 */
export const PAGE_ACCOUNT_FEEDBACK_CATEGORY_FEATURE =
  'page_account:feedback_category_feature';

/**
 * @description Feedback category performance
 * @localZh ����
 * @localEn Performance
 */
export const PAGE_ACCOUNT_FEEDBACK_CATEGORY_PERFORMANCE =
  'page_account:feedback_category_performance';

/**
 * @description Feedback category content
 * @localZh ����
 * @localEn Content
 */
export const PAGE_ACCOUNT_FEEDBACK_CATEGORY_CONTENT =
  'page_account:feedback_category_content';

/**
 * @description Feedback category other
 * @localZh 其他
 * @localEn Other
 */
export const PAGE_ACCOUNT_FEEDBACK_CATEGORY_OTHER =
  'page_account:feedback_category_other';

/**
 * @description Feedback screenshots label
 * @localZh 截图（可选，最多 3 张）
 * @localEn Screenshots (optional, up to 3)
 */
export const PAGE_ACCOUNT_FEEDBACK_SCREENSHOTS_LABEL =
  'page_account:feedback_screenshots_label';

/**
 * @description Feedback screenshots hint
 * @localZh JPEG / PNG / WebP，单张不超过 1.5MB
 * @localEn JPEG / PNG / WebP, max 1.5MB each
 */
export const PAGE_ACCOUNT_FEEDBACK_SCREENSHOTS_HINT =
  'page_account:feedback_screenshots_hint';
