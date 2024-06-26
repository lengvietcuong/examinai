import { create } from 'zustand';
import MessageType from '@/types/message';

type UserMessageState = {
    userMessage: MessageType | null;
    setUserMessage: (
        message: {
            type: 'text' | 'essaySubmission' | 'displayHidden',
            content?: string,
            essayQuestion?: string,
            essay?: string
        } | null
    ) => void;
};

const useUserMessageStore = create<UserMessageState>((set) => ({
    userMessage: null,
    setUserMessage: (
        message
    ) => {
        if (message === null) {
            set({ userMessage: null });
        } else {
            set({ userMessage: { role: 'user', ...message } });
        }
    },
}));

export default useUserMessageStore;