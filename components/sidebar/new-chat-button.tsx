"use client";

import useConversationStore from "@/stores/conversationStore";
import useExaminerStateStore from "@/stores/examinerStateStore";
import useSidebarStore from "@/stores/sidebarStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { FaPlus as PlusIcon } from "react-icons/fa6";
import { cn } from "@/lib/utils";

export default function NewChatButton({
  variant = "full",
  className,
}: {
  variant?: "full" | "icon";
  className?: string;
}) {
  const [messages, clearConversation] = useConversationStore((state) => [
    state.messages,
    state.clearConversation,
  ]);
  const setExaminerState = useExaminerStateStore(
    (state) => state.setExaminerState,
  );
  const setIsMobileSidebarOpen = useSidebarStore(
    (state) => state.setIsMobileSidebarOpen,
  );

  if (variant === "icon") {
    return messages.length > 0 && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={() => {
                clearConversation();
                setExaminerState("idle");
                setIsMobileSidebarOpen(false);
              }}
              className={cn("size-9 lg:size-10 rounded-full p-0", className)}
            >
              <PlusIcon className="size-4 fill-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>New chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full variant (default)
  return (
    <Button
      variant="secondary"
      disabled={!messages.length}
      onClick={() => {
        clearConversation();
        setExaminerState("idle");
        setIsMobileSidebarOpen(false);
      }}
      className={cn(
        "w-full justify-between border-none bg-muted-foreground/15 hover:bg-muted-foreground/35",
        className,
      )}
    >
      New Chat
      <PlusIcon className="size-5 fill-primary" />
    </Button>
  );
}
