import type { Conversation, Message } from "@/lib/db/schema";

// Writing

export interface WritingSubmission {
  taskNumber: "1" | "2";
  question: string;
  essay: string;
  imageUrl?: string;
  wordCount: number;
  timeSpent?: number;
}

export interface VocabularyExplanation {
  word: string;
  meaning: string;
  usage: string;
}

export interface WritingOverviewFeedback {
  overview: string;
  strengths: string[];
  weaknesses: string[];
}

export interface WritingScoringFeedback {
  taskResponseHighLevel: string;
  taskResponseStrengths: string[];
  taskResponseWeaknesses: string[];
  taskResponseScore: number | null;
  coherenceHighLevel: string;
  coherenceStrengths: string[];
  coherenceWeaknesses: string[];
  coherenceScore: number | null;
}

export interface WritingLanguageFeedback {
  lexicalResourceHighLevel: string;
  lexicalResourceStrengths: string[];
  lexicalResourceWeaknesses: string[];
  grammaticalRangeHighLevel: string;
  grammaticalRangeStrengths: string[];
  grammaticalRangeWeaknesses: string[];
  correctedEssay: string;
  keyChanges: string[];
  lexicalResourceScore: number | null;
  grammaticalRangeScore: number | null;
}

export interface WritingImprovementTask2Feedback {
  expandIdeas: string[];
  improvedEssay: string;
  vocabularyExplanations: VocabularyExplanation[];
  alternativeDirection: string;
  alternativeEssay: string;
  alternativeVocabulary: VocabularyExplanation[];
}

export interface WritingImprovementTask1Feedback {
  improvedEssay: string;
  vocabularyExplanations: VocabularyExplanation[];
}

export type WritingImprovementFeedback =
  | WritingImprovementTask2Feedback
  | WritingImprovementTask1Feedback;

// Speaking

export interface SpeakingSessionConfig {
  parts: ("1" | "2" | "3")[];
  questions: SpeakingQuestionData[];
}

export interface SpeakingQuestionData {
  partNumber: "1" | "2" | "3";
  title: string;
  content: string;
}

export interface SpeakingFeedback {
  partNumber: string;
  reaction: string;
  comment: string;
  correctedResponse: string;
  expansionIdeas: string[];
  improvedResponse: string;
  vocabularyExplanations: VocabularyExplanation[];
  nextQuestion: string | null;
  nextQuestionPartNumber: string | null;
}

// Chat

export interface ChatMessageDisplay {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  isStreaming?: boolean;
  writingSubmission?: WritingSubmission;
  speakingFeedback?: SpeakingFeedback;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// Onboarding

export interface OnboardingState {
  step: "language" | "auth" | "complete";
  language: "en" | "vi";
}

// Local Storage

export interface LocalStorageData {
  language: "en" | "vi";
  theme: "light" | "dark";
  onboardingComplete: boolean;
  activeConversationId?: string;
  guestConversations: string[];
}
