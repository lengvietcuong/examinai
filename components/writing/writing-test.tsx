"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Home, Clock, Send, HelpCircle, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { WritingSubmission } from "@/lib/types";
import { UserProfileMenu } from "@/components/user-profile-menu";

interface WritingQuestion {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  taskNumber: "1" | "2";
}

interface WritingTestProps {
  questions: WritingQuestion[];
  onSubmit: (submissions: WritingSubmission[]) => void;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function getTotalTime(questions: WritingQuestion[]): number {
  const hasBoth =
    questions.some((q) => q.taskNumber === "1") &&
    questions.some((q) => q.taskNumber === "2");
  if (hasBoth) return 60 * 60;
  if (questions.some((q) => q.taskNumber === "1")) return 20 * 60;
  return 40 * 60;
}

export function WritingTest({ questions, onSubmit, onBack }: WritingTestProps) {
  const { t } = useI18n();
  const taskNumbers = [...new Set(questions.map((q) => q.taskNumber))].sort();
  const [activeTab, setActiveTab] = useState<"1" | "2">(taskNumbers[0] as "1" | "2");
  const [essays, setEssays] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(getTotalTime(questions));
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  const buildSubmissions = useCallback((): WritingSubmission[] => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    return questions.map((q) => ({
      taskNumber: q.taskNumber,
      question: q.content,
      essay: essays[q.taskNumber] || "",
      imageUrl: q.imageUrl,
      wordCount: (essays[q.taskNumber] || "").trim()
        ? (essays[q.taskNumber] || "").trim().split(/\s+/).length
        : 0,
      timeSpent: elapsed,
    }));
  }, [questions, essays]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setShowTimeUpDialog(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleSubmit() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onSubmit(buildSubmissions());
  }

  function handleTimeUpSubmit() {
    setShowTimeUpDialog(false);
    onSubmit(buildSubmissions());
  }

  function handleBackConfirm() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowBackDialog(false);
    onBack();
  }

  const isTimeLow = timeLeft < 300;

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => setShowBackDialog(true)}>
            <Home className="size-4" />
            <span className="ml-1">{t.common.home}</span>
          </Button>

          {/* Task Tabs — inline on sm+ */}
          {taskNumbers.length > 1 && (
            <div className="hidden sm:flex gap-1 rounded-4xl bg-muted p-1">
              {taskNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setActiveTab(num as "1" | "2")}
                  className={`rounded-4xl px-4 py-1.5 text-sm font-medium font-[family-name:var(--font-heading)] transition-all outline-none ${
                    activeTab === num
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {num === "1" ? t.writing.task1 : t.writing.task2}
                </button>
              ))}
            </div>
          )}

          {/* Timer + Profile */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-4xl px-3 py-1.5 text-sm font-medium font-[family-name:var(--font-heading)] tabular-nums ${
                isTimeLow
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-foreground"
              }`}
            >
              <Clock className="size-3.5" />
              {formatTime(timeLeft)}
            </div>
            <UserProfileMenu />
          </div>
        </div>

        {/* Task Tabs — separate row on mobile */}
        {taskNumbers.length > 1 && (
          <div className="flex sm:hidden justify-center px-4 pb-3">
            <div className="flex gap-1 rounded-4xl bg-muted p-1">
              {taskNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setActiveTab(num as "1" | "2")}
                  className={`rounded-4xl px-4 py-1.5 text-sm font-medium font-[family-name:var(--font-heading)] transition-all outline-none ${
                    activeTab === num
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {num === "1" ? t.writing.task1 : t.writing.task2}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content — all questions rendered simultaneously, toggled via CSS */}
      {questions.map((question) => {
        const isActive = activeTab === question.taskNumber;
        const essay = essays[question.taskNumber] || "";
        const wc = essay.trim() ? essay.trim().split(/\s+/).length : 0;

        return (
          <div
            key={question.taskNumber}
            className={`flex flex-1 flex-col overflow-hidden lg:flex-row ${isActive ? "" : "hidden"}`}
          >
            {/* Left: Question */}
            <div className="flex flex-col overflow-hidden max-h-[40dvh] lg:max-h-none lg:w-1/2 lg:border-r lg:border-border">
              <div className="px-4 py-3 sm:px-6">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold font-[family-name:var(--font-heading)] text-muted-foreground uppercase tracking-wide">
                  <HelpCircle className="size-3.5" />
                  {t.writing.questionText}
                </h2>
              </div>
              <ScrollArea className="flex-1 overflow-hidden">
                <div className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {question.content}
                  </p>
                  {question.imageUrl && (
                    <img
                      src={question.imageUrl}
                      alt={t.writing.taskChart}
                      className="w-full h-auto object-contain mt-4 rounded-xl"
                    />
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Essay */}
            <div className="flex flex-1 flex-col lg:w-1/2">
              <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold font-[family-name:var(--font-heading)] text-muted-foreground uppercase tracking-wide">
                  <FileText className="size-3.5" />
                  {t.writing.essay}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {t.writing.wordCount}: {wc}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-4 sm:px-6 pb-4 sm:pb-6">
                <textarea
                  value={essay}
                  onChange={(e) =>
                    setEssays((prev) => ({ ...prev, [question.taskNumber]: e.target.value }))
                  }
                  placeholder={t.writing.writeYourEssay}
                  className="flex-1 w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex justify-end px-4 py-3 sm:px-6">
                <Button onClick={handleSubmit} className="font-medium" size="lg">
                  <Send className="size-4" />
                  {t.common.submit}
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Time's Up Dialog */}
      <Dialog open={showTimeUpDialog} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {t.writing.timerExpired}
            </DialogTitle>
            <DialogDescription>
              {t.writing.timerExpiredMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleTimeUpSubmit} className="w-full font-medium" size="lg">
              {t.common.understood}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Back Confirmation Dialog */}
      <Dialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {t.common.confirm}
            </DialogTitle>
            <DialogDescription>
              {t.writing.backConfirmation}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBackDialog(false)} className="font-medium">
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleBackConfirm} className="font-medium">
              {t.common.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
