"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { SpeakingSession } from "@/components/speaking/speaking-session";
import type { SpeakingQuestionData } from "@/lib/types";

interface SavedConversation {
  conversationId: string;
  questions: SpeakingQuestionData[];
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>;
}

export default function SpeakingPageClient({
  savedConversation,
}: {
  savedConversation?: SavedConversation;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState<SpeakingQuestionData[]>(
    savedConversation?.questions ?? [],
  );
  const [initialized, setInitialized] = useState(!!savedConversation);

  useEffect(() => {
    if (savedConversation) return;

    try {
      const stored = sessionStorage.getItem("speaking-questions");
      if (stored) {
        const parsed = JSON.parse(stored) as SpeakingQuestionData[];
        setQuestions(parsed);
        sessionStorage.removeItem("speaking-questions");
        setInitialized(true);
      } else {
        router.push("/chat");
      }
    } catch {
      router.push("/chat");
    }
  }, [router, savedConversation]);

  if (!initialized) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <SpeakingSession
        questions={questions}
        onEnd={() => router.push("/chat")}
        initialConversationId={savedConversation?.conversationId}
        initialMessages={savedConversation?.messages}
      />
    </div>
  );
}
