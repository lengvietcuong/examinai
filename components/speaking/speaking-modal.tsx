"use client";

import { useState } from "react";
import { Check, Loader2, Play } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SpeakingQuestionData } from "@/lib/types";

interface SpeakingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (questions: SpeakingQuestionData[]) => void;
}


export function SpeakingModal({
  open,
  onOpenChange,
  onStart,
}: SpeakingModalProps) {
  const { t } = useI18n();
  const [selectedParts, setSelectedParts] = useState<Set<string>>(
    new Set(["1", "2", "3"])
  );
  const [isLoading, setIsLoading] = useState(false);

  function togglePart(part: string) {
    setSelectedParts((prev) => {
      const next = new Set(prev);
      if (next.has(part)) {
        if (next.size > 1) next.delete(part);
      } else {
        next.add(part);
      }
      return next;
    });
  }

  async function handleStart() {
    if (selectedParts.size === 0) return;
    setIsLoading(true);

    try {
      const parts = Array.from(selectedParts).sort();
      const res = await fetch("/api/speaking/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partNumbers: parts }),
      });
      const data = await res.json();
      onOpenChange(false);
      onStart(data.questions);
    } catch {
      setIsLoading(false);
    }
  }

  const parts = [
    { key: "1", label: t.speaking.part1, description: t.speaking.part1Description },
    { key: "2", label: t.speaking.part2, description: t.speaking.part2Description },
    { key: "3", label: t.speaking.part3, description: t.speaking.part3Description },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t.chat.speaking}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {parts.map(({ key, label, description }) => {
            const isSelected = selectedParts.has(key);
            return (
              <button
                key={key}
                onClick={() => togglePart(key)}
                className="group flex items-start gap-3 rounded-xl border border-border p-4 text-left transition-all outline-none hover:bg-primary/[0.02]"
              >
                <div
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {isSelected && <Check className="size-3" strokeWidth={3} />}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium font-[family-name:var(--font-heading)]">
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          size="lg"
          onClick={handleStart}
          disabled={selectedParts.size === 0 || isLoading}
          className="w-full gap-2 font-medium"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          {t.speaking.startSpeaking}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
