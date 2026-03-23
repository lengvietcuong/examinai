"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Home,
  Eye,
  Check,
  X,
  ChevronDown,
  LayoutList,
  BarChart3,
  Target,
  Link2,
  BookOpen,
  SpellCheck,
  GitCompareArrows,
  Sparkles,
  Lightbulb,
  Send,
  RotateCcw,
  AlertCircle,
  Info,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageBubble } from "@/components/chat/message-bubble";
import RobotIcon from "@/components/icons/logo";
import {
  getTask1BandDescriptors,
  getTask2BandDescriptors,
  type BandDescriptor,
} from "@/lib/data/band-descriptors";
import type { Language } from "@/lib/i18n/translations";
import type {
  WritingSubmission,
  WritingOverviewFeedback,
  WritingScoringFeedback,
  WritingLanguageFeedback,
  WritingImprovementFeedback,
  WritingImprovementTask2Feedback,
  VocabularyExplanation,
} from "@/lib/types";

export interface AssessmentData {
  overview: WritingOverviewFeedback | null;
  scoring: WritingScoringFeedback | null;
  languageAnalysis: WritingLanguageFeedback | null;
  improvement: WritingImprovementFeedback | null;
  done: boolean;
  failedSections: Record<string, string>;
}

type SectionId =
  | "overview"
  | "score"
  | "taskResponse"
  | "coherence"
  | "lexicalResource"
  | "grammaticalRange"
  | "correction"
  | "improvedVersion"
  | "alternateVersion";

interface WritingAssessmentProps {
  assessment: AssessmentData;
  submission: WritingSubmission;
  conversationId: string | null;
  initialFollowUpMessages?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>;
  onBack: () => void;
  onViewSubmission: () => void;
  onRetry?: (experts: string[]) => void;
  taskTabs: React.ReactNode;
}

// --- Utilities ---

function isTask2Feedback(
  feedback: WritingImprovementFeedback,
): feedback is WritingImprovementTask2Feedback {
  return "expandIdeas" in feedback;
}

/** Extract the plain-text content from a UIMessage's parts array. */
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// --- Word-level diff ---

type DiffOp = { type: "equal" | "insert" | "delete"; text: string };

function tokenize(text: string): string[] {
  return text.match(/\S+|\n/g) || [];
}

function computeDiff(oldText: string, newText: string): DiffOp[] {
  const oldTokens = tokenize(oldText.trim());
  const newTokens = tokenize(newText.trim());
  const n = oldTokens.length;
  const m = newTokens.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldTokens[i - 1] === newTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const ops: DiffOp[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      ops.push({ type: "equal", text: oldTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: "insert", text: newTokens[j - 1] });
      j--;
    } else {
      ops.push({ type: "delete", text: oldTokens[i - 1] });
      i--;
    }
  }
  ops.reverse();

  // Merge consecutive ops of the same type so highlights are continuous
  const merged: DiffOp[] = [];
  for (const op of ops) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) {
      last.text += " " + op.text;
    } else {
      merged.push({ ...op });
    }
  }
  return merged;
}

// --- Accordion Item (used inside a shared container) ---

function AccordionItem({
  title,
  icon,
  isOpen,
  isLoading,
  isDone,
  isLast,
  onToggle,
  badge,
  showCheckOnComplete,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isLoading: boolean;
  isDone: boolean;
  isLast: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  showCheckOnComplete?: boolean;
  children: React.ReactNode;
}) {
  // Track whether this section just transitioned from loading → done
  const [pingKey, setPingKey] = useState<number | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const wasLoadingRef = useRef(isLoading);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading && isDone) {
      if (showCheckOnComplete) {
        setShowCheck(true);
      } else if (badge) {
        setPingKey(Date.now());
      }
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, isDone, badge, showCheckOnComplete]);

  return (
    <div className={isLast ? "" : "border-b border-border"}>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
      >
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <span className="flex-1 text-base font-bold font-[family-name:var(--font-heading)] tracking-wide truncate">
          {title}
        </span>
        {isLoading && (
          <Spinner className="size-4 text-muted-foreground/60 shrink-0" />
        )}
        {!isLoading && showCheckOnComplete && showCheck && (
          <span className="flex size-5 items-center justify-center rounded-full bg-muted shrink-0 animate-bounce [animation-iteration-count:1]">
            <Check className="size-3 text-foreground" />
          </span>
        )}
        {badge && (
          <span className="relative shrink-0">
            {pingKey !== null && (
              <span
                key={pingKey}
                className="absolute inset-0 rounded-full bg-primary/30 animate-ping [animation-iteration-count:1] [animation-fill-mode:forwards] opacity-0"
                onAnimationEnd={() => setPingKey(null)}
              />
            )}
            {badge}
          </span>
        )}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {isLoading ? <SectionSkeleton /> : children}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Skeleton ---

function SectionSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      <Skeleton className="h-3.5 w-[85%]" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-[70%]" />
    </div>
  );
}

// --- Score Badge (shown in accordion header) ---

function ScoreBadge({
  score,
  isOverall,
}: {
  score: number;
  isOverall?: boolean;
}) {
  return (
    <span
      className={`flex size-8 items-center justify-center rounded-full tabular-nums text-sm font-bold font-[family-name:var(--font-heading)] shrink-0 ${
        isOverall
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-primary"
      }`}
    >
      {score}
    </span>
  );
}

// --- Bullet List ---

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
          <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground/50" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// --- Strengths & Weaknesses side by side ---

function StrengthsWeaknesses({
  strengths,
  weaknesses,
  done,
  t,
}: {
  strengths: string[];
  weaknesses: string[];
  done?: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-green-600 dark:text-green-400">
          {t.feedback.strengths}
        </h4>
        <ul className="space-y-1.5">
          {(strengths || []).map((s, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed">
              <Check className="mt-[3px] size-3.5 shrink-0 text-green-600 dark:text-green-400" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-red-600 dark:text-red-400">
          {t.feedback.weaknesses}
        </h4>
        {weaknesses && weaknesses.length > 0 ? (
          <ul className="space-y-1.5">
            {weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed">
                <X className="mt-[3px] size-3.5 shrink-0 text-red-600 dark:text-red-400" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        ) : done ? (
          <p className="text-[13px] leading-relaxed">
            {t.feedback.noWeaknesses}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// --- Section icon map ---

const SECTION_ICONS: Record<SectionId, React.ReactNode> = {
  overview: <LayoutList className="size-4 text-primary" />,
  score: <BarChart3 className="size-4 text-primary" />,
  taskResponse: <Target className="size-4 text-primary" />,
  coherence: <Link2 className="size-4 text-primary" />,
  lexicalResource: <BookOpen className="size-4 text-primary" />,
  grammaticalRange: <SpellCheck className="size-4 text-primary" />,
  correction: <GitCompareArrows className="size-4 text-primary" />,
  improvedVersion: <Sparkles className="size-4 text-primary" />,
  alternateVersion: <Lightbulb className="size-4 text-primary" />,
};

// --- Main Component ---

export function WritingAssessment({
  assessment,
  submission,
  conversationId,
  initialFollowUpMessages,
  onBack,
  onViewSubmission,
  onRetry,
  taskTabs,
}: WritingAssessmentProps) {
  const { t, language } = useI18n();
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    () => new Set(["overview"]),
  );
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Stable ref for conversation ID (may arrive after assessment completes)
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  // Chat transport — uses the same /api/chat endpoint
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ conversationId: conversationIdRef.current }),
      }),
    [],
  );

  const { messages: chatMessages, sendMessage, setMessages, status } = useChat({
    transport,
  });

  // Load initial follow-up messages (from saved conversation)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    if (initialFollowUpMessages && initialFollowUpMessages.length > 0) {
      initializedRef.current = true;
      setMessages(
        initialFollowUpMessages.map((m) => ({
          id: m.id,
          role: m.role,
          parts: [{ type: "text" as const, text: m.content }],
        })) as UIMessage[],
      );
    }
  }, [initialFollowUpMessages, setMessages]);

  const isChatLoading = status === "submitted" || status === "streaming";

  // Derive display messages from UIMessages
  const displayMessages = useMemo(() => {
    return chatMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: getMessageText(m),
      }))
      .filter((m) => m.content.trim());
  }, [chatMessages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (displayMessages.length > 0 || isChatLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayMessages, isChatLoading]);

  const { overview, scoring, languageAnalysis, improvement } = assessment;

  const overallScore = useMemo(() => {
    if (!scoring || !languageAnalysis) return null;
    const scores = [
      scoring.taskResponseScore,
      scoring.coherenceScore,
      languageAnalysis.lexicalResourceScore,
      languageAnalysis.grammaticalRangeScore,
    ];
    if (scores.some((s) => s === null)) return null;
    const avg = (scores as number[]).reduce((a, b) => a + b, 0) / 4;
    return Math.floor(avg * 2) / 2;
  }, [scoring, languageAnalysis]);

  const isTask1 = submission.taskNumber === "1";
  const taskResponseLabel = isTask1
    ? t.feedback.taskAchievement
    : t.feedback.taskResponse;

  function toggleSection(id: SectionId) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isChatLoading || !assessment.done || !conversationId) return;
    setInput("");

    // Save user message to DB
    try {
      await fetch(`/api/conversations/${conversationIdRef.current}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: text }),
      });
    } catch {
      // Non-critical
    }

    sendMessage({ text });
  }

  const sections: {
    id: SectionId;
    title: string;
    isLoading: boolean;
    isDone: boolean;
    badge?: React.ReactNode;
    showCheckOnComplete?: boolean;
  }[] = [
    { id: "overview", title: t.feedback.overview, isLoading: !overview, isDone: !!overview, showCheckOnComplete: true },
    {
      id: "score",
      title: t.feedback.bandScore,
      isLoading: !scoring || languageAnalysis?.lexicalResourceScore == null || languageAnalysis?.grammaticalRangeScore == null,
      isDone: !!scoring && languageAnalysis?.lexicalResourceScore != null && languageAnalysis?.grammaticalRangeScore != null,
      badge:
        overallScore !== null ? (
          <ScoreBadge score={overallScore} isOverall />
        ) : undefined,
    },
    {
      id: "taskResponse",
      title: taskResponseLabel,
      isLoading: !scoring,
      isDone: !!scoring,
      badge: scoring?.taskResponseScore != null ? (
        <ScoreBadge score={scoring.taskResponseScore} />
      ) : undefined,
    },
    {
      id: "coherence",
      title: t.feedback.coherenceCohesion,
      isLoading: !scoring,
      isDone: !!scoring,
      badge: scoring?.coherenceScore != null ? (
        <ScoreBadge score={scoring.coherenceScore} />
      ) : undefined,
    },
    {
      id: "lexicalResource",
      title: t.feedback.lexicalResource,
      isLoading: languageAnalysis?.lexicalResourceScore == null,
      isDone: languageAnalysis?.lexicalResourceScore != null,
      badge: languageAnalysis?.lexicalResourceScore != null ? (
        <ScoreBadge score={languageAnalysis.lexicalResourceScore} />
      ) : undefined,
    },
    {
      id: "grammaticalRange",
      title: t.feedback.grammaticalRange,
      isLoading: languageAnalysis?.grammaticalRangeScore == null,
      isDone: languageAnalysis?.grammaticalRangeScore != null,
      badge: languageAnalysis?.grammaticalRangeScore != null ? (
        <ScoreBadge score={languageAnalysis.grammaticalRangeScore} />
      ) : undefined,
    },
    {
      id: "correction",
      title: t.feedback.correction,
      isLoading: !languageAnalysis,
      isDone: !!languageAnalysis,
      showCheckOnComplete: true,
    },
    {
      id: "improvedVersion",
      title: t.feedback.improvedVersion,
      isLoading: !improvement,
      isDone: !!improvement,
      showCheckOnComplete: true,
    },
    ...(isTask1
      ? []
      : [
          {
            id: "alternateVersion" as SectionId,
            title: t.feedback.alternativeApproach,
            isLoading: !improvement,
            isDone: !!improvement,
            showCheckOnComplete: true,
          },
        ]),
  ];

  const chatEnabled = assessment.done && !!conversationId;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header bar */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border px-4 py-2.5 sm:px-6">
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Home className="size-4" />
            <span className="ml-1 hidden sm:inline">{t.common.home}</span>
          </Button>
        </div>

        {taskTabs}

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onViewSubmission}>
            <Eye className="size-4" />
            <span className="ml-1.5 hidden sm:inline">
              {t.feedback.viewSubmission}
            </span>
          </Button>
          <UserProfileMenu />
        </div>
      </header>

      {/* Full error state — no section data at all */}
      {Object.keys(assessment.failedSections).length > 0 && !overview && !scoring && !languageAnalysis && !improvement && (
        <div className="flex flex-1 items-center justify-center p-6">
          <Alert variant="destructive" className="mx-auto max-w-3xl">
            <AlertCircle />
            <AlertTitle>{t.feedback.assessmentFailed}</AlertTitle>
            <AlertDescription>{Object.values(assessment.failedSections)[0]}</AlertDescription>
            {onRetry && (
              <AlertAction>
                <Button variant="outline" size="sm" onClick={() => onRetry(Object.keys(assessment.failedSections))}>
                  <RotateCcw className="size-3.5" />
                  <span className="ml-1">{t.feedback.retry}</span>
                </Button>
              </AlertAction>
            )}
          </Alert>
        </div>
      )}

      {/* Partial error banner — some sections loaded */}
      {Object.keys(assessment.failedSections).length > 0 && (overview || scoring || languageAnalysis || improvement) && (
        <div className="mx-auto mt-3 w-full max-w-3xl px-4 sm:px-6">
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>
              {t.feedback.assessmentPartialError}
            </AlertDescription>
            {onRetry && (
              <AlertAction>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onRetry(Object.keys(assessment.failedSections))}
                >
                  <RotateCcw className="size-3.5" />
                  <span className="ml-1">{t.feedback.retry}</span>
                </Button>
              </AlertAction>
            )}
          </Alert>
        </div>
      )}

      {/* Scrollable content: assessment sections + chat messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="mx-auto max-w-3xl p-4 pb-4 sm:p-6 sm:pb-4">
          {/* Assessment sections */}
          <div className="overflow-hidden rounded-2xl">
            {sections.map((section, idx) => (
              <AccordionItem
                key={section.id}
                title={section.title}
                icon={SECTION_ICONS[section.id]}
                isOpen={openSections.has(section.id)}
                isLoading={section.isLoading}
                isDone={section.isDone}
                isLast={idx === sections.length - 1}
                onToggle={() => toggleSection(section.id)}
                badge={section.badge}
                showCheckOnComplete={section.showCheckOnComplete}
              >
                {section.id === "overview" && overview && (
                  <OverviewContent overview={overview} done={assessment.done} t={t} />
                )}
                {section.id === "score" && scoring && languageAnalysis && (
                  <ScoreContent
                    scoring={scoring}
                    languageAnalysis={languageAnalysis}
                    overallScore={overallScore!}
                    taskResponseLabel={taskResponseLabel}
                    taskNumber={submission.taskNumber}
                    language={language}
                    t={t}
                  />
                )}
                {section.id === "taskResponse" && scoring && (
                  <CriterionFeedbackContent
                    highLevel={scoring.taskResponseHighLevel}
                    strengths={scoring.taskResponseStrengths}
                    weaknesses={scoring.taskResponseWeaknesses}
                    done={assessment.done}
                    criterionKey="taskResponse"
                    criterionLabel={taskResponseLabel}
                    taskNumber={submission.taskNumber}
                    language={language}
                    t={t}
                  />
                )}
                {section.id === "coherence" && scoring && (
                  <CriterionFeedbackContent
                    highLevel={scoring.coherenceHighLevel}
                    strengths={scoring.coherenceStrengths}
                    weaknesses={scoring.coherenceWeaknesses}
                    done={assessment.done}
                    criterionKey="coherenceCohesion"
                    criterionLabel={t.feedback.coherenceCohesion}
                    taskNumber={submission.taskNumber}
                    language={language}
                    t={t}
                  />
                )}
                {section.id === "lexicalResource" && languageAnalysis && (
                  <CriterionFeedbackContent
                    highLevel={languageAnalysis.lexicalResourceHighLevel}
                    strengths={languageAnalysis.lexicalResourceStrengths}
                    weaknesses={languageAnalysis.lexicalResourceWeaknesses}
                    done={assessment.done}
                    criterionKey="lexicalResource"
                    criterionLabel={t.feedback.lexicalResource}
                    taskNumber={submission.taskNumber}
                    language={language}
                    t={t}
                  />
                )}
                {section.id === "grammaticalRange" && languageAnalysis && (
                  <CriterionFeedbackContent
                    highLevel={languageAnalysis.grammaticalRangeHighLevel}
                    strengths={languageAnalysis.grammaticalRangeStrengths}
                    weaknesses={languageAnalysis.grammaticalRangeWeaknesses}
                    done={assessment.done}
                    criterionKey="grammaticalRange"
                    criterionLabel={t.feedback.grammaticalRange}
                    taskNumber={submission.taskNumber}
                    language={language}
                    t={t}
                  />
                )}
                {section.id === "correction" && languageAnalysis && (
                  <CorrectionContent
                    languageAnalysis={languageAnalysis}
                    originalEssay={submission.essay}
                    t={t}
                  />
                )}
                {section.id === "improvedVersion" && improvement && (
                  <ImprovedVersionContent improvement={improvement} t={t} />
                )}
                {section.id === "alternateVersion" &&
                  improvement &&
                  !isTask1 &&
                  isTask2Feedback(improvement) && (
                    <AlternateVersionContent improvement={improvement} t={t} />
                  )}
              </AccordionItem>
            ))}
          </div>

          {/* Follow-up chat messages */}
          {displayMessages.length > 0 && (
            <div className="mt-6 space-y-4">
              {displayMessages.map((msg, index) => {
                const isLastAssistant =
                  msg.role === "assistant" &&
                  index === displayMessages.length - 1;
                return (
                  <MessageBubble
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    isStreaming={isLastAssistant && isChatLoading}
                  />
                );
              })}

              {isChatLoading &&
                displayMessages[displayMessages.length - 1]?.role !==
                  "assistant" && (
                  <div className="flex gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <RobotIcon className="size-4 fill-foreground" />
                    </div>
                    <div className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Chat input */}
      <div className="shrink-0 bg-background px-3 pb-3 sm:px-4 sm:pb-4">
        <form
          onSubmit={handleSendMessage}
          className="mx-auto max-w-3xl relative"
        >
          <div
            className={`relative flex items-center rounded-full border bg-background transition-all overflow-hidden ${
              chatEnabled
                ? "focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50"
                : "opacity-50"
            }`}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                chatEnabled
                  ? t.chat.typeMessage
                  : t.feedback.waitingForFeedback
              }
              disabled={!chatEnabled}
              className="min-h-0 max-h-[120px] w-full resize-none border-0 focus-visible:ring-0 px-4 py-2.5 text-sm shadow-none bg-transparent"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <div className="flex items-center pr-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0 size-8 text-muted-foreground hover:text-foreground"
                type="submit"
                disabled={!input.trim() || !chatEnabled || isChatLoading}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </form>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/70">
          {t.common.aiDisclaimer}
        </p>
      </div>
    </div>
  );
}

// --- Section Content ---

function OverviewContent({
  overview,
  done,
  t,
}: {
  overview: WritingOverviewFeedback;
  done?: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-relaxed text-foreground/90">
        {overview.overview}
      </p>
      <StrengthsWeaknesses
        strengths={overview.strengths}
        weaknesses={overview.weaknesses}
        done={done}
        t={t}
      />
    </div>
  );
}

function CriterionFeedbackContent({
  highLevel,
  strengths,
  weaknesses,
  done,
  criterionKey,
  criterionLabel,
  taskNumber,
  language,
  t,
}: {
  highLevel: string;
  strengths: string[];
  weaknesses: string[];
  done?: boolean;
  criterionKey: keyof Omit<BandDescriptor, "band">;
  criterionLabel: string;
  taskNumber: string;
  language: Language;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const bandDescriptors =
    taskNumber === "1" ? getTask1BandDescriptors(language) : getTask2BandDescriptors(language);

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="size-3.5" />
          <span>{t.feedback.viewBandDescriptors}</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">
              {criterionLabel} &mdash; Task {taskNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {bandDescriptors.map((descriptor) => (
              <div
                key={descriptor.band}
                className="rounded-xl border border-border overflow-hidden"
              >
                <div className="flex items-center gap-3 bg-muted/50 px-4 py-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold font-[family-name:var(--font-heading)] tabular-nums shrink-0">
                    {descriptor.band}
                  </span>
                </div>
                <div className="p-3 space-y-1">
                  <ul className="space-y-1">
                    {descriptor[criterionKey].split("\n").map((line, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-[12px] leading-relaxed"
                      >
                        <span className="mt-[6px] size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <p className="text-[13px] leading-relaxed text-foreground/90">
        {highLevel}
      </p>
      <StrengthsWeaknesses
        strengths={strengths}
        weaknesses={weaknesses}
        done={done}
        t={t}
      />
    </div>
  );
}

function ScoreContent({
  scoring,
  languageAnalysis,
  overallScore,
  taskResponseLabel,
  taskNumber,
  language,
  t,
}: {
  scoring: WritingScoringFeedback;
  languageAnalysis: WritingLanguageFeedback;
  overallScore: number | null;
  taskResponseLabel: string;
  taskNumber: string;
  language: Language;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const criteria = [
    { label: taskResponseLabel, score: scoring.taskResponseScore },
    { label: t.feedback.coherenceCohesion, score: scoring.coherenceScore },
    {
      label: t.feedback.lexicalResource,
      score: languageAnalysis.lexicalResourceScore,
    },
    {
      label: t.feedback.grammaticalRange,
      score: languageAnalysis.grammaticalRangeScore,
    },
  ];

  const allScores = [
    { label: t.feedback.overall, score: overallScore, isOverall: true },
    ...criteria.map((c) => ({ ...c, isOverall: false })),
  ];

  const bandDescriptors =
    taskNumber === "1" ? getTask1BandDescriptors(language) : getTask2BandDescriptors(language);
  const taskResponseColumnLabel =
    taskNumber === "1" ? t.feedback.taskAchievement : t.feedback.taskResponse;

  return (
    <div>
      <Dialog>
        <DialogTrigger
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <Info className="size-3.5" />
          <span>{t.feedback.viewBandDescriptors}</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">
              {t.feedback.bandDescriptors} &mdash; Task {taskNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {bandDescriptors.map((descriptor) => (
              <div
                key={descriptor.band}
                className="rounded-xl border border-border overflow-hidden"
              >
                <div className="flex items-center gap-3 bg-muted/50 px-4 py-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold font-[family-name:var(--font-heading)] tabular-nums shrink-0">
                    {descriptor.band}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
                  {[
                    {
                      label: taskResponseColumnLabel,
                      text: descriptor.taskResponse,
                    },
                    {
                      label: t.feedback.coherenceCohesion,
                      text: descriptor.coherenceCohesion,
                    },
                    {
                      label: t.feedback.lexicalResource,
                      text: descriptor.lexicalResource,
                    },
                    {
                      label: t.feedback.grammaticalRange,
                      text: descriptor.grammaticalRange,
                    },
                  ].map((criterion) => (
                    <div
                      key={criterion.label}
                      className="bg-background p-3 space-y-1.5"
                    >
                      <h5 className="text-[10px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-muted-foreground">
                        {criterion.label}
                      </h5>
                      <ul className="space-y-1">
                        {criterion.text.split("\n").map((line, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-[12px] leading-relaxed"
                          >
                            <span className="mt-[6px] size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex gap-3">
        {allScores.map((item) => (
          <div
            key={item.label}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <div
              className={`flex w-full aspect-square items-center justify-center rounded-xl ${
                item.isOverall ? "bg-primary" : "bg-muted"
              }`}
            >
              {item.score != null ? (
                <span
                  className={`text-4xl font-bold font-[family-name:var(--font-heading)] tabular-nums ${
                    item.isOverall ? "text-primary-foreground" : "text-primary"
                  }`}
                >
                  {item.score}
                </span>
              ) : (
                <span
                  className={`text-4xl font-bold font-[family-name:var(--font-heading)] ${
                    item.isOverall ? "text-primary-foreground/40" : "text-primary/30"
                  }`}
                >
                  -
                </span>
              )}
            </div>
            <span className="text-[10px] text-center font-medium leading-tight text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CorrectionContent({
  languageAnalysis,
  originalEssay,
  t,
}: {
  languageAnalysis: WritingLanguageFeedback;
  originalEssay: string;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const diffOps = useMemo(
    () => computeDiff(originalEssay, languageAnalysis.correctedEssay),
    [originalEssay, languageAnalysis.correctedEssay],
  );

  const leftSpans = diffOps
    .filter((op) => op.type === "equal" || op.type === "delete")
    .map((op, i) =>
      op.type === "delete" ? (
        <span
          key={i}
          className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 rounded-sm px-0.5"
        >
          {op.text}
        </span>
      ) : (
        <span key={i}>{op.text}</span>
      ),
    );

  const rightSpans = diffOps
    .filter((op) => op.type === "equal" || op.type === "insert")
    .map((op, i) =>
      op.type === "insert" ? (
        <span
          key={i}
          className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 rounded-sm px-0.5"
        >
          {op.text}
        </span>
      ) : (
        <span key={i}>{op.text}</span>
      ),
    );

  function interleave(spans: React.ReactNode[]) {
    const result: React.ReactNode[] = [];
    spans.forEach((span, i) => {
      if (i > 0) result.push(" ");
      result.push(span);
    });
    return result;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-0">
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-primary">
            {t.feedback.original}
          </h4>
          <p className="text-[13px] leading-[1.8]">
            {interleave(leftSpans)}
          </p>
        </div>

        <div className="hidden lg:block w-px bg-border mx-5" />
        <div className="block lg:hidden h-px bg-border my-4" />

        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-primary">
            {t.feedback.corrected}
          </h4>
          <p className="text-[13px] leading-[1.8]">
            {interleave(rightSpans)}
          </p>
        </div>
      </div>

      {languageAnalysis.keyChanges.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-primary">
            {t.feedback.keyChanges}
          </h4>
          <BulletList items={languageAnalysis.keyChanges} />
        </div>
      )}
    </div>
  );
}

function ImprovedVersionContent({
  improvement,
  t,
}: {
  improvement: WritingImprovementFeedback;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const isTask2 = isTask2Feedback(improvement);

  return (
    <div className="space-y-4">
      {isTask2 && improvement.expandIdeas.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-primary">
            {t.feedback.expandIdeas}
          </h4>
          <BulletList items={improvement.expandIdeas} />
        </div>
      )}

      {isTask2 && improvement.expandIdeas.length > 0 && (
        <hr className="border-border" />
      )}

      <EssayParagraphs text={improvement.improvedEssay} />

      {improvement.vocabularyExplanations.length > 0 && (
        <VocabularyList
          items={improvement.vocabularyExplanations}
          label={t.feedback.vocabularyExplanations}
        />
      )}
    </div>
  );
}

function AlternateVersionContent({
  improvement,
  t,
}: {
  improvement: WritingImprovementTask2Feedback;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
          {t.feedback.alternativeDirection}
        </h4>
        <p className="text-[13px] leading-relaxed text-foreground/90">
          {improvement.alternativeDirection}
        </p>
      </div>

      <hr className="border-border" />

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
          {t.feedback.alternativeEssay}
        </h4>
        <EssayParagraphs text={improvement.alternativeEssay} />
      </div>

      {improvement.alternativeVocabulary.length > 0 && (
        <>
          <hr className="border-border" />
          <VocabularyList
            items={improvement.alternativeVocabulary}
            label={t.feedback.vocabularyExplanations}
          />
        </>
      )}
    </div>
  );
}

function EssayParagraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  if (paragraphs.length <= 1) {
    return (
      <p className="whitespace-pre-wrap text-[13px] leading-[1.8]">{text}</p>
    );
  }
  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-[13px] leading-[1.8]">
          {para.trim()}
        </p>
      ))}
    </div>
  );
}

function VocabularyList({
  items,
  label,
}: {
  items: VocabularyExplanation[];
  label: string;
}) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-[11px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-primary">
        {label}
      </h4>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-lg border border-border p-3 text-[13px] leading-relaxed">
            <div>
              <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 font-semibold text-foreground">
                {item.word}
              </span>
              <span className="text-muted-foreground">: </span>
              <span>{item.meaning}</span>
            </div>
            {item.usage && (
              <p className="mt-1 text-[12px] italic text-muted-foreground">
                e.g. &ldquo;{item.usage}&rdquo;
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
