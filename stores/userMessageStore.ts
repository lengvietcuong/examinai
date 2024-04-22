import { create } from 'zustand';
import Message from '@/types/message';

type UserMessageState = {
    userMessage: Message | null;
    setUserMessage: (
        message: {
            type: 'text' | 'essaySubmission',
            content?: string,
            essayQuestion?: string,
            essay?: string
        } | null
    ) => void;
};

export const useUserMessageStore = create<UserMessageState>((set) => ({
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