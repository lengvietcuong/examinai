"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { WritingTest } from "@/components/writing/writing-test";
import {
  WritingAssessment,
  type AssessmentData,
} from "@/components/writing/writing-assessment";
import { WritingSubmissionView } from "@/components/writing/writing-submission-view";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/lib/i18n/provider";
import { supabase } from "@/lib/supabase/client";
import type { WritingSubmission } from "@/lib/types";

interface WritingQuestion {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  taskNumber: "1" | "2";
}

interface SavedConversation {
  conversationId: string;
  submission: WritingSubmission;
  assessment: AssessmentData;
  followUpMessages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>;
}

type PageView = "test" | "assessment" | "submission";

function createEmptyAssessment(): AssessmentData {
  return {
    overview: null,
    scoring: null,
    languageAnalysis: null,
    improvement: null,
    done: false,
    failedSections: {},
  };
}

export default function WritingPageClient({
  initialQuestions,
  savedConversation,
}: {
  initialQuestions: WritingQuestion[] | null;
  savedConversation?: SavedConversation;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [pageView, setPageView] = useState<PageView>(
    savedConversation ? "assessment" : "test",
  );
  const [questions] = useState<WritingQuestion[]>(
    initialQuestions ?? [],
  );
  const [initialized, setInitialized] = useState(
    !!initialQuestions || !!savedConversation,
  );

  const [assessments, setAssessments] = useState<
    Array<{
      assessment: AssessmentData;
      submission: WritingSubmission;
      conversationId: string | null;
    }>
  >(
    savedConversation
      ? [
          {
            assessment: savedConversation.assessment,
            submission: savedConversation.submission,
            conversationId: savedConversation.conversationId,
          },
        ]
      : [],
  );
  const [initialFollowUpMessages] = useState(
    savedConversation?.followUpMessages ?? [],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const abortControllersRef = useRef<AbortController[]>([]);
  const userIdRef = useRef<string | null>(null);

  // Get current user ID for saving conversations
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) userIdRef.current = data.session.user.id;
    });
  }, []);

  // Handle submission flow (no initialQuestions — data comes from sessionStorage)
  useEffect(() => {
    if (initialQuestions || savedConversation) return;

    try {
      const storedSubmission = sessionStorage.getItem("writing-submission");
      if (storedSubmission) {
        const submission = JSON.parse(storedSubmission) as WritingSubmission;
        sessionStorage.removeItem("writing-submission");
        setInitialized(true);
        startAssessment([submission]);
        return;
      }

      // No questions from server, no submission in sessionStorage → go home
      router.push("/chat");
    } catch {
      router.push("/chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, initialQuestions, savedConversation]);

  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach((c) => c.abort());
    };
  }, []);

  const startAssessment = useCallback((submissions: WritingSubmission[]) => {
    const valid = submissions.filter((s) => s.essay.trim());
    if (valid.length === 0) return;

    const initial = valid.map((sub) => ({
      assessment: createEmptyAssessment(),
      submission: sub,
      conversationId: null as string | null,
    }));
    setAssessments(initial);
    setActiveIndex(0);
    setPageView("assessment");

    const controllers: AbortController[] = [];
    valid.forEach((sub, idx) => {
      const controller = new AbortController();
      controllers.push(controller);
      streamAssessment(sub, idx, controller.signal);
    });
    abortControllersRef.current = controllers;
  }, []);

  async function streamAssessment(
    submission: WritingSubmission,
    index: number,
    signal: AbortSignal,
    sections?: string[],
  ) {
    try {
      // Ensure we have the userId before making the request — the auth
      // effect may not have resolved yet (race condition on quick submissions)
      if (!userIdRef.current) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          userIdRef.current = data.session.user.id;
        }
      }

      const res = await fetch("/api/writing/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...submission,
          userId: userIdRef.current,
          ...(sections ? { sections } : {}),
        }),
        signal,
      });

      if (!res.ok) {
        const sectionsToFail = sections ?? ["overview", "scoring", "languageAnalysis", "improvement"];
        setAssessments((prev) => {
          const next = [...prev];
          const failed = { ...next[index].assessment.failedSections };
          for (const s of sectionsToFail) {
            failed[s] = `Failed to assess essay: ${res.statusText}`;
          }
          next[index] = {
            ...next[index],
            assessment: {
              ...next[index].assessment,
              failedSections: failed,
              done: true,
            },
          };
          return next;
        });
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      function processLines(lines: string[]) {
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            const { type, data } = event;

            setAssessments((prev) => {
              const next = [...prev];
              const current = { ...next[index] };
              const assessment = { ...current.assessment };

              switch (type) {
                case "overview":
                  assessment.overview = data;
                  break;
                case "scoring":
                  assessment.scoring = data;
                  break;
                case "languageAnalysis":
                  assessment.languageAnalysis = data;
                  break;
                case "improvement":
                  assessment.improvement = data;
                  break;
                case "done":
                  assessment.done = true;
                  // Save the conversation ID returned from the server
                  if (data.conversationId) {
                    current.conversationId = data.conversationId;
                  }
                  break;
                case "section_error": {
                  const failed = { ...assessment.failedSections };
                  failed[data.section] = data.message;
                  assessment.failedSections = failed;
                  break;
                }
              }

              current.assessment = assessment;
              next[index] = current;
              return next;
            });
          } catch {
            // skip
          }
        }
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        processLines(lines);
      }

      // Flush remaining buffer (e.g. if stream closed before trailing newline)
      if (buffer.trim()) {
        processLines([buffer]);
      }

      // If stream ended without a "done" event, mark as done so chat is unlocked
      setAssessments((prev) => {
        const next = [...prev];
        if (!next[index].assessment.done) {
          const current = { ...next[index] };
          current.assessment = { ...current.assessment, done: true };
          next[index] = current;
        }
        return next;
      });
    } catch (err) {
      if (signal.aborted) return;
      const sectionsToFail = sections ?? ["overview", "scoring", "languageAnalysis", "improvement"];
      setAssessments((prev) => {
        const next = [...prev];
        const failed = { ...next[index].assessment.failedSections };
        const message = err instanceof Error ? err.message : "Assessment failed";
        for (const s of sectionsToFail) {
          failed[s] = message;
        }
        next[index] = {
          ...next[index],
          assessment: {
            ...next[index].assessment,
            failedSections: failed,
            done: true,
          },
        };
        return next;
      });
    }
  }

  function handleSubmit(subs: WritingSubmission[]) {
    startAssessment(subs);
  }

  function handleBack() {
    abortControllersRef.current.forEach((c) => c.abort());
    router.push("/chat");
  }

  if (!initialized) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  // Shared task tab pills (used in both assessment and submission views)
  const taskTabs =
    assessments.length > 1 ? (
      <div className="flex gap-1 rounded-4xl bg-muted p-1">
        {assessments.map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`rounded-4xl px-4 py-1.5 text-sm font-medium font-[family-name:var(--font-heading)] transition-all ${
              activeIndex === i
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.submission.taskNumber === "1"
              ? t.writing.task1
              : t.writing.task2}
          </button>
        ))}
      </div>
    ) : (
      <div />
    );

  if (pageView === "submission" && assessments.length > 0) {
    const active = assessments[activeIndex];
    return (
      <div className="flex h-dvh flex-col">
        <WritingSubmissionView
          submission={active.submission}
          onViewFeedback={() => setPageView("assessment")}
          onHome={handleBack}
          taskTabs={taskTabs}
          t={t}
        />
      </div>
    );
  }

  if (
    (pageView === "assessment" || pageView === "submission") &&
    assessments.length > 0
  ) {
    const active = assessments[activeIndex];
    return (
      <div className="flex h-dvh flex-col">
        <WritingAssessment
          assessment={active.assessment}
          submission={active.submission}
          conversationId={active.conversationId}
          initialFollowUpMessages={
            activeIndex === 0 ? initialFollowUpMessages : []
          }
          onBack={handleBack}
          onViewSubmission={() => setPageView("submission")}
          onRetry={(sections) => {
            const controller = new AbortController();
            abortControllersRef.current[activeIndex] = controller;
            setAssessments((prev) => {
              const next = [...prev];
              const current = { ...next[activeIndex] };
              const assessment = { ...current.assessment };
              // Clear only the failed sections so they re-stream
              for (const s of sections) {
                assessment[s as keyof Pick<AssessmentData, "overview" | "scoring" | "languageAnalysis" | "improvement">] = null;
              }
              // Remove them from failedSections
              const failed = { ...assessment.failedSections };
              for (const s of sections) {
                delete failed[s];
              }
              assessment.failedSections = failed;
              assessment.done = false;
              current.assessment = assessment;
              next[activeIndex] = current;
              return next;
            });
            streamAssessment(
              assessments[activeIndex].submission,
              activeIndex,
              controller.signal,
              sections,
            );
          }}
          taskTabs={taskTabs}
        />
      </div>
    );
  }

  return (
    <WritingTest
      questions={questions}
      onSubmit={handleSubmit}
      onBack={handleBack}
    />
  );
}
