"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, generateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  getSpeakingCorrectionsPrompt,
  getSpeakingSuggestionsPrompt,
  getSpeakingImprovedPrompt,
  getIsFeedbackNeededPrompt,
} from "@/utils/speakingPrompts";
import {
  getWritingScoresPrompt,
  getWritingCorrectionsPrompt,
  getWritingSuggestionsPrompt,
  getWritingImprovedPrompt,
} from "@/utils/writingPrompts";
import {
  mergeCoreMessages,
  extractSpeakingExaminerResponse,
  extractLastQuestionAndAnswer,
} from "@/utils/extractMessages";
import { WritingSkill } from "@/types/skills";

const fireworks = createOpenAI({
  baseURL: "https://api.fireworks.ai/inference/v1",
  apiKey: process.env.FIREWORKS_API_KEY,
});

const groq1 = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY_1,
});
const groq2 = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY_2,
});
const groq3 = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY_3,
});
const groq4 = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY_4,
});

export async function getSpeakingExaminerResponse(messages: CoreMessage[]) {
  // If the conversation just started, the model will respond with the first question
  // Conversations from the previous version do not have separate prompts for various types of feedback
  // In both cases, only one text stream is needed
  const isGettingFirstQuestion = messages.length === 1; // The first message contains the question list
  const isPreviousVersion = !(messages[0].content as string).startsWith(
    "You are a friendly",
  );

  if (isGettingFirstQuestion || isPreviousVersion) {
    const response = await streamText({
      model: groq1("llama3-70b-8192"),
      messages,
    });
    const textStream = createStreamableValue(response.textStream);
    return textStream.value;
  }

  // Respond to the candidate's answer
  const { question, answer } = extractLastQuestionAndAnswer(messages);
  const isFeedbackNeededPrompt = getIsFeedbackNeededPrompt(question, answer);
  const [response, feedbackConsideration] = await Promise.all([
    generateText({
      model: groq1("llama3-8b-8192"),
      messages: mergeCoreMessages(messages), // Ensure messages alternate between "user" & "assistant"
    }),
    generateText({
      model: groq1("llama3-8b-8192"),
      prompt: isFeedbackNeededPrompt,
    }),
  ]);

  const { reaction, nextQuestion } = extractSpeakingExaminerResponse(
    response.text,
  );
  const isFeedbackNeeded = feedbackConsideration.text
    .toLocaleLowerCase()
    .includes("yes");
  if (!isFeedbackNeeded) {
    return { reaction, nextQuestion };
  }

  // Stream the 3 types of feedback in parallel
  const correctionPrompt = getSpeakingCorrectionsPrompt(question, answer);
  const suggestionsPrompt = getSpeakingSuggestionsPrompt(question, answer);
  const improvedPrompt = getSpeakingImprovedPrompt(question, answer);

  const [corrections, suggestions, improved] = await Promise.all([
    streamText({
      model: groq2("llama3-70b-8192"),
      temperature: 0,
      seed: 1,
      prompt: correctionPrompt,
    }),
    streamText({
      model: groq3("llama3-70b-8192"),
      prompt: suggestionsPrompt,
    }),
    streamText({
      model: groq4("gemma2-9b-it"),
      prompt: improvedPrompt,
    }),
  ]);

  const correctionsStream = createStreamableValue(corrections.textStream);
  const suggestionsStream = createStreamableValue(suggestions.textStream);
  const improvedStream = createStreamableValue(improved.textStream);

  return {
    reaction,
    nextQuestion,
    correctionsStream: correctionsStream.value,
    suggestionsStream: suggestionsStream.value,
    improvedStream: improvedStream.value,
  };
}

export async function getWritingExaminerResponse(
  skill: WritingSkill,
  question: string,
  essay: string,
) {
  const scoresPrompt = getWritingScoresPrompt(skill, question, essay);
  const correctionPrompt = getWritingCorrectionsPrompt(essay);
  const suggestionsPrompt = getWritingSuggestionsPrompt(question, essay);
  const improvedPrompt = getWritingImprovedPrompt(question, essay);

  // Stream the 4 types of feedback in parallel
  const [scores, corrections, suggestions, improved] = await Promise.all([
    streamText({
      model: groq1("llama3-70b-8192"),
      temperature: 0,
      seed: 1,
      prompt: scoresPrompt,
    }),
    streamText({
      model: fireworks.completion(
        "accounts/lengvietcuong-63786b/models/essay-correction",
      ),
      maxTokens: 1024,
      temperature: 0,
      prompt: correctionPrompt,
    }),
    streamText({
      model: groq3("llama3-70b-8192"),
      prompt: suggestionsPrompt,
    }),
    streamText({
      model: groq4("llama3-70b-8192"),
      prompt: improvedPrompt,
    }),
  ]);

  const scoresStream = createStreamableValue(scores.textStream);
  const correctionsStream = createStreamableValue(corrections.textStream);
  const improvedStream = createStreamableValue(improved.textStream);

  if (skill === "Writing Task 1") {
    return {
      scoresStream: scoresStream.value,
      correctionsStream: correctionsStream.value,
      improvedStream: improvedStream.value,
    };
  }

  const suggestionsStream = createStreamableValue(suggestions.textStream);
  return {
    scoresStream: scoresStream.value,
    correctionsStream: correctionsStream.value,
    suggestionsStream: suggestionsStream.value,
    improvedStream: improvedStream.value,
  };
}

export async function getConversationName(context: string) {
  const prompt = `Assign a short title that best describes what this question is about (do not output anything else, including quotes): ${context}`;
  const response = await generateText({
    model: groq1("llama3-8b-8192"),
    prompt,
  });
  return response.text;
}