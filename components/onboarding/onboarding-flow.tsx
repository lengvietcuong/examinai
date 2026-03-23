"use client";

import { useState, useEffect } from "react";
import { LogIn, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RobotIcon from "@/components/icons/logo";
import { USFlag, VietnamFlag } from "@/components/icons/flags";

interface OnboardingFlowProps {
  open: boolean;
  onComplete: (language: "en" | "vi", userId?: string) => void;
}

const ONBOARDING_KEY = "examinai-onboarding-complete";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function OnboardingFlow({ open, onComplete }: OnboardingFlowProps) {
  const { t, setLanguage } = useI18n();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "vi">("en");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          localStorage.setItem(ONBOARDING_KEY, "true");
          onComplete(selectedLanguage, session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [selectedLanguage, onComplete]);

  function handleLanguageSelect(lang: "en" | "vi") {
    setSelectedLanguage(lang);
    setLanguage(lang);
  }

  function handleNext() {
    setStep(2);
  }

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/chat` },
    });
  }

  function handleSkipAuth() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onComplete(selectedLanguage);
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        {step === 1 ? (
          <>
            <DialogHeader className="items-center text-center">
              <div className="mx-auto -mb-3 flex size-16 items-center justify-center rounded-2xl">
                <RobotIcon className="size-11 fill-foreground" />
              </div>
              <DialogTitle className="text-xl font-bold">
                {t.onboarding.welcome}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-foreground font-[family-name:var(--font-heading)]">
                {t.onboarding.chooseLanguage}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLanguageSelect("en")}
                  className={`relative flex flex-col items-center gap-1 rounded-xl border py-8 px-4 overflow-hidden transition-all outline-none ${
                    selectedLanguage === "en"
                      ? "border-primary/30 bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                >
                  <span className="absolute top-0 left-0 rounded-br-lg bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                    {t.onboarding.recommended}
                  </span>
                  <USFlag className="block h-11 w-auto shrink-0 rounded-[3px]" />
                  <span className="text-sm font-medium">English</span>
                </button>

                <button
                  onClick={() => handleLanguageSelect("vi")}
                  className={`relative flex flex-col items-center gap-1 rounded-xl border py-8 px-4 overflow-hidden transition-all outline-none ${
                    selectedLanguage === "vi"
                      ? "border-primary/30 bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                >
                  <VietnamFlag className="block h-11 w-auto shrink-0 rounded-[3px]" />
                  <span className="text-sm font-medium">Tiếng Việt</span>
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground leading-relaxed">
                {t.onboarding.languageRecommendation}
              </p>
            </div>

            <Button size="lg" onClick={handleNext} className="w-full gap-2 font-medium">
              {t.common.next}
              <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-1" />
            </Button>
          </>
        ) : (
          <>
            <DialogHeader className="items-center text-center">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                <LogIn className="size-6 text-primary" />
              </div>
              <DialogTitle className="text-lg font-bold">
                {t.common.signIn}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t.onboarding.signInBenefits}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={handleGoogleSignIn}
                className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90 font-medium"
              >
                <GoogleIcon className="size-5" />
                {t.onboarding.continueWithGoogle}
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {t.common.or}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={handleSkipAuth}
                className="w-full font-medium"
              >
                {t.onboarding.continueWithoutAccount}
              </Button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {t.common.back}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
