"use client";

import { isSpeakingSkill } from "@/utils/skillUtils";
import { getSpeakingExaminerInstructions } from "@/utils/speakingPrompts";
import SpeakingConversation from "./conversation/speaking-conversation";
import WritingConversation from "./conversation/writing-conversation";
import TextInput from "./user-input/text-input";
import EssaySubmissionPopup from "./user-input/essay-submission-popup";
import useConversationStore from "@/stores/conversationStore";
import useExaminerStateStore from "@/stores/examinerStateStore";

interface ChatProps {
  greeting: JSX.Element;
}

export default function Chat({ greeting }: ChatProps) {
  const [skill, messages, setMessages] = useConversationStore((state) => [
    state.skill,
    state.messages,
    state.setMessages,
  ]);
  const examinerState = useExaminerStateStore((state) => state.examinerState);

  // User has not selected a skill
  if (!skill) return <>{greeting}</>;

  // User has just selected a skill and no messages have been sent
  if (!messages.length) {
    if (isSpeakingSkill(skill)) {
      // Send the first message of a speaking conversation
      // which contains the question list for the examiner
      const instructions = getSpeakingExaminerInstructions(skill);
      setMessages(() => [
        {
          role: "user",
          type: "hidden",
          content: instructions,
        },
      ]);
      return;
    }

    // If a writing skill is selected, wait for the user to submit their essay
    return (
      <>
        {greeting}
        <EssaySubmissionPopup skill={skill} />
      </>
    );
  }

  return (
    <>
      {isSpeakingSkill(skill) ? (
        <>
          <div className="flex-1 overflow-y-auto pb-10">
            <SpeakingConversation />
          </div>
          {examinerState !== "error" && (
            <div className="sticky bottom-0 bg-background pb-4">
              <TextInput />
            </div>
          )}
        </>
      ) : (
        <WritingConversation />
      )}
    </>
  );
}
