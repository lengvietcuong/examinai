import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";
import { chatModel } from "@/lib/ai/models";
import {
  SPEAKING_SYSTEM_PROMPT,
  SPEAKING_FIRST_QUESTION_PROMPT,
} from "@/lib/ai/prompts";
import {
  getRandomSpeakingQuestions,
  addMessage,
  getConversation,
} from "@/lib/db/queries";
import { getAuthUser } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, questions, conversationId } = await req.json();

  if (conversationId) {
    const conv = await getConversation(conversationId);
    if (conv?.userId) {
      const authUser = await getAuthUser(req);
      if (!authUser || authUser.id !== conv.userId) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  const questionsContext = questions
    .map(
      (q: { partNumber: string; title: string; content: string }) =>
        `Part ${q.partNumber} - ${q.title}:\n${q.content}`,
    )
    .join("\n\n");

  const isFirstTurn =
    messages.length === 1 && messages[0]?.role === "user";

  const systemPrompt = (
    isFirstTurn ? SPEAKING_FIRST_QUESTION_PROMPT : SPEAKING_SYSTEM_PROMPT
  ).replace("{{QUESTIONS}}", questionsContext);

  const result = streamText({
    model: chatModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: isFirstTurn
      ? undefined
      : {
          fetchMoreQuestions: tool({
            description:
              "Fetch additional speaking questions when the user explicitly asks to continue practicing. Only use this when the user requests more questions after completing the current set.",
            inputSchema: z.object({
              partNumbers: z
                .array(z.enum(["1", "2", "3"]))
                .describe("Which parts to fetch questions for"),
            }),
            execute: async ({ partNumbers }) => {
              const newQuestions =
                await getRandomSpeakingQuestions(partNumbers);
              return newQuestions.map((q) => ({
                partNumber: q.partNumber,
                title: q.testTitle,
                content: q.content,
              }));
            },
          }),
        },
    stopWhen: stepCountIs(3),
    onFinish: async ({ text }) => {
      if (conversationId && text) {
        try {
          await addMessage({
            conversationId,
            role: "assistant",
            content: text,
          });
        } catch (err) {
          console.error("[speaking] Failed to save assistant message:", err);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
