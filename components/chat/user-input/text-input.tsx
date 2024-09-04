"use client";

import { useState, useEffect, useRef } from "react";
import useConversationStore from "@/stores/conversationStore";
import useExaminerStateStore from "@/stores/examinerStateStore";
import type { Message } from "@/types/messages";
import Microphone from "./microphone";
import { sanitize } from "@/utils/essaySubmission";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SendIcon from "../../icons/send-icon";

export default function TextInput() {
  const [userInput, setUserInput] = useState("");
  const fixedInputPortion = useRef(""); // Used to store keyboard-entered text and finalized audio transcripts because new transcripts can overwrite existing text
  const examinerState = useExaminerStateStore((state) => state.examinerState);
  const setMessages = useConversationStore((state) => state.setMessages);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);

  function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = event.target.value;
    setUserInput(text);
    fixedInputPortion.current = text;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) handleSubmit(event);
  }

  function handleMicrophoneActivate() {
    textareaRef.current?.focus();
  }

  function handleTranscript(transcript: string, isFinal: boolean) {
    const newText = (fixedInputPortion.current + " " + transcript).trim();
    setUserInput(newText);
    if (isFinal) {
      fixedInputPortion.current = newText;
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const sanitizedText = sanitize(userInput);
    if (!sanitizedText || examinerState !== "idle") return;

    const newMessage: Message = {
      role: "user",
      type: "text",
      content: sanitizedText,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput("");
    fixedInputPortion.current = "";
  }

  function resizeTextarea() {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    textarea.style.height = "initial"; // Set to default to lower height if text is removed
    const initialHeight = textarea.offsetHeight;
    const contentHeight = textarea.scrollHeight;

    textarea.style.height = `${contentHeight}px`; // Increase height to fit content
    textarea.scrollTop = textarea.scrollHeight; // Scroll to bottom
    setIsTextareaExpanded(contentHeight > initialHeight);
  }

  useEffect(() => {
    resizeTextarea();
  }, [userInput]);

  const isSendButtonActive = userInput.length > 0 && examinerState === "idle";

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-end gap-3 lg:gap-4 ${isTextareaExpanded ? "rounded-3xl" : "rounded-full"} bg-muted px-4 lg:px-5 py-3.5`}
    >
      <Microphone
        onActivate={handleMicrophoneActivate}
        onTranscript={handleTranscript}
      />
      <textarea
        id="text-input"
        ref={textareaRef}
        placeholder="Message Examinai..."
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="max-h-44 w-full resize-none bg-transparent placeholder-muted-foreground/75 focus:outline-none"
        rows={1}
      ></textarea>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className={`h-6 ${!isSendButtonActive ? "hover:cursor-default": ""}`}>
            <button
              type="submit"
              disabled={!isSendButtonActive}
            >
              <SendIcon
                className={`size-6 transition-colors ${isSendButtonActive ? "stroke-foreground hover:stroke-primary" : "stroke-muted-foreground/35"}`}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Send</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </form>
  );
}
