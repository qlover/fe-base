import type { AppApiResult } from '@shared/interfaces/AppApiInterface';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface AIControllerInterface {
  completions(body: {
    messages: ChatCompletionMessageParam[];
  }): Promise<AppApiResult<unknown>>;
}
