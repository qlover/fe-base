import { ChatFocusBar } from './ChatFocusBar';
import { ChatMessages } from './ChatMessages';
import type {
  ChatActionInterface,
  ChatStateInterface
} from './ChatActionInterface';
import type {
  FocusBarActionInterface,
  FocusBarStateInterface
} from './FocusBarActionInterface';

export function ChatWrap({
  chatAction,
  focusBarAction
}: {
  chatAction: ChatActionInterface<ChatStateInterface>;
  focusBarAction: FocusBarActionInterface<FocusBarStateInterface>;
}) {
  return (
    <div
      data-testid="ChatWrap"
      className="flex h-full flex-col p-2 bg-primary shadow-2xl"
    >
      <ChatMessages chatAction={chatAction} />
      <ChatFocusBar focusBarAction={focusBarAction} />
    </div>
  );
}
