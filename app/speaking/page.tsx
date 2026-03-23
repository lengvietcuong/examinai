import { redirect } from "next/navigation";
import { getMessages } from "@/lib/db/queries";
import SpeakingPageClient from "./client";

export default async function SpeakingPage({
  searchParams,
}: {
  searchParams: Promise<{
    conversation_id?: string;
  }>;
}) {
  const { conversation_id } = await searchParams;

  // Loading a saved speaking conversation
  if (conversation_id) {
    const msgs = await getMessages(conversation_id);
    if (msgs.length === 0) redirect("/chat");

    // First message should be system with speaking_config
    let questions;
    try {
      const systemMsg = msgs[0];
      if (systemMsg.role !== "system") redirect("/chat");
      const config = JSON.parse(systemMsg.content);
      if (config.type !== "speaking_config") redirect("/chat");
      questions = config.questions;
    } catch {
      redirect("/chat");
    }

    // Remaining messages are the conversation (skip the system config message)
    const conversationMessages = msgs.slice(1).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    return (
      <SpeakingPageClient
        savedConversation={{
          conversationId: conversation_id,
          questions,
          messages: conversationMessages,
        }}
      />
    );
  }

  // Fresh session — questions come from sessionStorage (handled client-side)
  return <SpeakingPageClient />;
}
