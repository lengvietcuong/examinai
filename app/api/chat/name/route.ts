import { generateText } from "ai";
import { namingModel } from "@/lib/ai/models";
import { CONVERSATION_NAMING_PROMPT } from "@/lib/ai/prompts";
import { getConversation, updateConversationTitle } from "@/lib/db/queries";
import { getAuthUser } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { message, conversationId } = await req.json();

  if (conversationId) {
    const conv = await getConversation(conversationId);
    if (conv?.userId) {
      const authUser = await getAuthUser(req);
      if (!authUser || authUser.id !== conv.userId) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

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
