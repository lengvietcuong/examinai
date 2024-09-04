"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import NewChatButton from "./new-chat-button";
import ConversationHistory from "./conversation-history";
import { PiCircleDashedBold as DashedCircleIcon } from "react-icons/pi";
import { TbMessageChatbot as ConversationIcon } from "react-icons/tb";

export default function SidebarContent() {
  const [user, loading] = useAuthState(auth);
  return (
    <>
      <NewChatButton />
      {loading ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DashedCircleIcon className="size-8 animate-spin fill-muted-foreground" />
        </div>
      ) : user ? (
        <ConversationHistory className="mt-6 lg:mt-9 flex-1 overflow-y-auto" />
      ) : (
        <div className="mt-6 flex items-center justify-center gap-4 overflow-hidden">
          <ConversationIcon className="size-8 flex-shrink-0" />
          <p className="whitespace-pre text-muted-foreground">
            {`Sign in to save\nyour conversations!`}
          </p>
        </div>
      )}
    </>
  );
}
