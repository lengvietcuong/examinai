"use client";

import { CheckCircle2 } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import RobotIcon from "@/components/icons/logo";

const FEEDBACK_ITEMS = [
  "Grammar corrections",
  "Vocabulary fixes & recommendations",
  "Idea suggestions",
];

const LANGUAGES = [
  { code: "EN", label: "American", flag: "🇺🇸", selected: true },
  { code: "VI", label: "Vietnamese", flag: "🇻🇳", selected: false },
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
      <span className="rounded-2xl bg-white/70 p-2.5 shadow-sm backdrop-blur-md">
        <RobotIcon className="size-6 text-primary" />
      </span>
      <span className="font-brand text-2xl tracking-tight text-foreground">
        Examin
        <span className="text-primary">ai</span>
      </span>
    </div>
  );
}

function LanguageSwitcher() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 p-1 shadow-sm backdrop-blur-md">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
            language.selected
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-white"
          }`}
          aria-label={`Switch to ${language.label}`}
        >
          <span className="text-base leading-none">{language.flag}</span>
          <span>{language.code}</span>
        </button>
      ))}
    </div>
  );
}

function FeatureCardQuestionBank() {
  return (
    <article className="group/card rounded-4xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-md">
      <p className="mb-3 text-xs font-semibold text-primary/80">question-bank.lottie</p>
      <div className="mb-4 h-24 overflow-hidden rounded-3xl bg-linear-to-br from-rose-50 to-orange-50 p-1">
        <DotLottieAsset src="/animations/question-bank.lottie" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">1,000+ Practice Sets</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Vast question bank curated from official practice tests and real exam
        questions.
      </p>
    </article>
  );
}

function FeatureCardFeedback() {
  return (
    <article className="group/card rounded-4xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-md">
      <p className="mb-3 text-xs font-semibold text-primary/80">marking.lottie</p>
      <div className="mb-4 h-24 overflow-hidden rounded-3xl bg-linear-to-br from-sky-50 to-indigo-50 p-1">
        <DotLottieAsset src="/animations/marking.lottie" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">
        Intelligent, Detailed Feedback
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Helpful AI feedback for every attempt:
      </p>
      <ul className="mt-4 space-y-2">
        {FEEDBACK_ITEMS.map((feedbackItem) => (
          <li
            key={feedbackItem}
            className="flex items-center gap-2 text-sm text-foreground/90"
          >
            <CheckCircle2 className="size-4 text-primary" />
            <span>{feedbackItem}</span>
          </li>
        ))}
        <li className="rounded-2xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          Polished version suggestion
        </li>
      </ul>
    </article>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#ffe4e6_0%,#fff7ed_45%,#f8fafc_100%)]">
      <div className="hero-orb hero-orb--one" />
      <div className="hero-orb hero-orb--two" />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <BrandMark />
        <LanguageSwitcher />
      </header>

      <main className="relative z-20 mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-12 pt-4 md:grid-cols-2 md:px-8 md:pb-20 md:pt-10">
        <section className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-primary/15 bg-white/70 px-4 py-1 text-sm font-medium text-primary">
            AI-powered IELTS Learning Platform
          </p>
          <h1 className="text-balance text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            <span className="word-gradient">Supercharge</span> your IELTS
            journey with <span className="word-gradient-alt">AI</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Practice and improve your Speaking and Writing skills through
            detailed feedback from intelligent AI examiners.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Get Started
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <FeatureCardQuestionBank />
            <FeatureCardFeedback />
          </div>
        </section>

        <section className="relative flex justify-center md:justify-end">
          <div className="relative w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-primary/10 backdrop-blur-md">
            <div className="absolute -top-4 -left-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              examiner.lottie
            </div>
            <div className="h-[340px] overflow-hidden rounded-3xl bg-linear-to-b from-indigo-50 via-white to-rose-50">
              <DotLottieAsset src="/animations/examiner.lottie" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
