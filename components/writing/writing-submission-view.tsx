"use client";

import { Home, HelpCircle, FileText, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WritingSubmission } from "@/lib/types";
import type { Translations } from "@/lib/i18n/translations";
import { UserProfileMenu } from "@/components/user-profile-menu";

interface WritingSubmissionViewProps {
  submission: WritingSubmission;
  onViewFeedback: () => void;
  onHome: () => void;
  taskTabs: React.ReactNode;
  t: Translations;
}

export function WritingSubmissionView({
  submission,
  onViewFeedback,
  onHome,
  taskTabs,
  t,
}: WritingSubmissionViewProps) {
  const wordCount = submission.essay.trim()
    ? submission.essay.trim().split(/\s+/).length
    : 0;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header — same layout as assessment header */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border px-4 py-2.5 sm:px-6">
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={onHome}>
            <Home className="size-4" />
            <span className="ml-1 hidden sm:inline">{t.common.home}</span>
          </Button>
        </div>

        {taskTabs}

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onViewFeedback}>
            <MessageSquareText className="size-4" />
            <span className="ml-1.5 hidden sm:inline">
              {t.feedback.viewFeedback}
            </span>
          </Button>
          <UserProfileMenu />
        </div>
      </header>

      {/* Content — mirrors the exam interface layout */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
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
                {submission.question}
              </p>
              {submission.imageUrl && (
                <img
                  src={submission.imageUrl}
                  alt="Task chart"
                  className="w-full h-auto object-contain mt-4 rounded-xl"
                />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Essay (read-only) */}
        <div className="flex flex-1 flex-col overflow-hidden lg:w-1/2">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold font-[family-name:var(--font-heading)] text-muted-foreground uppercase tracking-wide">
              <FileText className="size-3.5" />
              {t.writing.essay}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t.writing.wordCount}: {wordCount}
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-4 sm:px-6 pb-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {submission.essay}
              </p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
