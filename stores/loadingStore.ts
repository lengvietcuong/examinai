import { create } from 'zustand';

type LoadingState = {
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
    isLoading: false,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));