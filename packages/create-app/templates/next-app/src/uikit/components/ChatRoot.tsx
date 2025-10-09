'use client';

import { ChatAction } from '@/base/cases/ChatAction';
import { FocusBarAction } from '@/base/cases/FocusBarAction';
import { useIOC } from '../hook/useIOC';
import { ChatWrap } from './chat/ChatWrap';

export function ChatRoot() {
  const chatAction = useIOC(ChatAction);
  const focusBarAction = useIOC(FocusBarAction);

  return (
    <div data-testid="ChatRoot" className="fixed bottom-0 right-0 ">
      <ChatWrap chatAction={chatAction} focusBarAction={focusBarAction} />
    </div>
  );
}
