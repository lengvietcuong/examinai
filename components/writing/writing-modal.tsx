"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useI18n } from "@/lib/i18n/provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WritingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartWriting: () => void;
  onSubmitEssay: () => void;
}

export function WritingModal({
  open,
  onOpenChange,
  onStartWriting,
  onSubmitEssay,
}: WritingModalProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t.chat.writing}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onOpenChange(false);
              onStartWriting();
            }}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm outline-none"
          >
            <div className="w-20 h-20">
              <DotLottieReact src="/animations/pen.lottie" loop autoplay />
            </div>
            <span className="text-sm font-medium font-[family-name:var(--font-heading)]">
              {t.writing.startWriting}
            </span>
          </button>

          <button
            onClick={() => {
              onOpenChange(false);
              onSubmitEssay();
            }}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm outline-none"
          >
            <div className="w-20 h-20">
              <DotLottieReact src="/animations/marking.lottie" loop autoplay />
            </div>
            <span className="text-sm font-medium font-[family-name:var(--font-heading)]">
              {t.writing.submitExistingEssay}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
