import { create } from 'zustand';

type UserMessageState = {
    userMessage: string;
    setUserMessage: (message: string) => void;
};

export const useUserMessageStore = create<UserMessageState>((set) => ({
    userMessage: '',
    setUserMessage: (userMessage: string) => set({ userMessage }),
}));