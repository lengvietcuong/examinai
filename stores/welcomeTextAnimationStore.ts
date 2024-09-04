import { create } from "zustand";

type WelcomeTextAnimationState = {
  playWelcomeTextAnimation: boolean;
  setPlayWelcomeTextAnimation: (playWelcomeTextAnimation: boolean) => void;
};

const useWelcomeTextAnimationStore = create<WelcomeTextAnimationState>((set) => ({
  playWelcomeTextAnimation: true,
  setPlayWelcomeTextAnimation: (playWelcomeTextAnimation) =>
    set({ playWelcomeTextAnimation }),
}));

export default useWelcomeTextAnimationStore;
