// conversationStore.ts
import { create } from 'zustand';
import MessageType from '@/types/message';
import { DocumentReference } from 'firebase/firestore';

type ConversationStore = {
	messages: MessageType[];
	setMessages: (updater: (prevMessages: MessageType[]) => MessageType[]) => void;
	conversationRef: DocumentReference | null;
	setConversationRef: (ref: DocumentReference | null) => void;
};

const useConversationStore = create<ConversationStore>((set) => ({
	messages: [],
	setMessages: (updater) => set((state) => ({ messages: updater(state.messages) })),
	conversationRef: null,
	setConversationRef: (ref) => set({ conversationRef: ref }),
}));

export default useConversationStore;