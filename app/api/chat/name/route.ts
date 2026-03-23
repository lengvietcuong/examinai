import { generateText } from "ai";
import { namingModel } from "@/lib/ai/models";
import { CONVERSATION_NAMING_PROMPT } from "@/lib/ai/prompts";
import { updateConversationTitle } from "@/lib/db/queries";

export async function POST(req: Request) {
  const { message, conversationId } = await req.json();

  const { text } = await generateText({
    model: namingModel(),
    system: CONVERSATION_NAMING_PROMPT,
    prompt: message,
    maxOutputTokens: 50,
  });

  const title = text
    .trim()
    .replace(/^["']|["']$/g, "")
    .slice(0, 100);

  if (conversationId) {
    await updateConversationTitle(conversationId, title);
  }

  return Response.json({ title });
}
