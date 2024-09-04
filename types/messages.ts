import { WritingScore } from "./skills";

export type ScoreReport = {
  [key in WritingScore]?: number;
};

export type UserMessage = { role: "user" } & (
  | { type: "text"; content: string }
  | { type: "essaySubmission"; question: string; essay: string }
  | { type: "hidden"; content: string }
);

export type AssistantMessage = { role: "assistant" } & (
  | { type: "text"; content: string }
  | { type: "scores"; scores: ScoreReport }
  | { type: "corrections"; original: string; corrected: string }
  | { type: "suggestions"; content: string }
  | { type: "improved"; content: string }
  | { type: "loading" }
  | { type: "error" }
);

export type Message = UserMessage | AssistantMessage;
