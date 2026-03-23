"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, HelpCircle, FileText, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { WritingSubmission } from "@/lib/types";

interface SubmitEssayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: WritingSubmission & { imageFile?: File }) => void;
}

export function SubmitEssayModal({
  open,
  onOpenChange,
  onSubmit,
}: SubmitEssayModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"1" | "2">("2");
  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, []);

  function handleSubmit() {
    if (!question.trim() || !essay.trim()) return;
    onSubmit({
      taskNumber: activeTab,
      question: question.trim().replace(/\u2019/g, "'"),
      essay: essay.trim().replace(/\u2019/g, "'"),
      wordCount,
      imageFile: imageFile ?? undefined,
    });
    resetForm();
    onOpenChange(false);
  }

  function resetForm() {
    setQuestion("");
    setEssay("");
    setImageFile(null);
    setImagePreview(null);
  }

  const canSubmit = question.trim().length > 0 && essay.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t.writing.submitExistingEssay}
          </DialogTitle>
        </DialogHeader>

        {/* Task Tabs */}
        <div className="flex gap-1 rounded-4xl bg-muted p-1">
          {(["1", "2"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-4xl px-3 py-2 text-sm font-medium font-[family-name:var(--font-heading)] transition-all outline-none ${
                activeTab === tab
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "1" ? t.writing.task1 : t.writing.task2}
            </button>
          ))}
        </div>

        {/* Question */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium font-[family-name:var(--font-heading)] mb-1">
            <HelpCircle className="size-3.5 text-muted-foreground" />
            {t.writing.question}
          </label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t.writing.enterQuestion}
            className="min-h-24 resize-none focus-visible:ring-0 focus-visible:border-border"
          />
        </div>

        {/* Image Upload for Task 1 */}
        {activeTab === "1" && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium font-[family-name:var(--font-heading)] mb-1">
              <ImageIcon className="size-3.5 text-muted-foreground" />
              {t.writing.uploadImage}
            </label>
            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                <img
                  src={imagePreview}
                  alt={t.writing.uploadedChart}
                  className="max-h-48 w-full object-contain bg-muted/30"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                }`}
              >
                <Upload className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t.writing.dragDropImage}
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />
          </div>
        )}

        {/* Essay */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium font-[family-name:var(--font-heading)] mb-1">
            <FileText className="size-3.5 text-muted-foreground" />
            {t.writing.essay}
          </label>
          <Textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder={t.writing.pasteYourEssay}
            className="min-h-40 max-h-60 resize-none focus-visible:ring-0 focus-visible:border-border"
          />
          <p className="text-xs text-muted-foreground">
            {t.writing.wordCount}: {wordCount}
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full font-medium"
            size="lg"
          >
            <Send className="size-4" />
            {t.writing.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
