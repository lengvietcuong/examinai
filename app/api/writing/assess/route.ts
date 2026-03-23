import { generateText, streamText, Output } from "ai";
import { z } from "zod";
import { chatModel, visionModel, namingModel } from "@/lib/ai/models";
import {
  WRITING_EXPERT_1_PROMPT,
  WRITING_EXPERT_2_PROMPT,
  WRITING_EXPERT_3_CORRECTION_PROMPT,
  WRITING_EXPERT_3_FEEDBACK_PROMPT,
  WRITING_EXPERT_4_TASK1_PROMPT,
  WRITING_EXPERT_4_TASK2_PROMPT,
  CONVERSATION_NAMING_PROMPT,
} from "@/lib/ai/prompts";
import {
  createConversation,
  addMessage,
  upsertProfile,
  updateConversationTitle,
} from "@/lib/db/queries";

export const maxDuration = 120;

// --- Zod schemas for structured output ---

const overviewSchema = z.object({
  overview: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

const scoringSchema = z.object({
  taskResponseHighLevel: z.string(),
  taskResponseStrengths: z.array(z.string()),
  taskResponseWeaknesses: z.array(z.string()),
  coherenceHighLevel: z.string(),
  coherenceStrengths: z.array(z.string()),
  coherenceWeaknesses: z.array(z.string()),
  taskResponseScore: z.number(),
  coherenceScore: z.number(),
});

const languageCorrectionSchema = z.object({
  correctedEssay: z.string(),
});

const languageFeedbackSchema = z.object({
  keyChanges: z.array(z.string()),
  lexicalResourceHighLevel: z.string(),
  lexicalResourceStrengths: z.array(z.string()),
  lexicalResourceWeaknesses: z.array(z.string()),
  grammaticalRangeHighLevel: z.string(),
  grammaticalRangeStrengths: z.array(z.string()),
  grammaticalRangeWeaknesses: z.array(z.string()),
  lexicalResourceScore: z.number(),
  grammaticalRangeScore: z.number(),
});

const vocabularySchema = z.object({
  word: z.string(),
  meaning: z.string(),
  usage: z.string(),
});

const improvementTask1Schema = z.object({
  improvedEssay: z.string(),
  vocabularyExplanations: z.array(vocabularySchema),
});

const improvementTask2Schema = z.object({
  expandIdeas: z.array(z.string()),
  improvedEssay: z.string(),
  vocabularyExplanations: z.array(vocabularySchema),
  alternativeDirection: z.string(),
  alternativeEssay: z.string(),
  alternativeVocabulary: z.array(vocabularySchema),
});

// --- Normalize helpers (fill defaults for partial/missing fields) ---

/** Ensure a value is a string array. Wraps a bare string, defaults to []. */
function ensureArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) return [val];
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOverview(raw: any) {
  return {
    overview: raw.overview ?? "",
    strengths: ensureArray(raw.strengths),
    weaknesses: ensureArray(raw.weaknesses),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeScoring(raw: any, isFinal = false) {
  const taskResponseWeaknesses = ensureArray(raw.taskResponseWeaknesses);
  const coherenceWeaknesses = ensureArray(raw.coherenceWeaknesses);
  // Auto-9 only on final result: strengths present but no weaknesses means perfect score
  const taskResponseScore =
    isFinal && taskResponseWeaknesses.length === 0
      ? 9
      : (raw.taskResponseScore ?? null);
  const coherenceScore =
    isFinal && coherenceWeaknesses.length === 0
      ? 9
      : (raw.coherenceScore ?? null);
  return {
    taskResponseHighLevel: raw.taskResponseHighLevel ?? "",
    taskResponseStrengths: ensureArray(raw.taskResponseStrengths),
    taskResponseWeaknesses,
    taskResponseScore,
    coherenceHighLevel: raw.coherenceHighLevel ?? "",
    coherenceStrengths: ensureArray(raw.coherenceStrengths),
    coherenceWeaknesses,
    coherenceScore,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeLanguageAnalysis(raw: any, isFinal = false) {
  const lexicalResourceWeaknesses = ensureArray(raw.lexicalResourceWeaknesses);
  const grammaticalRangeWeaknesses = ensureArray(raw.grammaticalRangeWeaknesses);
  // Auto-9 only on final result: strengths present but no weaknesses means perfect score
  const lexicalResourceScore =
    isFinal && lexicalResourceWeaknesses.length === 0
      ? 9
      : (raw.lexicalResourceScore ?? null);
  const grammaticalRangeScore =
    isFinal && grammaticalRangeWeaknesses.length === 0
      ? 9
      : (raw.grammaticalRangeScore ?? null);
  return {
    lexicalResourceHighLevel: raw.lexicalResourceHighLevel ?? "",
    lexicalResourceStrengths: ensureArray(raw.lexicalResourceStrengths),
    lexicalResourceWeaknesses,
    grammaticalRangeHighLevel: raw.grammaticalRangeHighLevel ?? "",
    grammaticalRangeStrengths: ensureArray(raw.grammaticalRangeStrengths),
    grammaticalRangeWeaknesses,
    correctedEssay: raw.correctedEssay ?? "",
    keyChanges: ensureArray(raw.keyChanges),
    lexicalResourceScore,
    grammaticalRangeScore,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeImprovement(raw: any, taskNumber: string, essay: string) {
  const base = {
    improvedEssay: raw.improvedEssay ?? "",
    vocabularyExplanations: filterRedundantVocabulary(
      Array.isArray(raw.vocabularyExplanations) ? raw.vocabularyExplanations : [],
      essay,
    ),
  };
  if (taskNumber === "2") {
    return {
      ...base,
      expandIdeas: ensureArray(raw.expandIdeas),
      alternativeDirection: raw.alternativeDirection ?? "",
      alternativeEssay: raw.alternativeEssay ?? "",
      alternativeVocabulary: filterRedundantVocabulary(
        Array.isArray(raw.alternativeVocabulary) ? raw.alternativeVocabulary : [],
        essay,
      ),
    };
  }
  return base;
}

// --- Sentence-level diff for two-stage Expert 3 pipeline ---

interface SentenceDiff {
  sentence: string;
  removed: string;
  added: string;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function computeSentenceDiffs(
  original: string,
  corrected: string,
): SentenceDiff[] {
  const origSentences = splitSentences(original);
  const corrSentences = splitSentences(corrected);
  const diffs: SentenceDiff[] = [];

  // Use LCS on words within aligned sentences
  const len = Math.max(origSentences.length, corrSentences.length);
  for (let i = 0; i < len; i++) {
    const origSent = origSentences[i] ?? "";
    const corrSent = corrSentences[i] ?? "";
    if (origSent === corrSent) continue;

    const origWords = origSent.split(/\s+/).filter(Boolean);
    const corrWords = corrSent.split(/\s+/).filter(Boolean);

    // LCS to find common words
    const n = origWords.length;
    const m = corrWords.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () =>
      new Array(m + 1).fill(0),
    );
    for (let a = 1; a <= n; a++) {
      for (let b = 1; b <= m; b++) {
        dp[a][b] =
          origWords[a - 1] === corrWords[b - 1]
            ? dp[a - 1][b - 1] + 1
            : Math.max(dp[a - 1][b], dp[a][b - 1]);
      }
    }

    // Backtrack to find removed/added words
    const removed: string[] = [];
    const added: string[] = [];
    let a = n,
      b = m;
    while (a > 0 || b > 0) {
      if (a > 0 && b > 0 && origWords[a - 1] === corrWords[b - 1]) {
        a--;
        b--;
      } else if (b > 0 && (a === 0 || dp[a][b - 1] >= dp[a - 1][b])) {
        added.unshift(corrWords[b - 1]);
        b--;
      } else {
        removed.unshift(origWords[a - 1]);
        a--;
      }
    }

    if (removed.length > 0 || added.length > 0) {
      diffs.push({
        sentence: origSent || corrSent,
        removed: removed.join(" "),
        added: added.join(" "),
      });
    }
  }

  return diffs;
}

function formatDiffsForPrompt(diffs: SentenceDiff[]): string {
  if (diffs.length === 0) return "No changes were made.";
  return diffs
    .map((d, i) => {
      const parts = [`Change ${i + 1}:`];
      parts.push(`  Sentence: "${d.sentence}"`);
      if (d.removed) parts.push(`  Removed: "${d.removed}"`);
      if (d.added) parts.push(`  Added: "${d.added}"`);
      return parts.join("\n");
    })
    .join("\n\n");
}

/** Remove vocabulary items whose word already appears in the student's essay. */
function filterRedundantVocabulary(
  vocabulary: { word: string; meaning: string; usage: string }[],
  essay: string,
): { word: string; meaning: string; usage: string }[] {
  const essayLower = essay.toLowerCase();
  return vocabulary.filter((item) => !essayLower.includes(item.word.toLowerCase()));
}

/** Retry a fn once on failure. */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fn();
  }
}

/**
 * Stream an expert's structured output, sending throttled partial updates via SSE.
 * Returns the final normalized result.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function streamExpert<S extends z.ZodType>(config: {
  model: Parameters<typeof streamText>[0]["model"];
  system: string;
  messages: NonNullable<Parameters<typeof streamText>[0]["messages"]>;
  maxOutputTokens: number;
  schema: S;
  eventName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  normalize: (raw: any, isFinal?: boolean) => any;
  sendEvent: (type: string, data: unknown) => void;
}) {
  const { partialOutputStream } = streamText({
    model: config.model,
    system: config.system,
    messages: config.messages,
    maxOutputTokens: config.maxOutputTokens,
    temperature: 0,
    topP: 1,
    output: Output.object({ schema: config.schema }),
  });

  let lastSentTime = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let latest: any = null;

  for await (const partial of partialOutputStream) {
    latest = partial;
    const now = Date.now();
    if (now - lastSentTime >= 300) {
      config.sendEvent(config.eventName, config.normalize(partial, false));
      lastSentTime = now;
    }
  }

  // Always send the final complete result
  const finalData = config.normalize(latest, true);
  config.sendEvent(config.eventName, finalData);
  return finalData;
}

export async function POST(req: Request) {
  const { taskNumber, question, essay, imageUrl, wordCount, timeSpent, userId, sections: requestedSections } =
    await req.json();

  // Which sections to run — default to all four
  const sectionsToRun: Set<string> = requestedSections
    ? new Set(requestedSections as string[])
    : new Set(["overview", "scoring", "languageAnalysis", "improvement"]);

  const userMessage = `Task ${taskNumber} Question:\n${question}\n\nStudent's Essay (${wordCount ?? 0} words):\n${essay}`;

  const model = taskNumber === "1" && imageUrl ? visionModel() : chatModel();

  const userContent =
    taskNumber === "1" && imageUrl
      ? [
          { type: "text" as const, text: userMessage },
          { type: "image" as const, image: new URL(imageUrl) },
        ]
      : userMessage;

  const improvementPrompt =
    taskNumber === "1"
      ? WRITING_EXPERT_4_TASK1_PROMPT
      : WRITING_EXPERT_4_TASK2_PROMPT;

  const improvementSchema =
    taskNumber === "1" ? improvementTask1Schema : improvementTask2Schema;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(type: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`)
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results: Record<string, any> = {};
      const messages = [{ role: "user" as const, content: userContent }];
      const isPartialRetry = requestedSections && requestedSections.length < 4;

      const promises: Promise<void>[] = [];

      if (sectionsToRun.has("overview")) {
        promises.push(
          withRetry(() =>
            streamExpert({
              model,
              system: WRITING_EXPERT_1_PROMPT,
              messages,
              maxOutputTokens: 2000,
              schema: overviewSchema,
              eventName: "overview",
              normalize: normalizeOverview,
              sendEvent,
            })
          ).then((data) => {
            results.overview = data;
          }).catch((err) => {
            sendEvent("section_error", { section: "overview", message: err instanceof Error ? err.message : "Overview failed" });
          })
        );
      }

      if (sectionsToRun.has("scoring")) {
        promises.push(
          withRetry(() =>
            streamExpert({
              model,
              system: WRITING_EXPERT_2_PROMPT,
              messages,
              maxOutputTokens: 3000,
              schema: scoringSchema,
              eventName: "scoring",
              normalize: normalizeScoring,
              sendEvent,
            })
          ).then((data) => {
            results.scoring = data;
          }).catch((err) => {
            sendEvent("section_error", { section: "scoring", message: err instanceof Error ? err.message : "Scoring failed" });
          })
        );
      }

      if (sectionsToRun.has("languageAnalysis")) {
        promises.push(
          // Language analysis: Two-stage pipeline (correction → diff → feedback)
          withRetry(async () => {
            // Stage 1: Generate corrected essay
            const { partialOutputStream: correctionStream } = streamText({
              model,
              system: WRITING_EXPERT_3_CORRECTION_PROMPT,
              messages,
              maxOutputTokens: 2000,
              temperature: 0,
              topP: 1,
                      output: Output.object({ schema: languageCorrectionSchema }),
            });

            let correctedEssay = "";
            for await (const partial of correctionStream) {
              if (partial?.correctedEssay) {
                correctedEssay = partial.correctedEssay;
                sendEvent("languageAnalysis", normalizeLanguageAnalysis({ correctedEssay }, false));
              }
            }

            // Stage 2: Compute diffs using code
            const diffs = computeSentenceDiffs(essay, correctedEssay);
            const diffsText = formatDiffsForPrompt(diffs);

            // Stage 3: Generate feedback with diffs provided
            const feedbackMessages = [
              {
                role: "user" as const,
                content: `Task ${taskNumber} Question:\n${question}\n\nStudent's Essay:\n${essay}\n\nCorrected Essay:\n${correctedEssay}\n\nExact changes made (computed by comparing original and corrected versions):\n${diffsText}`,
              },
            ];

            const { partialOutputStream } = streamText({
              model: chatModel(),
              system: WRITING_EXPERT_3_FEEDBACK_PROMPT,
              messages: feedbackMessages,
              maxOutputTokens: 3000,
              temperature: 0,
              topP: 1,
                      output: Output.object({ schema: languageFeedbackSchema }),
            });

            let latestFeedback: any = null;
            let lastSentTime = 0;
            for await (const partial of partialOutputStream) {
              latestFeedback = partial;
              const now = Date.now();
              if (now - lastSentTime >= 300) {
                sendEvent(
                  "languageAnalysis",
                  normalizeLanguageAnalysis({ correctedEssay, ...partial }, false),
                );
                lastSentTime = now;
              }
            }

            const finalData = normalizeLanguageAnalysis({
              correctedEssay,
              ...latestFeedback,
            }, true);
            sendEvent("languageAnalysis", finalData);
            return finalData;
          }).then((data) => {
            results.languageAnalysis = data;
          }).catch((err) => {
            sendEvent("section_error", { section: "languageAnalysis", message: err instanceof Error ? err.message : "Language analysis failed" });
          })
        );
      }

      if (sectionsToRun.has("improvement")) {
        promises.push(
          withRetry(() =>
            streamExpert({
              model,
              system: improvementPrompt,
              messages,
              maxOutputTokens: 4096,
              schema: improvementSchema,
              eventName: "improvement",
              normalize: (raw) => normalizeImprovement(raw, taskNumber, essay),
              sendEvent,
            })
          ).then((data) => {
            results.improvement = data;
          }).catch((err) => {
            sendEvent("section_error", { section: "improvement", message: err instanceof Error ? err.message : "Improvement failed" });
          })
        );
      }

      await Promise.all(promises);

      // Save the conversation and messages to the database (only on full assessment, not partial retry)
      let conversationId: string | null = null;
      if (!isPartialRetry) {
        try {
          if (userId) {
            await upsertProfile({ id: userId });
          }

          const conversation = await createConversation({
            userId: userId || undefined,
            type: "writing",
            title: `Writing Task ${taskNumber}`,
          });
          conversationId = conversation.id;

          const userMessageContent = JSON.stringify({
            type: "writing_submission",
            taskNumber,
            question,
            essay,
            imageUrl: imageUrl || undefined,
            wordCount: wordCount || 0,
            timeSpent: timeSpent || undefined,
          });
          await addMessage({
            conversationId: conversation.id,
            role: "user",
            content: userMessageContent,
          });

          const assistantMessageContent = JSON.stringify({
            type: "writing_feedback",
            ...results.overview,
            ...results.scoring,
            ...results.languageAnalysis,
            ...results.improvement,
          });
          await addMessage({
            conversationId: conversation.id,
            role: "assistant",
            content: assistantMessageContent,
          });
        } catch (saveError) {
          console.error("[writing/assess] Failed to save conversation:", saveError);
        }

        // Auto-name the conversation
        let title: string | null = null;
        if (conversationId) {
          try {
            const { text } = await generateText({
              model: namingModel(),
              system: CONVERSATION_NAMING_PROMPT,
              prompt: `Writing Task ${taskNumber}: ${question}`,
              maxOutputTokens: 50,
            });
            title = text
              .trim()
              .replace(/^["']|["']$/g, "")
              .slice(0, 100);
            await updateConversationTitle(conversationId, title);
          } catch (nameError) {
            console.error("[writing/assess] Failed to name conversation:", nameError);
          }
        }

        sendEvent("done", { conversationId, title });
      } else {
        sendEvent("done", {});
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
