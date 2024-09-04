"use client";

import { useState } from "react";
import { WritingSkill } from "@/types/skills";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getWordCount, sanitize } from "@/utils/essaySubmission";
import useConversationStore from "@/stores/conversationStore";
import {
  ESSAY_QUESTIONS_LINK,
  MAX_QUESTION_WORD_COUNT,
  MAX_ESSAY_WORD_COUNT,
  MIN_ESSAY_WORD_COUNT,
} from "@/constants";
import { BsQuestionLg as QuestionIcon } from "react-icons/bs";
import { LuFileText as EssayIcon } from "react-icons/lu";
import { LuSend as SubmitIcon } from "react-icons/lu";

interface EssaySubmissionPopupProps {
  skill: WritingSkill;
}

export default function EssaySubmissionPopup({
  skill,
}: EssaySubmissionPopupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [questionWordCount, setQuestionWordCount] = useState(0);
  const [essayWordCount, setEssayWordCount] = useState(0);
  const [ setMessages, clearConversation ] = useConversationStore(
    (state) => [
      state.setMessages,
      state.clearConversation,
    ],
  );

  function handleQuestionChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const question = event.target.value;
    setQuestion(question);
    setQuestionWordCount(getWordCount(question));
  }

  function handleEssayChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const essay = event.target.value;
    setEssay(essay);
    setEssayWordCount(getWordCount(essay));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sanitizedQuestion = sanitize(question);
    const sanitizedEssay = sanitize(essay);
    if (!sanitizedQuestion || !sanitizedEssay) return;

    if (questionWordCount > MAX_QUESTION_WORD_COUNT) {
      alert("The essay question is too long. It must be at most 100 words.");
      return;
    }

    const minWordCount = MIN_ESSAY_WORD_COUNT[skill];
    const maxWordCount = MAX_ESSAY_WORD_COUNT[skill];
    if (essayWordCount < minWordCount) {
      alert(
        `Your essay is too short. You must write at least ${minWordCount} words for ${skill}.`,
      );
      return;
    }
    if (essayWordCount > maxWordCount) {
      alert(
        `Your essay is too long. For ${skill}, please write at most ${maxWordCount} words.`,
      );
      return;
    }

    setMessages(() => [
      {
        role: "user",
        type: "essaySubmission",
        question: sanitizedQuestion,
        essay: sanitizedEssay,
      },
    ]);
    setQuestion("");
    setEssay("");
    setIsOpen(false);
  }

  function handleOpenChange(isOpen: boolean) {
    setIsOpen(isOpen);
    // If the user closes the popup without submitting,
    // clear the selected skill by clearing the conversation
    if (!isOpen) {
      // Wait 0.3s for the closing animation to finish
      setTimeout(() => {
        clearConversation();
      }, 300);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-5 lg:gap-4">
        <DialogHeader>
          <DialogTitle className="mb-2 text-left">{skill}</DialogTitle>
          <DialogDescription className="text-left">
            Please submit the essay question and your essay. I will assess it
            and provide feedback.
            <br />
            <br />
            Don&apos;t know where to find questions? Check out{" "}
            <a
              href={ESSAY_QUESTIONS_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Study4
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-5 lg:gap-4" onSubmit={handleSubmit}>
          <div>
            <Label
              htmlFor="question"
              className="flex items-center font-montserrat"
            >
              <QuestionIcon className="mr-1 inline-block fill-primary" />
              Essay question
            </Label>
            <Textarea
              id="question"
              value={question}
              onChange={handleQuestionChange}
              placeholder="Enter the essay question..."
              className="mt-2 resize-none"
            />
          </div>
          <div>
            <Label
              htmlFor="essay"
              className="flex items-center font-montserrat"
            >
              <EssayIcon className="mr-1 inline-block stroke-primary" />
              Your essay
            </Label>
            <Textarea
              id="essay"
              value={essay}
              onChange={handleEssayChange}
              placeholder="Enter your essay..."
              className="mt-2 resize-none"
              rows={7}
            />
            <p className="mt-2 text-sm text-muted-foreground">{`Word Count: ${essayWordCount}`}</p>
          </div>
          <DialogFooter>
            <Button type="submit">
              <SubmitIcon className="mr-2" />
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
