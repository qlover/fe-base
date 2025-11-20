import type { MessagesStateInterface } from '../interface/MessagesStoreInterface';

/**
 * 消息选择器接口
 *
 * @example
 * ```typescript
 * const selectors = {
 *   historyMessages: (state: MessagesStateInterface<string>) => state.messages,
 *   streaming: (state: MessagesStateInterface<string>) => !!state.streaming
 * };
 *
 * const messageStore = new MessagesStore<string>(selectors);
 *
 * const historyMessages = useStore(messageStore, selectors.historyMessages);
 * const streaming = useStore(messageStore, selectors.streaming);
 * ```
 *
 * @template T - 状态类型
 */
export interface MessageSelectorInterface<T = unknown> {
  /**
   * 订阅历史消息列表
   *
   * @param state 状态
   * @returns 历史消息列表
   */
  historyMessages(state: MessagesStateInterface<T>): T[];
  /**
   * 订阅流式传输状态
   *
   * @param state 状态
   * @returns 流式传输状态
   */
  streaming(state: MessagesStateInterface<T>): boolean;
}

const baseSelector: MessageSelectorInterface<unknown> = {
  historyMessages: (state: MessagesStateInterface<unknown>) => state.messages,
  streaming: (state: MessagesStateInterface<unknown>) => !!state.streaming
};

export type SelectorFunction = (state: any) => unknown;

/**
 * 创建消息选择器（Message Selector）的工厂函数
 *
 * 该函数提供了两种使用方式，通过函数重载实现：
 * 1. **灵活版本**：直接传入 selectors 对象，每个方法可以手动指定不同的 state 类型
 * 2. **类型约束版本**：先指定统一的 State 类型，然后传入 selectors，所有方法的 state 参数自动推导
 *
 * ## 使用方式一：灵活版本（推荐用于需要不同 state 类型的场景）
 *
 * 直接传入 selectors 对象，每个方法可以指定不同的 state 类型。
 * 适用于：不同的 selector 需要处理不同类型的状态
 *
 * @example
 * ```typescript
 * const selectors = createMessageSelector({
 *   // 手动指定 state 类型为 ChatMessageStoreStateInterface
 *   historyMessages: (state: ChatMessageStoreStateInterface) => state.messages,
 *   draftMessages: (state: ChatMessageStoreStateInterface) => state.draftMessages,
 *
 *   // 也可以指定其他类型
 *   customSelector: (state: MessagesStateInterface<string>) => state.messages
 * });
 *
 * // 使用 selector
 * const messages = selectors.historyMessages(state);
 * const drafts = selectors.draftMessages(state);
 * ```
 *
 * ## 使用方式二：类型约束版本（推荐用于统一 state 类型的场景）
 *
 * 使用柯里化方式：先指定 State 泛型参数，再传入 selectors 对象。
 * 所有 selector 方法的 state 参数会自动推导为指定的类型。
 * 适用于：所有 selector 都使用同一种 state 类型，享受完整的类型提示
 *
 * @example
 * ```typescript
 * // 第一步：指定 State 类型
 * // 第二步：传入 selectors，state 参数会自动推导为 ChatMessageStoreStateInterface
 * const selectors = createMessageSelector<ChatMessageStoreStateInterface>()({
 *   // state 自动推导类型，有完整的智能提示
 *   historyMessages: (state) => state.messages,
 *   draftMessages: (state) => state.draftMessages,
 *   streaming: (state) => !!state.streaming,
 *
 *   // 自定义 selector，可以进行复杂计算
 *   sendingMessage: (state) => {
 *     return state.messages.find(msg => msg.status === 'sending');
 *   }
 * });
 *
 * // 使用 selector
 * const messages = selectors.historyMessages(state);
 * const drafts = selectors.draftMessages(state);
 * ```
 *
 * ## 选择建议
 *
 * | 场景 | 推荐方式 | 原因 |
 * |------|---------|------|
 * | 所有 selector 使用同一种 state 类型 | 方式二（类型约束版本） | 代码简洁，完整的类型提示 |
 * | 不同 selector 需要不同的 state 类型 | 方式一（灵活版本） | 最大灵活性 |
 * | 快速开发，需要智能提示 | 方式二（类型约束版本） | 自动推导，减少手动输入 |
 * | 需要处理多种数据源 | 方式一（灵活版本） | 支持不同类型的 state |
 *
 * @template State - 状态类型，必须继承自 MessagesStateInterface（仅在类型约束版本中使用）
 * @template Selectors - Selector 方法集合的类型，会自动推导
 *
 * @param selectors - 可选参数，selector 方法的集合对象
 *
 * @returns 如果不传参数，返回柯里化函数；如果传入 selectors，返回合并了基础 selector 和自定义 selector 的对象
 *
 * @remarks
 * - 返回的对象包含基础的 selector（historyMessages, streaming）和自定义的 selector
 * - 基础 selector 会被自定义 selector 覆盖（如果有同名方法）
 * - 所有 selector 方法都应该是纯函数，不应有副作用
 * - TypeScript 的类型系统不支持部分泛型推导，因此类型约束版本必须使用柯里化
 *
 * @see {@link MessageSelectorInterface} - 基础选择器接口
 * @see {@link MessagesStateInterface} - 消息状态接口
 */
// 重载1：类型约束版本 - 不传参数，返回柯里化函数统一约束所有 selector 的 state 类型
export function createMessageSelector<
  State extends MessagesStateInterface<any>
>(): <Selectors extends Record<string, (state: State) => unknown>>(
  selectors: Selectors
) => MessageSelectorInterface<any> & Selectors;

// 重载2：灵活版本 - 直接传入 selectors，每个方法可以手动指定自己的类型
export function createMessageSelector<
  Selectors extends Record<string, SelectorFunction>
>(selectors: Selectors): MessageSelectorInterface<any> & Selectors;

// 实现
export function createMessageSelector<
  State extends MessagesStateInterface<any>
>(selectors?: Record<string, SelectorFunction>) {
  if (selectors === undefined) {
    // 类型约束版本：返回柯里化函数
    return <Selectors extends Record<string, (state: State) => unknown>>(
      selectorsFn: Selectors
    ): MessageSelectorInterface<any> & Selectors => {
      return {
        ...baseSelector,
        ...selectorsFn
      } as MessageSelectorInterface<any> & Selectors;
    };
  }

  // 灵活版本：直接返回结果
  return {
    ...baseSelector,
    ...selectors
  } as MessageSelectorInterface<any> & Record<string, SelectorFunction>;
}
