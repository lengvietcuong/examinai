"use client";

import { useState } from "react";
import { Home } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import RobotIcon from "@/components/icons/logo";
import { USFlag, VietnamFlag } from "@/components/icons/flags";
import { Button } from "@/components/ui/button";

const TRANSLATIONS = {
  EN: {
    title: "Page not found",
    description:
      "Looks like you wandered off the exam path. Don\u2019t worry, let\u2019s get you back on track.",
    home: "Home",
  },
  VI: {
    title: "Kh\u00f4ng t\u00ecm th\u1ea5y trang",
    description:
      "C\u00f3 v\u1ebb b\u1ea1n \u0111\u00e3 l\u1ea1c \u0111\u01b0\u1eddng. \u0110\u1eebng lo, h\u00e3y quay l\u1ea1i nh\u00e9.",
    home: "Trang ch\u1ee7",
  },
};

type Language = keyof typeof TRANSLATIONS;

const LANGUAGES = [
  { code: "EN" as Language, label: "American", flag: "us" },
  { code: "VI" as Language, label: "Vietnamese", flag: "vi" },
] as const;

function BrandMark() {
  return (
    <a href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
      <RobotIcon className="size-6 text-primary" />
      <span className="font-brand text-2xl font-bold tracking-tight text-foreground">
        Examin
        <span className="text-primary">ai</span>
      </span>
    </a>
  );
}

function LanguageSwitcher({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 p-1 shadow-sm backdrop-blur-md">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onLanguageChange(lang.code)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
            language === lang.code
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:bg-white"
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          {lang.flag === "us" ? (
            <USFlag className="size-4 shrink-0 rounded-[2px]" />
          ) : (
            <VietnamFlag className="size-4 shrink-0 rounded-[2px]" />
          )}
          <span>{lang.code}</span>
        </button>
      ))}
    </div>
  );
}

export default function NotFound() {
  const [language, setLanguage] = useState<Language>("EN");
  const t = TRANSLATIONS[language];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">

      {/* Header */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <BrandMark />
        <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
      </header>

      {/* Main content */}
      <main className="relative z-20 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 pb-20 md:px-10">
        <div className="flex h-64 w-64 items-center justify-center rounded-full bg-white sm:h-72 sm:w-72 md:h-80 md:w-80">
          <DotLottieReact
            src="/animations/404.lottie"
            loop
            autoplay
            className="h-full w-full"
          />
        </div>

        <div className="-mt-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
            {t.description}
          </p>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            className="font-heading px-7 py-3 text-base font-semibold"
            render={<a href="/" />}
          >
            <Home className="mr-1 size-4" />
            {t.home}
          </Button>
        </div>
      </main>
    </div>
  );
}
