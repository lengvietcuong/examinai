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

const SPEAKING_SESSION_KEY = "examinai-speaking-active";

function readSpeakingQuestions(): SpeakingQuestionData[] | null {
  try {
    const raw = localStorage.getItem(SPEAKING_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { questions?: SpeakingQuestionData[] };
    return Array.isArray(parsed.questions) ? parsed.questions : null;
  } catch {
    return null;
  }
}

function writeSpeakingQuestions(questions: SpeakingQuestionData[]) {
  try {
    localStorage.setItem(SPEAKING_SESSION_KEY, JSON.stringify({ questions }));
  } catch {
    // Persistence is best effort.
  }
}

function clearSpeakingQuestions() {
  try {
    localStorage.removeItem(SPEAKING_SESSION_KEY);
  } catch {
    // Persistence is best effort.
  }
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
    if (savedConversation) {
      clearSpeakingQuestions();
      return;
    }

    try {
      const stored = sessionStorage.getItem("speaking-questions");
      if (stored) {
        const parsed = JSON.parse(stored) as SpeakingQuestionData[];
        setQuestions(parsed);
        writeSpeakingQuestions(parsed);
        sessionStorage.removeItem("speaking-questions");
        setInitialized(true);
        return;
      }

      const localQuestions = readSpeakingQuestions();
      if (localQuestions?.length) {
        setQuestions(localQuestions);
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
        onEnd={() => {
          clearSpeakingQuestions();
          router.push("/chat");
        }}
        onConversationReady={(conversationId) => {
          clearSpeakingQuestions();
          router.replace(`/speaking?conversation_id=${conversationId}`);
        }}
        initialConversationId={savedConversation?.conversationId}
        initialMessages={savedConversation?.messages}
      />
    </div>
  );
}
