import { createOpenAI } from "@ai-sdk/openai";

export function getRandomApiKey(): string {
  const keys = (process.env.FIREWORKS_AI_API_KEY ?? "").split(",").map(k => k.trim()).filter(Boolean);
  return keys[Math.floor(Math.random() * keys.length)];
}

function createFireworks() {
  return createOpenAI({
    apiKey: getRandomApiKey(),
    baseURL: "https://api.fireworks.ai/inference/v1",
  });
}

export function chatModel() {
  return createFireworks().chat("accounts/fireworks/models/minimax-m2p5");
}

export function visionModel() {
  return createFireworks().chat("accounts/fireworks/models/qwen3-vl-30b-a3b-thinking");
}

export function namingModel() {
  return createFireworks().chat("accounts/fireworks/models/llama-v3p3-70b-instruct");
}
