import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";
import { chatModel } from "@/lib/ai/models";
import { GENERAL_CHAT_PROMPT } from "@/lib/ai/prompts";
import {
  getIeltsKnowledge,
  getIeltsKnowledgeByTitle,
  getMessages,
  addMessage,
} from "@/lib/db/queries";

export const maxDuration = 60;

/**
 * Convert JSON-encoded writing messages from the DB into readable context
 * so the model understands the essay and feedback.
 */
function buildWritingContext(
  dbMessages: { role: string; content: string }[],
): string | null {
  let context = "";
  for (const msg of dbMessages) {
    try {
      const parsed = JSON.parse(msg.content);
      if (parsed.type === "writing_submission") {
        context += `\n\nThe student submitted a Writing Task ${parsed.taskNumber} essay.\n`;
        context += `Question: ${parsed.question}\n`;
        context += `Essay: ${parsed.essay}\n`;
      } else if (parsed.type === "writing_feedback") {
        context += `\nFeedback provided:\n`;
        if (parsed.overview) {
          context += `Overview: ${parsed.overview}\n`;
          if (parsed.strengths?.length)
            context += `Strengths: ${parsed.strengths.join("; ")}\n`;
          if (parsed.weaknesses?.length)
            context += `Areas for improvement: ${parsed.weaknesses.join("; ")}\n`;
        }
        if (parsed.taskResponseHighLevel) {
          context += `Task Response score: ${parsed.taskResponseScore}, feedback: ${parsed.taskResponseHighLevel}\n`;
          context += `Coherence & Cohesion score: ${parsed.coherenceScore}, feedback: ${parsed.coherenceHighLevel}\n`;
        }
        if (parsed.correctedEssay != null) {
          context += `Lexical Resource score: ${parsed.lexicalResourceScore}, feedback: ${parsed.lexicalResourceHighLevel}\n`;
          context += `Grammatical Range & Accuracy score: ${parsed.grammaticalRangeScore}, feedback: ${parsed.grammaticalRangeHighLevel}\n`;
          if (parsed.keyChanges?.length)
            context += `Key corrections: ${parsed.keyChanges.join("; ")}\n`;
        }
      }
    } catch {
      // Not JSON — skip (these are regular text messages handled by useChat)
    }
  }
  return context.trim() || null;
}

export async function POST(req: Request) {
  const { messages, conversationId } = await req.json();

  // Build additional context from conversation history (e.g. writing submissions)
  let systemPrompt = GENERAL_CHAT_PROMPT;
  if (conversationId) {
    try {
      const dbMessages = await getMessages(conversationId);
      const writingContext = buildWritingContext(dbMessages);
      if (writingContext) {
        systemPrompt += `\n\nContext from this conversation:\n${writingContext}\n\nThe student may now ask follow-up questions about their essay or the feedback. Answer based on the context above. Be specific and reference their actual essay content and the feedback that was given.`;
      }
    } catch {
      // Non-critical — proceed without extra context
    }
  }

  const result = streamText({
    model: chatModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      searchIeltsKnowledge: tool({
        description:
          "Search IELTS knowledge documents to answer questions about the IELTS exam. Use this whenever the user asks about IELTS rules, format, scoring, tips, or any exam-related topic.",
        inputSchema: z.object({
          query: z.string().describe("The search query about IELTS"),
        }),
        execute: async () => {
          const docs = await getIeltsKnowledge();
          return docs.map((d) => ({ title: d.title, content: d.content }));
        },
      }),
      getIeltsDocument: tool({
        description:
          "Get a specific IELTS knowledge document by its title for detailed information.",
        inputSchema: z.object({
          title: z
            .string()
            .describe("The exact title of the knowledge document"),
        }),
        execute: async ({ title }) => {
          const docs = await getIeltsKnowledgeByTitle(title);
          return docs.map((d) => ({ title: d.title, content: d.content }));
        },
      }),
    },
    stopWhen: stepCountIs(3),
    onFinish: async ({ text }) => {
      if (conversationId && text) {
        await addMessage({
          conversationId,
          role: "assistant",
          content: text,
        });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
