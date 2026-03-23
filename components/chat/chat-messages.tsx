"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/message-bubble";
import RobotIcon from "@/components/icons/logo";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
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
