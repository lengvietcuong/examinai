"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  Home,
  Mic,
  Square,
  Play,
  Pause,
  Eye,
  EyeOff,
  Send,
  Lightbulb,
  BookOpen,
  GitCompareArrows,
  Sparkles,
  LayoutList,
  Volume2,
  Loader,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import RobotIcon from "@/components/icons/logo";
import { UserProfileMenu } from "@/components/user-profile-menu";
import ReactMarkdown from "react-markdown";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { SpeakingQuestionData, SpeakingFeedback } from "@/lib/types";

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = { new (): SpeechRecognitionInstance };

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

interface SpeakingSessionProps {
  questions: SpeakingQuestionData[];
  onEnd: () => void;
  initialConversationId?: string;
  initialMessages?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>;
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function parseFeedback(content: string): SpeakingFeedback | null {
  // Try raw JSON first
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed.comment === "string") {
      return parsed as SpeakingFeedback;
    }
  } catch {
    // Not raw JSON — try extracting from markdown code blocks or surrounding text
  }

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1]);
      if (parsed && typeof parsed.comment === "string") {
        return parsed as SpeakingFeedback;
      }
    } catch {
      // Not valid JSON inside fence
    }
  }

  // Try extracting the first JSON object from the text
  const braceStart = content.indexOf("{");
  const braceEnd = content.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    try {
      const parsed = JSON.parse(content.slice(braceStart, braceEnd + 1));
      if (parsed && typeof parsed.comment === "string") {
        return parsed as SpeakingFeedback;
      }
    } catch {
      // Not valid JSON
    }
  }

  return null;
}

/* ─── Word-level diff (same as writing assessment) ─── */
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

/* ─── Cue card helpers ─── */
const CUE_CARD_RE = /```\s*([\s\S]*?)\s*```/;

function parseCueCard(text: string): { cueCard: string; rest: string } | null {
  const match = text.match(CUE_CARD_RE);
  if (!match) return null;
  return {
    cueCard: match[1].trim(),
    rest: text.replace(CUE_CARD_RE, "").trim(),
  };
}

function CueCard({ content }: { content: string }) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const title = lines[0]?.replace(/^\*\*(.+)\*\*$/, "$1") ?? "";
  const bullets = lines.slice(1).map((l) => l.replace(/^[-*]\s*/, ""));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-muted">
      <div className="px-5 pt-5 pb-4">
        <p className="text-[15px] font-semibold leading-snug text-foreground">
          {title}
        </p>
      </div>
      {bullets.length > 0 && (
        <div className="border-t border-muted px-5 py-3.5">
          <p className="text-xs font-medium text-muted-foreground mb-2">You should say:</p>
          <ul className="space-y-1.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Audio question bubble ─── */
const WAVEFORM_BAR_COUNT = 48;

function QuestionBubble({
  text,
  messageId,
  playingAudio,
  onPlay,
  onSeek,
  isTextVisible,
  onToggleText,
  waveform,
  audioElement,
}: {
  text: string;
  messageId: string;
  playingAudio: string | null;
  onPlay: (text: string, id: string) => void;
  onSeek: (messageId: string, fraction: number) => void;
  isTextVisible: boolean;
  onToggleText: (id: string) => void;
  waveform: number[] | null;
  audioElement: HTMLAudioElement | null;
}) {
  const { t } = useI18n();
  const isPlaying = playingAudio === messageId;
  const barsContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  // Animate progress coloring via direct DOM updates (no re-renders)
  useEffect(() => {
    if (!waveform) return;
    const container = barsContainerRef.current;
    if (!container) return;
    const barElements = container.children;

    function updateProgress() {
      let progress = 0;
      if (audioElement && audioElement.duration) {
        progress = audioElement.currentTime / audioElement.duration;
      }

      for (let i = 0; i < barElements.length; i++) {
        const barProgress = (i + 0.5) / WAVEFORM_BAR_COUNT;
        const el = barElements[i] as HTMLElement;
        if (barProgress <= progress) {
          el.dataset.played = "true";
        } else {
          delete el.dataset.played;
        }
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(updateProgress);
      }
    }

    updateProgress();

    // Update waveform visually when seeking (e.g. while paused)
    if (audioElement) {
      audioElement.addEventListener("seeked", updateProgress);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioElement) {
        audioElement.removeEventListener("seeked", updateProgress);
      }
    };
  }, [isPlaying, waveform, audioElement]);

  const parsed = useMemo(() => parseCueCard(text), [text]);
  const spokenText = parsed ? parsed.rest || text : text;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
        <button
          type="button"
          onClick={() => onPlay(spokenText, messageId)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
        </button>
        {waveform ? (
          <div
            ref={barsContainerRef}
            className="flex flex-1 items-center gap-[3px] cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              onSeek(messageId, fraction);
            }}
          >
            {waveform.map((ratio, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-muted-foreground/40 transition-colors duration-75 data-[played]:bg-foreground"
                style={{
                  height: `${Math.max(3, ratio * 44)}px`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center h-[44px] gap-1">
            <Loader className="size-4 animate-spin text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">{t.speaking.preparingQuestion}</span>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onToggleText(messageId)}
          className="flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {isTextVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          <span>{isTextVisible ? t.speaking.hideText : t.speaking.showText}</span>
        </button>
      </div>
      {isTextVisible && (
        <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm leading-relaxed text-foreground/80 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
          <ReactMarkdown>{spokenText}</ReactMarkdown>
        </div>
      )}
      {parsed && <CueCard content={parsed.cueCard} />}
    </div>
  );
}

/* ─── Feedback section item ─── */
function FeedbackSectionItem({
  title,
  icon,
  isLast,
  onSpeak,
  audioState = "idle",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isLast: boolean;
  onSpeak?: () => void;
  audioState?: "idle" | "loading" | "playing";
  children: React.ReactNode;
}) {
  return (
    <div className={isLast ? "" : "border-b border-border/50"}>
      <div className="flex w-full items-center gap-2 px-2 py-3.5">
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <span className="text-[13px] font-bold font-[family-name:var(--font-heading)] tracking-wide truncate">
          {title}
        </span>
        {onSpeak && (
          <span
            role="button"
            tabIndex={0}
            onClick={() => {
              if (audioState !== "loading") onSpeak();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (audioState !== "loading") onSpeak();
              }
            }}
            className={`shrink-0 flex items-center justify-center size-7 rounded-full text-muted-foreground/70 transition-colors ${
              audioState === "loading" ? "cursor-wait" : "hover:bg-muted-foreground/10 hover:text-foreground"
            }`}
          >
            {audioState === "loading" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : audioState === "playing" ? (
              <Pause className="size-3.5" />
            ) : (
              <Volume2 className="size-3.5" />
            )}
          </span>
        )}
      </div>
      <div className="px-2 pb-4">{children}</div>
    </div>
  );
}

/* ─── Feedback wrapper (collapsible) ─── */
function FeedbackGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Accordion defaultValue={[0]} className="rounded-xl border-none">
      <AccordionItem className="data-open:bg-transparent">
        <AccordionTrigger className="rounded-xl bg-muted hover:no-underline">
          <span className="flex-1 text-sm font-bold font-[family-name:var(--font-heading)] tracking-wide">
            {label}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/* ─── Feedback section ─── */
function FeedbackCard({ feedback, originalResponse, onSpeak, playingAudioKey, loadingAudioKeys, messageId }: { feedback: SpeakingFeedback; originalResponse: string; onSpeak: (text: string, audioKey: string) => void; playingAudioKey: string | null; loadingAudioKeys: Set<string>; messageId: string }) {
  const { t } = useI18n();

  const diffOps = useMemo(
    () =>
      feedback.correctedResponse && originalResponse
        ? computeDiff(originalResponse, feedback.correctedResponse)
        : [],
    [originalResponse, feedback.correctedResponse],
  );

  const filteredVocabulary = useMemo(() => {
    if (!feedback.vocabularyExplanations?.length || !originalResponse) return feedback.vocabularyExplanations || [];
    const responseLower = originalResponse.toLowerCase();
    return feedback.vocabularyExplanations.filter(
      (v) => !responseLower.includes(v.word.toLowerCase()),
    );
  }, [feedback.vocabularyExplanations, originalResponse]);

  const sections = [
    {
      id: "comment",
      title: t.feedback.overview,
      icon: <LayoutList className="size-4 text-primary" />,
      hasContent: !!feedback.comment,
      speakText: feedback.comment,
      audioKey: `${messageId}-speak-comment`,
    },
    {
      id: "corrected",
      title: t.feedback.correction,
      icon: <GitCompareArrows className="size-4 text-primary" />,
      hasContent: !!feedback.correctedResponse,
      speakText: feedback.correctedResponse,
      audioKey: `${messageId}-speak-corrected`,
    },
    {
      id: "expansion",
      title: t.feedback.expandIdeas,
      icon: <Lightbulb className="size-4 text-primary" />,
      hasContent: !!(feedback.expansionIdeas && feedback.expansionIdeas.length > 0),
      speakText: feedback.expansionIdeas?.join(". ") || "",
      audioKey: `${messageId}-speak-expansion`,
    },
    {
      id: "improved",
      title: t.feedback.improvedVersion,
      icon: <Sparkles className="size-4 text-primary" />,
      hasContent: !!feedback.improvedResponse,
      speakText: feedback.improvedResponse,
      audioKey: `${messageId}-speak-improved`,
    },
    {
      id: "vocabulary",
      title: t.feedback.vocabularyExplanations,
      icon: <BookOpen className="size-4 text-primary" />,
      hasContent: filteredVocabulary.length > 0,
      speakText: filteredVocabulary.map((v) => `${v.word}: ${v.meaning}${v.usage ? `. For example: ${v.usage}` : ""}`).join(". ") || "",
      audioKey: `${messageId}-speak-vocabulary`,
    },
  ].filter((s) => s.hasContent);

  return (
    <div>
      {sections.map((section, idx) => (
        <FeedbackSectionItem
          key={section.id}
          title={section.title}
          icon={section.icon}
          isLast={idx === sections.length - 1}
          onSpeak={section.speakText ? () => onSpeak(section.speakText, section.audioKey) : undefined}
          audioState={
            loadingAudioKeys.has(section.audioKey) ? "loading" :
            playingAudioKey === section.audioKey ? "playing" : "idle"
          }
        >
          {section.id === "comment" && (
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {feedback.comment}
            </p>
          )}

          {section.id === "corrected" && diffOps.length > 0 && (() => {
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
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-0">
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-muted-foreground">
                    {t.feedback.original}
                  </h4>
                  <p className="text-[13px] leading-[1.8]">
                    {interleave(leftSpans)}
                  </p>
                </div>
                <div className="hidden lg:block w-px bg-border mx-5" />
                <div className="block lg:hidden h-px bg-border my-4" />
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold font-[family-name:var(--font-heading)] uppercase tracking-wider text-muted-foreground">
                    {t.feedback.corrected}
                  </h4>
                  <p className="text-[13px] leading-[1.8]">
                    {interleave(rightSpans)}
                  </p>
                </div>
              </div>
            );
          })()}

          {section.id === "expansion" && (
            <ul className="space-y-2">
              {feedback.expansionIdeas.map((idea, i) => (
                <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          )}

          {section.id === "improved" && (
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {feedback.improvedResponse}
            </p>
          )}

          {section.id === "vocabulary" && (
            <ul className="space-y-3">
              {filteredVocabulary.map((vocab, i) => (
                <li key={i} className="text-[13px] leading-relaxed">
                  <div>
                    <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 font-semibold text-foreground">
                      {vocab.word}
                    </span>
                    <span className="text-muted-foreground">: </span>
                    <span>{vocab.meaning}</span>
                  </div>
                  {vocab.usage && (
                    <p className="mt-1 text-[12px] italic text-muted-foreground">
                      e.g. &ldquo;{vocab.usage}&rdquo;
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </FeedbackSectionItem>
      ))}
    </div>
  );
}

/* ─── Main session component ─── */
export function SpeakingSession({ questions, onEnd, initialConversationId, initialMessages }: SpeakingSessionProps) {
  const { t } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [visibleTexts, setVisibleTexts] = useState<Set<string>>(new Set());
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const hasSentInitial = useRef(!!initialMessages);
  const [waitingForFirstQuestion, setWaitingForFirstQuestion] = useState(!initialMessages);
  const hasInitializedRestore = useRef(false);
  const autoplayedMessages = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const [waveformData, setWaveformData] = useState<Record<string, number[]>>({});
  const audioCacheRef = useRef<Map<string, string>>(new Map()); // messageId -> blob URL
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map()); // messageId -> audio element
  const audioFetchingRef = useRef<Set<string>>(new Set());
  const [loadingAudioKeys, setLoadingAudioKeys] = useState<Set<string>>(new Set());
  const [readyForNextQuestion, setReadyForNextQuestion] = useState<Set<string>>(new Set());

  // Conversation persistence
  const conversationIdRef = useRef<string | null>(initialConversationId ?? null);

  // STT refs (Web Speech API)
  const sttRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const sttFinalTranscriptRef = useRef(""); // accumulated final results
  const sttPrefixTextRef = useRef(""); // text that existed before recording started
  const sttGenerationRef = useRef(0); // incremented on send to discard stale results
  const cueCardRetryRef = useRef<string | null>(null); // message ID that was already retried for missing cue card

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/speaking",
        body: () => ({ questions, conversationId: conversationIdRef.current }),
      }),
    [questions],
  );

  const chatInitialMessages = useMemo(() => {
    if (!initialMessages) return undefined;
    return initialMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content }],
    }));
  }, [initialMessages]);

  const { messages, sendMessage, regenerate, status } = useChat({
    transport,
    messages: chatInitialMessages,
  });
  const isLoading = status === "submitted" || status === "streaming";

  // Re-generate if a Part 2 response is missing the cue card (no backticks)
  useEffect(() => {
    if (isLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;
    if (cueCardRetryRef.current === lastMessage.id) return; // already retried this message

    const msgText = getMessageText(lastMessage);
    if (!msgText) return;

    const hasBackticks = msgText.includes("```");
    const feedback = parseFeedback(msgText);

    let needsCueCard = false;
    if (feedback) {
      // Feedback with a Part 2 next question that's missing the cue card
      if (feedback.nextQuestionPartNumber === "2" && feedback.nextQuestion && !feedback.nextQuestion.includes("```")) {
        needsCueCard = true;
      }
    } else {
      // Plain question message (first question) — check if it mentions Part 2 but has no cue card
      if (/part\s*2/i.test(msgText) && !hasBackticks) {
        needsCueCard = true;
      }
    }

    if (needsCueCard) {
      cueCardRetryRef.current = lastMessage.id;
      regenerate();
    }
  }, [messages, isLoading, regenerate]);

  // Initialize conversation and trigger first AI message on mount
  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // Not logged in — still send the initial message so the session works
        if (!hasSentInitial.current) {
          hasSentInitial.current = true;
          sendMessage({ text: "Begin" });
        }
        return;
      }
      setUserId(data.user.id);

      // Fetch autoplay preference
      try {
        const res = await fetch(`/api/profile?userId=${data.user.id}`);
        const profile = await res.json();
        if (profile && typeof profile.speakingAutoplay === "boolean") {
          setAutoplay(profile.speakingAutoplay);
        }
      } catch {
        // Use default
      }

      // Create conversation if not loading a saved one
      if (!conversationIdRef.current) {
        try {
          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: data.user.id,
              type: "speaking",
              title: "Speaking Practice",
            }),
          });
          if (res.ok) {
            const conv = await res.json();
            conversationIdRef.current = conv.id;

            // Name the conversation after the first question's topic
            fetch("/api/chat/name", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: questions[0].content,
                conversationId: conv.id,
              }),
            }).catch(() => {});

            // Save the questions config as the first system message
            await fetch(`/api/conversations/${conv.id}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role: "system",
                content: JSON.stringify({
                  type: "speaking_config",
                  questions,
                }),
              }),
            });

            // Save the hidden "Begin" user message for data consistency
            await fetch(`/api/conversations/${conv.id}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: "user", content: "Begin" }),
            });
          }
        } catch {
          // Non-critical: session still works without persistence
        }
      }

      // Send the initial message to trigger the AI's first question
      if (!hasSentInitial.current) {
        hasSentInitial.current = true;
        sendMessage({ text: "Begin" });
      }
    }

    init();
  }, []);

  // Auto-scroll on new messages or when next question appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, readyForNextQuestion]);

  // Mark feedback messages as ready for next question after a brief delay
  // so the feedback renders visibly before the next question appears
  useEffect(() => {
    if (isLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;
    if (readyForNextQuestion.has(lastMessage.id)) return;

    const msgText = getMessageText(lastMessage);
    if (!msgText) return;

    const feedback = parseFeedback(msgText);
    if (!feedback) return;

    const timer = setTimeout(() => {
      setReadyForNextQuestion((prev) => new Set(prev).add(lastMessage.id));
    }, 300);
    return () => clearTimeout(timer);
  }, [messages, isLoading, readyForNextQuestion]);

  // When restoring a saved conversation, pre-fetch TTS for ALL questions
  // and mark ALL feedback messages as ready (the effects below only handle the last message)
  useEffect(() => {
    if (hasInitializedRestore.current || !initialMessages || messages.length === 0) return;
    hasInitializedRestore.current = true;

    const feedbackIds: string[] = [];
    for (const message of messages) {
      if (message.role !== "assistant") continue;
      const msgText = getMessageText(message);
      if (!msgText) continue;

      const feedback = parseFeedback(msgText);
      if (feedback) {
        feedbackIds.push(message.id);
        if (feedback.nextQuestion) {
          const audioKey = `${message.id}-next`;
          prepareTtsAudio(feedback.nextQuestion, audioKey);
        }
      } else {
        prepareTtsAudio(msgText, message.id);
      }
    }

    if (feedbackIds.length > 0) {
      setReadyForNextQuestion(new Set(feedbackIds));
    }
  }, [messages]);

  // Pre-fetch TTS audio and autoplay when new assistant messages arrive
  useEffect(() => {
    if (isLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const msgText = getMessageText(lastMessage);
    if (!msgText) return;

    const feedback = parseFeedback(msgText);

    // For feedback messages, wait until feedback has rendered before fetching next question TTS
    if (feedback) {
      if (readyForNextQuestion.has(lastMessage.id)) {
        if (feedback.nextQuestion) {
          const audioKey = `${lastMessage.id}-next`;
          if (!audioCacheRef.current.has(audioKey) && !audioFetchingRef.current.has(audioKey)) {
            if (autoplay && !autoplayedMessages.current.has(audioKey)) {
              autoplayedMessages.current.add(audioKey);
              playTtsAudio(feedback.nextQuestion, audioKey);
            } else {
              prepareTtsAudio(feedback.nextQuestion, audioKey);
            }
          }
        } else {
          // Last question — play end-of-test message
          const endKey = `${lastMessage.id}-end`;
          const endText = "That's the end of the speaking test. Thank you.";
          if (!audioCacheRef.current.has(endKey) && !audioFetchingRef.current.has(endKey)) {
            if (autoplay && !autoplayedMessages.current.has(endKey)) {
              autoplayedMessages.current.add(endKey);
              playTtsAudio(endText, endKey);
            } else {
              prepareTtsAudio(endText, endKey);
            }
          }
        }
      }
      return;
    }

    // For plain question messages (first question), pre-fetch audio
    setWaitingForFirstQuestion(false);
    if (!audioCacheRef.current.has(lastMessage.id) && !audioFetchingRef.current.has(lastMessage.id)) {
      if (autoplay && !autoplayedMessages.current.has(lastMessage.id)) {
        autoplayedMessages.current.add(lastMessage.id);
        playTtsAudio(msgText, lastMessage.id);
      } else {
        prepareTtsAudio(msgText, lastMessage.id);
      }
    }
  }, [messages, isLoading, autoplay, readyForNextQuestion]);

  const toggleTextVisibility = useCallback((id: string) => {
    setVisibleTexts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  async function handleAutoplayToggle(checked: boolean) {
    setAutoplay(checked);
    if (userId) {
      fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, speakingAutoplay: checked }),
      }).catch(() => {});
    }
  }

  async function prepareTtsAudio(text: string, messageId: string) {
    if (audioCacheRef.current.has(messageId) || audioFetchingRef.current.has(messageId)) return;
    audioFetchingRef.current.add(messageId);
    setLoadingAudioKeys(prev => { const next = new Set(prev); next.add(messageId); return next; });
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();

      // Compute waveform data
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer.slice(0));
      const channelData = audioBuffer.getChannelData(0);
      const samplesPerBar = Math.floor(channelData.length / WAVEFORM_BAR_COUNT);
      const waveform: number[] = [];
      for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
        let sum = 0;
        const start = i * samplesPerBar;
        for (let j = start; j < start + samplesPerBar && j < channelData.length; j++) {
          sum += Math.abs(channelData[j]);
        }
        waveform.push(sum / samplesPerBar);
      }
      const max = Math.max(...waveform, 0.001);
      for (let i = 0; i < waveform.length; i++) {
        waveform[i] = 0.08 + (waveform[i] / max) * 0.92;
      }
      setWaveformData(prev => ({ ...prev, [messageId]: waveform }));

      const url = URL.createObjectURL(blob);
      audioCacheRef.current.set(messageId, url);
    } finally {
      audioFetchingRef.current.delete(messageId);
      setLoadingAudioKeys(prev => { const next = new Set(prev); next.delete(messageId); return next; });
    }
  }

  async function playTtsAudio(text: string, messageId: string) {
    // Toggle off if already playing this message
    if (playingAudio === messageId && currentAudio.current) {
      currentAudio.current.pause();
      setPlayingAudio(null);
      return;
    }

    // Stop any other currently playing audio
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
      setPlayingAudio(null);
    }

    try {
      setPlayingAudio(messageId);

      // Reuse existing audio element if available (preserves currentTime)
      const existing = audioElementsRef.current.get(messageId);
      if (existing) {
        currentAudio.current = existing;
        existing.play();
        return;
      }

      // Ensure audio is prepared (no-op if already cached)
      await prepareTtsAudio(text, messageId);

      const url = audioCacheRef.current.get(messageId);
      if (!url) return;

      const audio = new Audio(url);
      currentAudio.current = audio;
      audioElementsRef.current.set(messageId, audio);

      audio.onended = () => {
        setPlayingAudio(null);
        currentAudio.current = null;
        // Reset position so next play starts from the beginning
        audio.currentTime = 0;
      };
      audio.play();
    } catch {
      setPlayingAudio(null);
    }
  }

  function seekAudio(messageId: string, fraction: number) {
    const audio = audioElementsRef.current.get(messageId);
    if (audio && audio.duration) {
      audio.currentTime = fraction * audio.duration;
    }
  }

  function cleanupStt() {
    if (sttRecognitionRef.current) {
      sttRecognitionRef.current.onresult = null;
      sttRecognitionRef.current.onend = null;
      sttRecognitionRef.current.onerror = null;
      sttRecognitionRef.current.abort();
      sttRecognitionRef.current = null;
    }
    sttFinalTranscriptRef.current = "";
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupStt();
    };
  }, []);

  function startRecording() {
    const Ctor =
      typeof window !== "undefined"
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;
    if (!Ctor) {
      console.error("[STT] SpeechRecognition not supported in this browser");
      return;
    }

    // Preserve existing text as prefix so new recording appends
    sttPrefixTextRef.current = textInput.trim();
    sttFinalTranscriptRef.current = "";

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const generation = sttGenerationRef.current;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (sttGenerationRef.current !== generation) return;

      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      sttFinalTranscriptRef.current = finalTranscript;
      const combined = (finalTranscript + interimTranscript).trim();
      const prefix = sttPrefixTextRef.current;
      setTextInput(prefix ? `${prefix} ${combined}` : combined);
    };

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" are non-fatal
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("[STT] Recognition error:", event.error);
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be recording (browser can stop early)
      if (sttRecognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          // Already started or disposed
        }
      }
    };

    sttRecognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  function stopRecording() {
    setIsRecording(false);
    if (sttRecognitionRef.current) {
      sttRecognitionRef.current.onend = null; // prevent auto-restart
      sttRecognitionRef.current.stop();
      sttRecognitionRef.current = null;
    }
  }

  function handleSendText() {
    if (!textInput.trim() || isLoading) return;
    let text = textInput.trim().replace(/\u2019/g, "'");
    if (text && !/[.!?]$/.test(text)) {
      text += ".";
    }

    // Save user message to DB
    if (conversationIdRef.current) {
      fetch(`/api/conversations/${conversationIdRef.current}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: text }),
      }).catch(() => {});
    }

    // Increment generation so in-flight STT results are discarded
    sttGenerationRef.current++;
    sendMessage({ text });
    setTextInput("");
    cleanupStt();
  }

  // Filter the hidden initial user message from display
  const displayMessages = useMemo(() => {
    return messages.filter(
      (m) => !(m.role === "user" && getMessageText(m) === "Begin"),
    );
  }, [messages]);

  // Determine the current question's audio key and whether mic should be disabled
  const currentQuestionAudioKey = useMemo(() => {
    // Walk backwards to find the latest question (not feedback)
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role !== "assistant") continue;
      const msgText = getMessageText(m);
      if (!msgText) continue;
      const feedback = parseFeedback(msgText);
      if (feedback) {
        // The next question is embedded in the feedback
        if (feedback.nextQuestion && readyForNextQuestion.has(m.id)) {
          return `${m.id}-next`;
        }
        return null; // feedback with no next question yet
      }
      // Plain question message (first question)
      return m.id;
    }
    return null;
  }, [messages, readyForNextQuestion]);

  const micDisabled =
    isLoading ||
    waitingForFirstQuestion ||
    !currentQuestionAudioKey ||
    !waveformData[currentQuestionAudioKey] ||
    playingAudio !== null;

  // Determine unique parts and current part for the step timeline
  const parts = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const q of questions) {
      if (!seen.has(q.partNumber)) {
        seen.add(q.partNumber);
        ordered.push(q.partNumber);
      }
    }
    return ordered;
  }, [questions]);

  const currentPartIndex = useMemo(() => {
    // Walk backwards to find the latest feedback whose next question is displayed,
    // then use its nextQuestionPartNumber. Otherwise fall back to the latest
    // feedback's partNumber (the part of the question just answered).
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role !== "assistant") continue;
      const feedback = parseFeedback(getMessageText(m));
      if (!feedback) continue;

      if (readyForNextQuestion.has(m.id) && feedback.nextQuestionPartNumber) {
        const idx = parts.indexOf(feedback.nextQuestionPartNumber);
        if (idx !== -1) return idx;
      }
      if (feedback.partNumber) {
        const idx = parts.indexOf(feedback.partNumber);
        if (idx !== -1) return idx;
      }
    }
    return 0;
  }, [messages, parts, readyForNextQuestion]);

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ── */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-6">
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={onEnd}>
            <Home className="size-4" />
            <span className="ml-1">{t.common.home}</span>
          </Button>
        </div>

        {/* Current Part */}
        <div className="flex items-center gap-2 font-[family-name:var(--font-heading)] font-semibold text-sm">
          <span>Part</span>
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {parts[currentPartIndex] ?? 1}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <label htmlFor="autoplay-switch" className="hidden sm:block text-xs text-muted-foreground font-medium cursor-pointer">
            {t.speaking.autoplay}
          </label>
          <Switch
            id="autoplay-switch"
            className="hidden sm:inline-flex"
            checked={autoplay}
            onCheckedChange={handleAutoplayToggle}
          />
          <UserProfileMenu />
        </div>
      </header>

      {/* Autoplay toggle row – mobile only */}
      <div className="flex sm:hidden items-center justify-center gap-2 pb-2">
        <label htmlFor="autoplay-switch-mobile" className="text-xs text-muted-foreground font-medium cursor-pointer">
          {t.speaking.autoplay}
        </label>
        <Switch
          id="autoplay-switch-mobile"
          checked={autoplay}
          onCheckedChange={handleAutoplayToggle}
        />
      </div>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto bg-background/50">
        <div className="mx-auto max-w-3xl px-4 pb-6 md:px-8">
          <div className="flex flex-col gap-6">
            {/* Show loading audio player before first question arrives */}
            {waitingForFirstQuestion && displayMessages.filter(m => m.role === "assistant").length === 0 && (
              <div className="flex gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                  <RobotIcon className="size-4 fill-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/50 text-primary-foreground">
                      <Play className="size-4 ml-0.5" />
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center h-[44px] gap-1">
                      <Loader className="size-4 animate-spin text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{t.speaking.preparingQuestion}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {displayMessages.map((message, msgIdx) => {
              const msgText = getMessageText(message);

              /* ── Assistant message ── */
              if (message.role === "assistant") {
                const isStreamingThis = messages[messages.length - 1]?.id === message.id && status === "streaming";
                if (!msgText) return null;
                const feedback = parseFeedback(msgText);

                // Check if this message is a feedback response (follows a user message)
                const isFeedbackResponse = msgIdx > 0 && displayMessages[msgIdx - 1]?.role === "user";

                // Show typing dots while streaming feedback, or during the brief
                // transition where streaming ended but feedback JSON hasn't parsed yet
                if (isFeedbackResponse && (isStreamingThis || !feedback)) {
                  return (
                    <div key={message.id} className="flex gap-3">
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
                  );
                }

                /* Feedback + inline next question */
                if (feedback) {
                  let originalResponse = "";
                  for (let k = msgIdx - 1; k >= 0; k--) {
                    if (displayMessages[k].role === "user") {
                      originalResponse = getMessageText(displayMessages[k]);
                      break;
                    }
                  }

                  const nextQuestionAudioKey = `${message.id}-next`;

                  return (
                    <div key={message.id} className="flex gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                        <RobotIcon className="size-4 fill-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {feedback.reaction && (
                          <p className="text-sm leading-relaxed text-foreground/90 mb-3">
                            {feedback.reaction}
                          </p>
                        )}
                        <FeedbackGroup label={t.speaking.speakingFeedback}>
                          <FeedbackCard
                            feedback={feedback}
                            originalResponse={originalResponse}
                            onSpeak={(text, audioKey) => playTtsAudio(text, audioKey)}
                            playingAudioKey={playingAudio}
                            loadingAudioKeys={loadingAudioKeys}
                            messageId={message.id}
                          />
                        </FeedbackGroup>
                        {feedback.nextQuestion && readyForNextQuestion.has(message.id) && (
                          <div className="mt-4">
                            <QuestionBubble
                              text={feedback.nextQuestion}
                              messageId={nextQuestionAudioKey}
                              playingAudio={playingAudio}
                              onPlay={playTtsAudio}
                              onSeek={seekAudio}
                              isTextVisible={visibleTexts.has(nextQuestionAudioKey)}
                              onToggleText={toggleTextVisibility}
                              waveform={waveformData[nextQuestionAudioKey] ?? null}
                              audioElement={audioElementsRef.current.get(nextQuestionAudioKey) ?? null}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                /* Plain-text question (first question) */
                return (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                      <RobotIcon className="size-4 fill-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <QuestionBubble
                        text={msgText}
                        messageId={message.id}
                        playingAudio={playingAudio}
                        onPlay={playTtsAudio}
                        onSeek={seekAudio}
                        isTextVisible={visibleTexts.has(message.id)}
                        onToggleText={toggleTextVisibility}
                        waveform={waveformData[message.id] ?? null}
                        audioElement={audioElementsRef.current.get(message.id) ?? null}
                      />
                    </div>
                  </div>
                );
              }

              /* ── User message ── */
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-xl bg-primary/10 px-4 py-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msgText}</p>
                  </div>
                </div>
              );
            })}

            {/* Loading indicator — context-aware */}
            {status === "submitted" && (() => {
              const lastMsg = messages[messages.length - 1];
              const lastMsgText = lastMsg ? getMessageText(lastMsg) : "";
              // After user answer: show typing dots (skip initial "Begin" — audio placeholder handles that)
              if (lastMsg?.role === "user" && lastMsgText !== "Begin" && lastMsgText !== "Start the speaking test.") {
                return (
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
                );
              }
              // Initial question loading — already handled by the placeholder above
              return null;
            })()}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* ── Input area ── */}
      <div className="shrink-0 bg-background px-4 pb-5 md:px-6">
        <div className="mx-auto max-w-2xl">
          {/* Microphone */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isRecording && micDisabled}
              className={`group relative flex size-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-destructive text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isRecording && (
                <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
              )}
              {isRecording ? (
                <Square className="size-5 fill-current" />
              ) : (
                <Mic className="size-6" />
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              {isRecording
                ? t.speaking.recording
                : t.speaking.tapToSpeak}
            </span>
          </div>

          {/* Text input */}
          <div className="relative flex items-center rounded-full border bg-background focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all overflow-hidden">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              placeholder={t.chat.typeMessage}
              className="min-h-0 max-h-32 w-full resize-none border-0 focus-visible:ring-0 px-4 py-2.5 text-base shadow-none bg-transparent"
              rows={1}
              disabled={micDisabled}
            />
            <div className="pr-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0 size-9 text-muted-foreground hover:text-foreground transition-transform active:scale-95"
                type="button"
                onClick={handleSendText}
                disabled={!textInput.trim() || micDisabled}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground/70">
              {t.common.aiDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
