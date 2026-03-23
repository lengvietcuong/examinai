import { redirect } from "next/navigation";
import { getWritingQuestionsById, getMessages } from "@/lib/db/queries";
import WritingPageClient from "./client";

export default async function WritingPage({
  searchParams,
}: {
  searchParams: Promise<{
    task_1_id?: string;
    task_2_id?: string;
    conversation_id?: string;
  }>;
}) {
  const { task_1_id, task_2_id, conversation_id } = await searchParams;

  // Loading a saved writing conversation
  if (conversation_id) {
    const msgs = await getMessages(conversation_id);
    if (msgs.length < 2) redirect("/chat");

    // Parse user message (submission) and assistant message (feedback)
    // Follow-up messages (index 2+) are plain text chat messages
    try {
      const userMsg = JSON.parse(msgs[0].content);
      const assistantMsg = JSON.parse(msgs[1].content);

      if (
        userMsg.type !== "writing_submission" ||
        assistantMsg.type !== "writing_feedback"
      ) {
        redirect("/chat");
      }

      const submission = {
        taskNumber: userMsg.taskNumber as "1" | "2",
        question: userMsg.question as string,
        essay: userMsg.essay as string,
        imageUrl: userMsg.imageUrl as string | undefined,
        wordCount: (userMsg.wordCount as number) || 0,
        timeSpent: userMsg.timeSpent as number | undefined,
      };

      const assessment = {
        overview: assistantMsg.overview != null ? {
          overview: assistantMsg.overview,
          strengths: assistantMsg.strengths,
          weaknesses: assistantMsg.weaknesses,
        } : null,
        scoring: assistantMsg.taskResponseHighLevel != null ? {
          taskResponseHighLevel: assistantMsg.taskResponseHighLevel,
          taskResponseStrengths: assistantMsg.taskResponseStrengths,
          taskResponseWeaknesses: assistantMsg.taskResponseWeaknesses,
          taskResponseScore: assistantMsg.taskResponseScore,
          coherenceHighLevel: assistantMsg.coherenceHighLevel,
          coherenceStrengths: assistantMsg.coherenceStrengths,
          coherenceWeaknesses: assistantMsg.coherenceWeaknesses,
          coherenceScore: assistantMsg.coherenceScore,
        } : null,
        languageAnalysis: assistantMsg.correctedEssay != null ? {
          lexicalResourceHighLevel: assistantMsg.lexicalResourceHighLevel,
          lexicalResourceStrengths: assistantMsg.lexicalResourceStrengths,
          lexicalResourceWeaknesses: assistantMsg.lexicalResourceWeaknesses,
          grammaticalRangeHighLevel: assistantMsg.grammaticalRangeHighLevel,
          grammaticalRangeStrengths: assistantMsg.grammaticalRangeStrengths,
          grammaticalRangeWeaknesses: assistantMsg.grammaticalRangeWeaknesses,
          correctedEssay: assistantMsg.correctedEssay,
          keyChanges: assistantMsg.keyChanges,
          lexicalResourceScore: assistantMsg.lexicalResourceScore,
          grammaticalRangeScore: assistantMsg.grammaticalRangeScore,
        } : null,
        improvement: assistantMsg.improvedEssay != null ? {
          improvedEssay: assistantMsg.improvedEssay,
          vocabularyExplanations: assistantMsg.vocabularyExplanations,
          ...(assistantMsg.expandIdeas != null ? {
            expandIdeas: assistantMsg.expandIdeas,
            alternativeDirection: assistantMsg.alternativeDirection,
            alternativeEssay: assistantMsg.alternativeEssay,
            alternativeVocabulary: assistantMsg.alternativeVocabulary,
          } : {}),
        } : null,
        done: true,
        failedSections: {},
      };

      // Collect follow-up chat messages (index 2+)
      const followUpMessages = msgs.slice(2).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      return (
        <WritingPageClient
          initialQuestions={null}
          savedConversation={{
            conversationId: conversation_id,
            submission,
            assessment,
            followUpMessages,
          }}
        />
      );
    } catch {
      redirect("/chat");
    }
  }

  const ids = [task_1_id, task_2_id].filter(Boolean) as string[];

  // No IDs → submission flow (handled client-side via sessionStorage)
  if (ids.length === 0) {
    return <WritingPageClient initialQuestions={null} />;
  }

  const rows = await getWritingQuestionsById(ids);
  if (rows.length === 0) {
    redirect("/chat");
  }

  const questions = rows.map((q) => ({
    id: q.id,
    title: q.testTitle,
    content: q.content,
    imageUrl: q.imageUrl ?? undefined,
    taskNumber: q.taskNumber,
  }));

  return <WritingPageClient initialQuestions={questions} />;
}
