import { forwardRef } from "react";
import { type Message } from "@/types/messages";
import Scores from "./scores";
import Corrections from "./corrections";
import ReactMarkdown from "react-markdown";
import UserAvatar from "../../header/profile-area/user-avatar";
import RobotIcon from "../../icons/robot-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { TbListCheck as CheckListIcon } from "react-icons/tb";
import { LiaToolsSolid as FixingIcon } from "react-icons/lia";
import { HiOutlineLightBulb as LightBulbIcon } from "react-icons/hi";
import { PiMagicWandBold as MagicWandIcon } from "react-icons/pi";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: Message;
  renderAvatar?: boolean;
  className?: string;
}

const Message = forwardRef<HTMLDivElement, MessageProps>((props, ref) => {
  const { message, renderAvatar = true, className } = props;

  function renderMessageBody(message: Message) {
    switch (message.type) {
      case "text":
        return (
          <ReactMarkdown className="markdown">{message.content}</ReactMarkdown>
        );
      case "essaySubmission":
        return (
          <>
            <p>
              <strong>
                <em>{message.question}</em>
              </strong>
            </p>
            <br />
            <ReactMarkdown className="markdown">{message.essay}</ReactMarkdown>
          </>
        );
      case "scores":
        return (
          <>
            <div className="mb-4 flex items-center gap-1">
              <CheckListIcon className="size-6 stroke-primary" />
              <h2>Scores</h2>
            </div>
            <Scores scores={message.scores} />
          </>
        );
      case "corrections":
        return (
          <>
            <div className="mb-4 flex items-center gap-1">
              <FixingIcon className="size-6 fill-primary" />
              <h2>Corrections</h2>
            </div>
            <Corrections
              original={message.original}
              corrected={message.corrected}
            />
          </>
        );
      case "suggestions":
        return (
          <>
            <div className="mb-4 flex items-center gap-1">
              <LightBulbIcon className="size-6 stroke-primary" />
              <h2>Idea Suggestions</h2>
            </div>
            <ReactMarkdown className="markdown">
              {message.content}
            </ReactMarkdown>
          </>
        );
      case "improved":
        return (
          <>
            <div className="mb-4 flex items-center gap-1">
              <MagicWandIcon className="size-6 fill-primary" />
              <h2>Improved Version</h2>
            </div>
            <ReactMarkdown className="markdown">
              {message.content}
            </ReactMarkdown>
          </>
        );
      case "loading":
        return (
          <div className="space-y-2">
            <Skeleton className="h-4 w-64 lg:w-96" />
            <Skeleton className="h-4 w-48 lg:w-80 delay-300" />
            <Skeleton className="h-4 w-32 lg:w-64 delay-700" />
          </div>
        );
      case "error":
        return (
          <p className="text-error">
            I&apos;m sorry, an error occurred while generating the response. Please
            try again later.
          </p>
        );
    }
  }

  if (message.type === "hidden") return;

  return (
    <div className={cn("flex gap-3 lg:gap-4", className)} ref={ref}>
      <div
        className={`grid size-8 flex-shrink-0 place-items-center rounded-full ${renderAvatar ? "border border-muted-foreground/35" : ""}`}
      >
        {renderAvatar &&
          (message.role == "user" ? (
            <UserAvatar fallBackClassName="size-5 fill-foreground" />
          ) : (
            <RobotIcon className="size-5 fill-foreground" />
          ))}
      </div>
      <div className="flex-1">{renderMessageBody(message)}</div>
    </div>
  );
});

Message.displayName = "Message";
export default Message;
