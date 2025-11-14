import type {
  FocusBarStateInterface,
  FocusBarStoreInterface
} from './FocusBarStoreInterface';
import type { MessageSenderInterface } from './MessageSenderInterface';
import type { MessageInterface } from './MessagesStoreInterface';

/**
 * FocusBar Bridge 接口
 * 职责：适配不同的输入入口，处理 UI 相关逻辑
 */
export interface FocusBarBridgeInterface<
  MessageType extends MessageInterface = MessageInterface
> {
  readonly store: FocusBarStoreInterface<FocusBarStateInterface>;
  readonly messageSender: MessageSenderInterface<MessageType>;

  onChangeText(text: string): void;

  /**
   * 当直接调用send时，会使用默认的输入框内容
   *
   * 当调用send(text)时，会使用传入的文本内容
   *
   * 当调用send(message)时，会使用传入的消息对象
   *
   * @returns 发送的消息
   */
  send(): Promise<MessageType>;
  send(text: string): Promise<MessageType>;
  send(message: MessageType): Promise<MessageType>;

  // /**
  //  * 从输入框发送文本消息
  //  * - 校验内容（长度、敏感词等）
  //  * - 显示确认弹窗（可选）
  //  * - 调用 Service 发送
  //  * - 显示成功/失败提示
  //  *
  //  * @param text 文本内容
  //  * @returns 发送的消息 或 null（失败/取消）
  //  */
  // sendInput(text: string): Promise<MessageType | null>;

  // // /**
  // //  * 发送文件消息
  // //  * - 校验文件大小和类型
  //  * - 上传文件
  //  * - 生成缩略图（图片）
  //  * - 调用 Service 发送
  //  *
  //  * @param file 文件对象
  //  * @returns 发送的消息 或 null（失败）
  //  */
  // sendFile(file: File): Promise<MessageType | null>;

  // /**
  //  * 批量发送文件
  //  * - 校验文件数量
  //  * - 批量上传
  //  * - 显示进度
  //  *
  //  * @param files 文件数组
  //  * @returns 发送的消息数组
  //  */
  // sendFiles(files: File[]): Promise<MessageType[]>;

  // /**
  //  * 发送语音消息
  //  * - 校验录音时长
  //  * - 音频转码压缩
  //  * - 上传音频
  //  *
  //  * @param audioBlob 音频数据
  //  * @param duration 录音时长（秒）
  //  * @returns 发送的消息 或 null（失败）
  //  */
  // sendVoice(audioBlob: Blob, duration: number): Promise<MessageType | null>;

  // /**
  //  * 回复消息
  //  * - 获取原消息
  //  * - 格式化引用
  //  * - 调用 Service 发送
  //  *
  //  * @param text 回复内容
  //  * @param replyToId 被回复的消息 ID
  //  * @returns 发送的消息 或 null（失败）
  //  */
  // sendReply(text: string, replyToId: string): Promise<MessageType | null>;

  // /**
  //  * 转发消息
  //  * - 显示确认弹窗
  //  * - 复制原消息
  //  * - 标记为转发
  //  *
  //  * @param messageId 原消息 ID
  //  * @returns 发送的消息 或 null（失败/取消）
  //  */
  // forwardMessage(messageId: string): Promise<MessageType | null>;

  // /**
  //  * 自动发送（无确认，静默发送）
  //  * 用于 AI 自动回复等场景
  //  *
  //  * @param text 文本内容
  //  * @returns 发送的消息 或 null（失败）
  //  */
  // sendAuto(text: string): Promise<MessageType | null>;

  // // ========== 消息操作 ==========

  // /**
  //  * 重发失败的消息
  //  * - 显示确认弹窗（可选）
  //  * - 调用 Service 重发
  //  *
  //  * @param messageId 消息 ID
  //  * @returns 重发的消息 或 null（失败/取消）
  //  */
  // resendMessage(messageId: string): Promise<MessageType | null>;

  // /**
  //  * 删除消息
  //  * - 显示确认弹窗
  //  * - 调用 Service 删除
  //  * - 显示成功/失败提示
  //  *
  //  * @param messageId 消息 ID
  //  * @returns 是否删除成功
  //  */
  // deleteMessage(messageId: string): Promise<boolean>;

  // /**
  //  * 编辑消息
  //  * - 校验内容
  //  * - 调用 Service 编辑
  //  *
  //  * @param messageId 消息 ID
  //  * @param content 新内容
  //  * @returns 编辑后的消息 或 null（失败）
  //  */
  // editMessage(messageId: string, content: string): Promise<MessageType | null>;

  // /**
  //  * 撤回消息
  //  * - 检查是否可撤回
  //  * - 显示确认弹窗
  //  * - 调用 Service 撤回
  //  *
  //  * @param messageId 消息 ID
  //  * @returns 是否撤回成功
  //  */
  // recallMessage(messageId: string): Promise<boolean>;

  // // ========== 文件操作 ==========

  // /**
  //  * 上传文件（不发送消息）
  //  * - 校验文件
  //  * - 显示上传进度
  //  * - 返回文件 URL
  //  *
  //  * @param file 文件对象
  //  * @param onProgress 进度回调
  //  * @returns 文件 URL 或 null（失败）
  //  */
  // uploadFile(
  //   file: File,
  //   onProgress?: (progress: number) => void
  // ): Promise<string | null>;

  // /**
  //  * 取消上传
  //  *
  //  * @param fileId 文件 ID
  //  */
  // cancelUpload(fileId: string): void;

  // // ========== 草稿管理 ==========

  // /**
  //  * 保存草稿
  //  *
  //  * @param content 内容
  //  * @param files 文件列表（可选）
  //  * @returns 是否保存成功
  //  */
  // saveDraft(content: string, files?: File[]): boolean;

  // /**
  //  * 加载草稿
  //  *
  //  * @returns 草稿内容 或 null（无草稿）
  //  */
  // loadDraft(): { content: string; files: File[] } | null;

  // /**
  //  * 清除草稿
  //  */
  // clearDraft(): void;

  // // ========== 工具方法 ==========

  // /**
  //  * 校验文本输入
  //  *
  //  * @param text 文本内容
  //  * @returns 校验结果
  //  */
  // validateInput(text: string): ResultInterface<void>;

  // /**
  //  * 校验文件
  //  *
  //  * @param file 文件对象
  //  * @returns 校验结果
  //  */
  // validateFile(file: File): ResultInterface<void>;

  // /**
  //  * 销毁 Bridge，清理资源
  //  */
  // destroy(): void;
}
