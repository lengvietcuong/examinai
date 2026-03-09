"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import RobotIcon from "@/components/icons/logo";
import { Button } from "@/components/ui/button";

const TRANSLATIONS = {
  EN: {
    heroTitle: (
      <>
        <span className="word-gradient">Supercharge</span> your IELTS journey
        with <span className="ai-underline">AI</span>
      </>
    ),
    heroDescription:
      "Practice and improve your Speaking and Writing skills through detailed feedback from intelligent AI examiners.",
    getStarted: "Get Started",
    questionBankTitle: "1,000+ Practice Sets",
    questionBankDescription:
      "Vast question bank curated from official practice tests and real exam questions.",
    feedbackTitle: "Extensive Feedback",
    feedbackDescription:
      "Grammar & vocabulary fixes and recommendations, idea suggestions, polished version, and more.",
  },
  VI: {
    heroTitle: (
      <>
        <span className="word-gradient">Nâng tầm</span> hành trình IELTS cùng{" "}
        <span className="ai-underline">AI</span>
      </>
    ),
    heroDescription:
      "Luyện tập và cải thiện kỹ năng Nói và Viết thông qua đánh giá chi tiết từ giám khảo.",
    getStarted: "Bắt đầu",
    questionBankTitle: "1,000+ Bộ đề",
    questionBankDescription:
      "Ngân hàng câu hỏi phong phú từ các đề luyện tập chính thức và bài thi thật.",
    feedbackTitle: "Đánh giá kỹ lưỡng",
    feedbackDescription:
      "Sửa lỗi ngữ pháp & từ vựng, gợi ý ý tưởng, bản hoàn chỉnh, v.v.",
  },
};

type Language = keyof typeof TRANSLATIONS;
type Translations = (typeof TRANSLATIONS)[Language];

const LANGUAGES = [
  { code: "EN" as Language, label: "American", flag: "🇺🇸" },
  { code: "VI" as Language, label: "Vietnamese", flag: "🇻🇳" },
];

type LottieAssetPath =
  | "/animations/question-bank.lottie"
  | "/animations/marking.lottie"
  | "/animations/examiner.lottie";

function DotLottieAsset({ src }: { src: LottieAssetPath }) {
  return <DotLottieReact src={src} loop autoplay className="h-full w-full" />;
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <RobotIcon className="size-6 text-primary" />
      <span className="font-brand text-2xl font-bold tracking-tight text-foreground">
        Examin
        <span className="text-primary">ai</span>
      </span>
    </div>
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
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
            language === lang.code
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:bg-white"
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          <span className="text-base leading-none">{lang.flag}</span>
          <span>{lang.code}</span>
        </button>
      ))}
    </div>
  );
}

function FeatureCardQuestionBank({ t }: { t: Translations }) {
  return (
    <article className="group/card rounded-4xl p-6">
      <div className="h-24 w-24 overflow-hidden">
        <DotLottieAsset src="/animations/question-bank.lottie" />
      </div>
      <h3 className="mt-2 text-xl font-semibold text-foreground">
        {t.questionBankTitle}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t.questionBankDescription}
      </p>
    </article>
  );
}

function FeatureCardFeedback({ t }: { t: Translations }) {
  return (
    <article className="group/card rounded-4xl p-6">
      <div className="h-24 w-24 overflow-hidden">
        <DotLottieAsset src="/animations/marking.lottie" />
      </div>
      <h3 className="mt-2 text-xl font-semibold text-foreground">
        {t.feedbackTitle}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t.feedbackDescription}
      </p>
    </article>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("EN");
  const t = TRANSLATIONS[language];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient half — top-right diagonal with wavy curve edge */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="bg-gradient"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ffe4e6" />
              <stop offset="40%" stopColor="#fff7ed" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
          </defs>
          {/* Diagonal from top-left to bottom-right with creative wavy curves */}
          <path
            d="M480,0 L1440,0 L1440,900 L960,900
               C880,900 820,820 780,740
               Q720,620 640,520
               C560,420 500,360 440,280
               Q380,200 360,100
               C350,50 400,0 480,0 Z"
            fill="url(#bg-gradient)"
          />
        </svg>
      </div>

      <div className="hero-orb hero-orb--one" />
      <div className="hero-orb hero-orb--two" />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <BrandMark />
        <LanguageSwitcher
          language={language}
          onLanguageChange={setLanguage}
        />
      </header>

      <main className="relative z-20 mx-auto grid w-full max-w-6xl items-start gap-10 px-5 pb-12 pt-4 md:px-8 md:pb-20 md:pt-10 lg:grid-cols-2">
        <section className="max-w-2xl">
          <h1 className="text-balance text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t.heroDescription}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="px-7 py-3 text-base font-semibold"
            >
              {t.getStarted}
              <ArrowRight className="ml-1 size-4 transition-transform group-hover/button:translate-x-1" />
            </Button>
          </div>
        </section>

        <section className="relative flex flex-col gap-3 lg:gap-4">
          <DotLottieAsset src="/animations/examiner.lottie" />

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCardQuestionBank t={t} />
            <FeatureCardFeedback t={t} />
          </div>
        </section>
      </main>
    </div>
  );
}
