"use client";

import { useState } from "react";
import { Check, Loader2, Play, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface StartWritingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (taskNumbers: ("1" | "2")[]) => Promise<void>;
}


export function StartWritingModal({
  open,
  onOpenChange,
  onStart,
}: StartWritingModalProps) {
  const { t } = useI18n();
  const [task1Selected, setTask1Selected] = useState(true);
  const [task2Selected, setTask2Selected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const canStart = task1Selected || task2Selected;

  async function handleStart() {
    const tasks: ("1" | "2")[] = [];
    if (task1Selected) tasks.push("1");
    if (task2Selected) tasks.push("2");
    setIsLoading(true);
    try {
      await onStart(tasks);
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t.writing.selectTask}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t.writing.selectTask}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setTask1Selected(!task1Selected)}
            className="flex items-start gap-3 rounded-xl border border-border px-4 py-3 text-left transition-all outline-none hover:bg-muted/50"
          >
            <div
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                task1Selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30"
              }`}
            >
              {task1Selected && <Check className="size-3" strokeWidth={3} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium font-[family-name:var(--font-heading)]">
                {t.writing.task1}
              </p>
              <p className="text-xs text-muted-foreground">{t.writing.task1Description}</p>
              <p className="flex w-fit items-center gap-1 text-xs text-muted-foreground mt-0.5 ml-auto">
                <Clock className="size-3" />
                <span className="font-semibold">20 {t.writing.minutes}</span>
              </p>
            </div>
          </button>

          <button
            onClick={() => setTask2Selected(!task2Selected)}
            className="flex items-start gap-3 rounded-xl border border-border px-4 py-3 text-left transition-all outline-none hover:bg-muted/50"
          >
            <div
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                task2Selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30"
              }`}
            >
              {task2Selected && <Check className="size-3" strokeWidth={3} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium font-[family-name:var(--font-heading)]">
                {t.writing.task2}
              </p>
              <p className="text-xs text-muted-foreground">{t.writing.task2Description}</p>
              <p className="flex w-fit items-center gap-1 text-xs text-muted-foreground mt-0.5 ml-auto">
                <Clock className="size-3" />
                <span className="font-semibold">40 {t.writing.minutes}</span>
              </p>
            </div>
          </button>
        </div>

        <DialogFooter>
          <Button
            onClick={handleStart}
            disabled={!canStart || isLoading}
            className="w-full gap-2 font-medium"
            size="lg"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {t.writing.startTest}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
