"use client";

import { useState, useEffect } from "react";
import useConversationStore from "@/stores/conversationStore";
import useExaminerStateStore from "@/stores/examinerStateStore";
import { getWritingExaminerResponse } from "@/app/actions";
import { streamResponse } from "@/utils/streamResponse";
import { StreamableValue } from "ai/rsc";
import { AssistantMessage } from "@/types/messages";
import { WritingSkill } from "@/types/skills";
import { isWritingSkill } from "@/utils/skillUtils";
import Conversation from "./conversation";
import { tagCorrections } from "@/utils/tagCorrections";
import {
  extractWritingScores,
  removeRedundantDefinitions,
  stripRedundantPhrases,
} from "@/utils/extractMessages";

export default function WritingConversation() {
  const [conversationId, skill, messages, setMessages] = useConversationStore(
    (state) => [
      state.conversationId,
      state.skill,
      state.messages,
      state.setMessages,
    ],
  );
  const setExaminerState = useExaminerStateStore(
    (state) => state.setExaminerState,
  );

  const [scoresStream, setScoresStream] = useState<AssistantMessage>();
  const [correctionsStream, setCorrectionsStream] =
    useState<AssistantMessage>();
  const [suggestionsStream, setSuggestionsStream] =
    useState<AssistantMessage>();
  const [improvedStream, setImprovedStream] = useState<AssistantMessage>();

  async function streamWritingFeedback(
    essay: string,
    scoresStream: StreamableValue,
    correctionsStream: StreamableValue,
    improvedStream: StreamableValue,
    suggestionsStream?: StreamableValue, // Optional for Task 1
  ) {
    const streams = [
      streamResponse(
        scoresStream,
        (response) => ({
          role: "assistant",
          type: "scores",
          scores: extractWritingScores(response),
        }),
        setScoresStream,
      ),
      streamResponse(
        correctionsStream,
        (response) => {
          const { original, corrected } = tagCorrections(
            essay,
            response,
          );
          return {
            role: "assistant",
            type: "corrections",
            original,
            corrected,
          };
        },
        setCorrectionsStream,
      ),
      streamResponse(
        improvedStream,
        (response) => ({
          role: "assistant",
          type: "improved",
          content: stripRedundantPhrases(removeRedundantDefinitions(essay, response)),
        }),
        setImprovedStream,
      ),
    ];

    // Idea suggestions are only provided for Task 2, not Task 1
    // Conditionally add suggestions stream
    if (suggestionsStream) {
      streams.push(
        streamResponse(
          suggestionsStream,
          (response) => ({
            role: "assistant",
            type: "suggestions",
            content: stripRedundantPhrases(response),
          }),
          setSuggestionsStream,
        ),
      );
    }

    const [scores, corrections, improved, suggestions] =
      await Promise.all(streams);

    // Stream finished
    setScoresStream(undefined);
    setCorrectionsStream(undefined);
    setSuggestionsStream(undefined);
    setImprovedStream(undefined);

    return suggestions
      ? [scores, corrections, suggestions, improved]
      : [scores, corrections, improved];
  }

  useEffect(() => {
    async function handleUserMessage(
      skill: WritingSkill,
      question: string,
      essay: string,
    ) {
      setExaminerState("initiating");
      try {
        const response = await getWritingExaminerResponse(
          skill,
          question,
          essay,
        );
        setExaminerState("generating");

        const {
          scoresStream,
          correctionsStream,
          improvedStream,
          suggestionsStream,
        } = response;
        const feedback = await streamWritingFeedback(
          essay,
          scoresStream,
          correctionsStream,
          improvedStream,
          suggestionsStream,
        );
        setMessages((prevMessages) => [...prevMessages, ...feedback]);
        setExaminerState("idle");
      } catch (error) {
        setExaminerState("error");
      }
    }

    if (messages.length > 1) return; // Old conversation, feedback already provided

    const firstMessage = messages[0];
    if (
      !(
        skill &&
        isWritingSkill(skill) &&
        firstMessage.type === "essaySubmission"
      )
    ) {
      return;
    }

    const question = firstMessage.question;
    const essay = firstMessage.essay;
    handleUserMessage(skill, question, essay);
  }, [skill, messages, setMessages, setExaminerState]);

  // Reset feedback streams when switching conversations
  useEffect(() => {
    setScoresStream(undefined);
    setCorrectionsStream(undefined);
    setSuggestionsStream(undefined);
    setImprovedStream(undefined);
  }, [conversationId]);

  const streamingMessages = [
    scoresStream,
    correctionsStream,
    improvedStream,
    suggestionsStream,
  ].filter(Boolean) as AssistantMessage[];

  return <Conversation streamingMessages={streamingMessages} />;
}
