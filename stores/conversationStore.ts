import { create } from "zustand";
import { Skill } from "@/types/skills";
import { Message } from "@/types/messages";

type ConversationStore = {
  conversationId: string | undefined;
  name: string | undefined;
  skill: Skill | undefined;
  messages: Message[];
  lastAddedMessageIndex: number;

  setConversationId: (conversationId: string) => void;
  setName: (name: string) => void;
  setSkill: (skill: Skill) => void;
  setMessages: (updater: (prevMessages: Message[]) => Message[]) => void;
  setLastAddedMessageIndex: (index: number) => void;
  clearConversation: () => void;
};

const useConversationStore = create<ConversationStore>((set) => ({
  conversationId: undefined,
  name: undefined,
  skill: undefined,
  messages: [],
  lastAddedMessageIndex: -1,

  setConversationId: (conversationId) => set({ conversationId }),
  setName: (name) => set({ name: name }),
  setSkill: (skill) => set({ skill: skill }),
  setMessages: (updater) =>
    set((state) => ({ messages: updater(state.messages) })),
  setLastAddedMessageIndex: (index) => set({ lastAddedMessageIndex: index }),
  clearConversation: () =>
    set({
      conversationId: undefined,
      name: undefined,
      skill: undefined,
      messages: [],
    }),
}));

export default useConversationStore;
