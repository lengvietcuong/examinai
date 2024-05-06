import { create } from 'zustand';
import MessageType from '@/types/message';

type ConversationStore = {
	messages: MessageType[];
	setMessages: (updater: (prevMessages: MessageType[]) => MessageType[]) => void;
	conversationId: string | null;
	setConversationId: (id: string | null) => void;
};

const useConversationStore = create<ConversationStore>((set) => ({
	messages: [],
	setMessages: (updater) => set((state) => ({ messages: updater(state.messages) })),
	conversationId: null,
	setConversationId: (id) => set({ conversationId: id })
}));

export default useConversationStore;