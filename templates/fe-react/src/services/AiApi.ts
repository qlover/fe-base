import { OpenAIClient } from "../../lib/openAiApi/OpenAIClient";

export class AiApi {
  constructor(private readonly openAiClient: OpenAIClient) {}

  async hello() {
    return this.openAiClient.completion({
      messages: [
        {
          role: 'user',
          content: 'Hello, world!'
        }
      ]
    });
  }
}
