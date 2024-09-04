import { readStreamableValue, StreamableValue } from "ai/rsc";
import { AssistantMessage } from "@/types/messages";

export async function streamResponse(
  responseStream: StreamableValue<string>,
  createMessage: (content: string) => AssistantMessage,
  updateStream: (message: AssistantMessage) => void,
) {
  let streamedMessage = createMessage("");
  for await (const content of readStreamableValue(responseStream)) {
    streamedMessage = createMessage(content as string);
    updateStream(streamedMessage);
  }
  return streamedMessage;
}