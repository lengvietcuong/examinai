import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  DocumentData,
  doc,
  deleteDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import useConversationStore from "@/stores/conversationStore";
import useExaminerStateStore from "@/stores/examinerStateStore";
import useSidebarStore from "@/stores/sidebarStore";
import { getSkillAbbreviation } from "@/utils/skillUtils";
import { PiTrashBold as TrashcanIcon } from "react-icons/pi";
import { cn } from "@/lib/utils";

export default function ConversationHistory({
  className,
}: {
  className?: string;
}) {
  const [user] = useAuthState(auth);
  const [
    conversationId,
    setConversationId,
    setName,
    setSkill,
    setMessages,
    setLastAddedMessageIndex,
    clearConversation,
  ] = useConversationStore((state) => [
    state.conversationId,
    state.setConversationId,
    state.setName,
    state.setSkill,
    state.setMessages,
    state.setLastAddedMessageIndex,
    state.clearConversation,
  ]);
  const setExaminerState = useExaminerStateStore(
    (state) => state.setExaminerState,
  );
  const setIsMobileSidebarOpen = useSidebarStore(
    (state) => state.setIsMobileSidebarOpen,
  );

  const [conversations, setConversations] = useState<DocumentData[]>([]);
  const [numConversationsToFetch, setNumConversationsToFetch] = useState(25);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const scrollObserver = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!user) return;

    const conversationsCollectionRef = collection(
      db,
      `chats/${user.uid}/conversations`,
    );
    const q = query(
      conversationsCollectionRef,
      orderBy("lastModified", "desc"),
      limit(numConversationsToFetch),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(conversations);
      setHasMoreConversations(conversations.length === numConversationsToFetch);
    });

    return () => unsubscribe();
  }, [user, numConversationsToFetch]);

  const bottomMostConversationRef = useCallback(
    (node: HTMLLIElement | null) => {
      // Remove any previous observer
      if (scrollObserver.current) scrollObserver.current.disconnect();

      if (!hasMoreConversations) return;

      // When the user scrolls to the bottom-most conversation, fetch more
      scrollObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreConversations) {
          setNumConversationsToFetch((prev) => prev + 25);
        }
      });
      if (node) scrollObserver.current.observe(node);
    },
    [hasMoreConversations],
  );

  async function deleteConversation(id: string) {
    if (!user) return;

    if (id === conversationId) clearConversation(); // User deletes current conversation
    setConversations(
      conversations.filter(
        (conversation) => conversation.id !== conversationId,
      ),
    );

    const conversationRef = doc(db, `chats/${user.uid}/conversations/${id}`);
    await deleteDoc(conversationRef);
  }

  async function openConversation(id: string) {
    if (!user) return;

    const conversation = conversations.find(
      (conversation) => conversation.id === id,
    );
    if (!conversation) return;

    setConversationId(conversation.id);
    setName(conversation.name);
    setSkill(conversation.skill);
    setMessages(() => conversation.messages);
    setLastAddedMessageIndex(conversation.messages.length - 1);

    setIsMobileSidebarOpen(false);
  }

  return (
    user && (
      <ol className={cn("flex flex-col", className)}>
        {conversations.map((conversation, index) => (
          <li
            key={conversation.id}
            ref={
              index === conversations.length - 1
                ? bottomMostConversationRef
                : null
            }
            onClick={() => {
              openConversation(conversation.id);
              setExaminerState("idle");
            }}
            className={`group flex h-9 w-full flex-shrink-0 cursor-pointer items-center overflow-hidden rounded-sm p-2 text-sm hover:bg-muted-foreground/20 ${conversation.id === conversationId ? "bg-muted-foreground/20" : ""}`}
          >
            <div className="mr-3 w-6 flex-shrink-0">
              <span className="font-bold text-muted-foreground/75">
                {getSkillAbbreviation(conversation.skill)}
              </span>
            </div>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {conversation.name}
            </span>
            <button className="ml-auto mr-1 lg:mr-0">
              <TrashcanIcon
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conversation.id);
                }}
                className="lg:hidden fill-muted-foreground/75 transition-colors hover:fill-primary group-hover:block"
              />
            </button>
          </li>
        ))}
      </ol>
    )
  );
}
