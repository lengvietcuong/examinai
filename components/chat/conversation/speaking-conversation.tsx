"use client";

import { useState, useEffect } from "react";
import useConversationStore from "@/stores/conversationStore";
import useExaminerStateStore from "@/stores/examinerStateStore";
import { getSpeakingExaminerResponse } from "@/app/actions";
import { streamResponse } from "@/utils/streamResponse";
import { StreamableValue } from "ai/rsc";
import { AssistantMessage } from "@/types/messages";
import Conversation from "./conversation";
import {
  extractCoreMessages,
  stripRedundantPhrases,
} from "@/utils/extractMessages";
import { tagCorrections } from "@/utils/tagCorrections";

export default function SpeakingConversation() {
  const [conversationId, messages, setMessages] = useConversationStore((state) => [
    state.conversationId,
    state.messages,
    state.setMessages,
  ]);
  const setExaminerState = useExaminerStateStore(
    (state) => state.setExaminerState,
  );

  const [textStream, setTextStream] = useState<AssistantMessage>();
  const [correctionsStream, setCorrectionsStream] =
    useState<AssistantMessage>();
  const [suggestionsStream, setSuggestionsStream] =
    useState<AssistantMessage>();
  const [improvedStream, setImprovedStream] = useState<AssistantMessage>();

  async function streamBasicTextResponse(textStream: StreamableValue) {
    const text = await streamResponse(
      textStream,
      (content) => ({
        role: "assistant",
        type: "text",
        content,
      }),
      setTextStream,
    );

    // Stream finished
    setTextStream(undefined);
    return text;
  }

  async function streamSpeakingFeedback(
    userMessage: string,
    correctionsStream: StreamableValue,
    suggestionsStream: StreamableValue,
    improvedStream: StreamableValue,
  ) {
    const [corrections, suggestions, improved] = await Promise.all([
      streamResponse(
        correctionsStream,
        (content) => {
          const { original, corrected } = tagCorrections(
            userMessage,
            stripRedundantPhrases(content),
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
        suggestionsStream,
        (content) => ({
          role: "assistant",
          type: "suggestions",
          content: stripRedundantPhrases(content),
        }),
        setSuggestionsStream,
      ),
      streamResponse(
        improvedStream,
        (content) => ({
          role: "assistant",
          type: "improved",
          content: stripRedundantPhrases(content),
        }),
        setImprovedStream,
      ),
    ]);

    // Stream finished
    setCorrectionsStream(undefined);
    setSuggestionsStream(undefined);
    setImprovedStream(undefined);

    return [corrections, suggestions, improved];
  }

  useEffect(() => {
    async function handleUserMessage(userMessage: string) {
      const coreMessages = extractCoreMessages(messages);
      setExaminerState("initiating");
      try {
        const response = await getSpeakingExaminerResponse(coreMessages);
        setExaminerState("generating");

        // Response contains a single text stream (in old conversations or when asking first question)
        if (!("reaction" in response)) {
          const text = await streamBasicTextResponse(response);
          setMessages((prevMessages) => [...prevMessages, text]);
          setExaminerState("idle");
          return;
        }

        // Response contains an object with potentially multiple streams
        const reaction: AssistantMessage = {
          role: "assistant",
          type: "text",
          content: response.reaction,
        };
        const nextQuestion: AssistantMessage = {
          role: "assistant",
          type: "text",
          content: response.nextQuestion,
        };
        // Response does not include feedback (user answered off-topic or asked a question)
        if (!response.correctionsStream) {
          setMessages((prevMessages) => [
            ...prevMessages,
            reaction,
            nextQuestion,
          ]);
          setExaminerState("idle");
          return;
        }

        setTextStream(reaction);
        // Stream the 3 types of feedback in parallel
        const feedback = await streamSpeakingFeedback(
          userMessage,
          response.correctionsStream,
          response.suggestionsStream,
          response.improvedStream,
        );
        setMessages((prevMessages) => [
          ...prevMessages,
          reaction,
          ...feedback,
          nextQuestion,
        ]);
        setExaminerState("idle");
      } catch (error) {
        setExaminerState("error");
      }
    }

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === "user" &&
      "content" in lastMessage
    ) {
      handleUserMessage(lastMessage.content);
    }
  }, [messages, setMessages, setExaminerState]);

  // Reset feedback streams when switching conversations
  useEffect(() => {
    setTextStream(undefined);
    setCorrectionsStream(undefined);
    setSuggestionsStream(undefined);
    setImprovedStream(undefined);
  }, [conversationId]);

  const streamingMessages = [
    textStream,
    correctionsStream,
    suggestionsStream,
    improvedStream,
  ].filter(Boolean) as AssistantMessage[];

  return <Conversation streamingMessages={streamingMessages} />;
}
