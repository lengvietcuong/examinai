"use client";

import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import useWelcomeTextAnimationStore from "@/stores/welcomeTextAnimationStore";

export default function WelcomeText() {
  const welcomeText = "What would you like to practice?";
  const className = "text-center text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 lg:mb-8";
  const { playWelcomeTextAnimation, setPlayWelcomeTextAnimation } =
    useWelcomeTextAnimationStore((state) => state);

  if (playWelcomeTextAnimation) {
    // The animation only plays the first time the user vists the website
    // Wait 1s before disabling future animations for the current animation to finish
    setTimeout(() => {
      setPlayWelcomeTextAnimation(false);
    }, 1000);

    return <TextGenerateEffect words={welcomeText} className={className} />;
  }

  return <h1 className={className}>{welcomeText}</h1>;
}
