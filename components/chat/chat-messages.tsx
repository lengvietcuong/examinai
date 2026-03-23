"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/message-bubble";
import { useI18n } from "@/lib/i18n/provider";
import RobotIcon from "@/components/icons/logo";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isSearchingKnowledge?: boolean;
}

function AnimatedDots() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev % 3) + 1);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-4 text-left">{".".repeat(count)}</span>;
}

export function ChatMessages({ messages, isLoading, isSearchingKnowledge }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isSearchingKnowledge]);

  if (messages.length === 0 && !isLoading) return null;

  return (
    <ScrollArea className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4 p-4">
        {messages.map((message, index) => {
          const isLastAssistant =
            message.role === "assistant" && index === messages.length - 1;

          return (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              isStreaming={isLastAssistant && isLoading}
            />
          );
        })}

        {isSearchingKnowledge && (
          <div className="flex gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <RobotIcon className="size-4 fill-foreground" />
            </div>
            <div className="rounded-2xl bg-muted px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="size-3.5 animate-pulse" />
                <span>{t.chat.searchingKnowledge}<AnimatedDots /></span>
              </div>
            </div>
          </div>
        )}

        {isLoading && !isSearchingKnowledge && messages[messages.length - 1]?.role !== "assistant" && (
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

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
