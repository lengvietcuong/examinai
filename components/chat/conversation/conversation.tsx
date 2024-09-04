"use client";

import { useEffect, useRef } from "react";
import useConversationStore from "@/stores/conversationStore";
import useExaminerStateStore from "@/stores/examinerStateStore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import {
  AssistantMessage,
  type Message as MessageType,
} from "@/types/messages";
import { getConversationName } from "@/app/actions";
import { getConversationContext } from "@/utils/extractMessages";
import Message from "../message/message";
import { DEFAULT_CONVERSATION_NAME } from "@/constants";
import { isWritingSkill } from "@/utils/skillUtils";

interface ConversationProps {
  streamingMessages?: AssistantMessage[];
}

export default function Conversation({
  streamingMessages = [],
}: ConversationProps) {
  const [
    conversationId,
    setConversationId,
    name,
    setName,
    skill,
    messages,
    lastAddedMessageIndex,
    setLastAddedMessageIndex,
  ] = useConversationStore((state) => [
    state.conversationId,
    state.setConversationId,
    state.name,
    state.setName,
    state.skill,
    state.messages,
    state.lastAddedMessageIndex,
    state.setLastAddedMessageIndex,
  ]);
  const [user] = useAuthState(auth);
  const examinerState = useExaminerStateStore((state) => state.examinerState);
  const messageToScrollToRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function addMessages() {
      if (!user || lastAddedMessageIndex === messages.length - 1) return;

      const newMessages = messages.slice(lastAddedMessageIndex + 1);
      if (!conversationId) {
        // Create new conversation
        const ref = await addDoc(
          collection(db, `chats/${user.uid}/conversations`),
          {
            skill,
            name: DEFAULT_CONVERSATION_NAME,
            messages,
            lastModified: serverTimestamp(),
          },
        );
        setConversationId(ref.id);
      } else {
        // Append new messages to existing conversation
        await updateDoc(
          doc(db, `chats/${user.uid}/conversations/${conversationId}`),
          {
            messages: arrayUnion(...newMessages),
            lastModified: serverTimestamp(),
          },
        );
      }
      setLastAddedMessageIndex(messages.length - 1);
    }

    addMessages();
  }, [
    user,
    conversationId,
    setConversationId,
    skill,
    messages,
    lastAddedMessageIndex,
    setLastAddedMessageIndex,
  ]);

  useEffect(() => {
    async function nameConversation() {
      if (!user || !conversationId || name) return;

      const context = getConversationContext(messages);
      if (!context) return;
      try {
        const newName = await getConversationName(context);
        await updateDoc(
          doc(db, `chats/${user.uid}/conversations/${conversationId}`),
          {
            name: newName,
          },
        );
        setName(newName);
      } catch (error) {
        // Ignore if naming fails as it is not a crucial operation
      }
    }

    nameConversation();
  }, [user, conversationId, name, setName, messages]);

  useEffect(() => {
    if (!messageToScrollToRef.current) return;

    const elementPosition =
      messageToScrollToRef.current.getBoundingClientRect().top;
    const headerHeight = 64;
    const offsetPosition = elementPosition + window.scrollY - headerHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }, [streamingMessages.length, examinerState]);

  function renderMessage(message: MessageType, index: number) {
    // Do not render the same sender's avatar multiple times for consecutive messages
    const isSenderDifferentFromLastMessage =
      index === 0 || allMessages[index - 1].role !== message.role;
    const isSenderDifferentFromNextMessage =
      index === allMessages.length - 1 ||
      message.role !== allMessages[index + 1].role;

    let isMessageToScrollTo = false;
    const isOngoingConversation = allMessages.length > messages.length && skill;
    if (isOngoingConversation) {
      isMessageToScrollTo = isWritingSkill(skill)
        ? index === messages.length // Scroll to the 'scores' message (first streaming message)
        : index === messages.length - 1; // Scroll to the 'reaction' message (not streamed)
    }

    return (
      <Message
        key={index}
        ref={isMessageToScrollTo ? messageToScrollToRef : undefined}
        message={message}
        renderAvatar={isSenderDifferentFromLastMessage}
        className={`${isSenderDifferentFromNextMessage ? "pb-12" : "pb-8"}`}
      />
    );
  }

  const allMessages = [...messages, ...streamingMessages];
  if (examinerState === "initiating") {
    allMessages.push({
      role: "assistant",
      type: "loading",
    });
  } else if (examinerState === "error") {
    allMessages.push({
      role: "assistant",
      type: "error",
    });
  }

  return (
    <>{allMessages.map((message, index) => renderMessage(message, index))}</>
  );
}
