import { createOpenAI } from "@ai-sdk/openai";

type FireworksChatModel = ReturnType<ReturnType<typeof createOpenAI>["chat"]>;

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

function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { statusCode?: number; status?: number; cause?: unknown; lastError?: unknown };
  if (err.statusCode === 429 || err.status === 429) return true;
  if (err.lastError && isRateLimitError(err.lastError)) return true;
  if (err.cause && isRateLimitError(err.cause)) return true;
  return false;
}

function withFallback(primary: FireworksChatModel, fallback: FireworksChatModel): FireworksChatModel {
  const wrapper = {
    specificationVersion: primary.specificationVersion,
    provider: primary.provider,
    modelId: `${primary.modelId} (fallback: ${fallback.modelId})`,
    supportedUrls: primary.supportedUrls,
    async doGenerate(options: Parameters<FireworksChatModel["doGenerate"]>[0]) {
      try {
        return await primary.doGenerate(options);
      } catch (error) {
        if (!isRateLimitError(error)) throw error;
        console.warn(`[ai] ${primary.modelId} rate limited, falling back to ${fallback.modelId}`);
        return await fallback.doGenerate(options);
      }
    },
    async doStream(options: Parameters<FireworksChatModel["doStream"]>[0]) {
      try {
        return await primary.doStream(options);
      } catch (error) {
        if (!isRateLimitError(error)) throw error;
        console.warn(`[ai] ${primary.modelId} rate limited, falling back to ${fallback.modelId}`);
        return await fallback.doStream(options);
      }
    },
  };
  return wrapper as unknown as FireworksChatModel;
}

export function chatModel() {
  const fireworks = createFireworks();
  const primary = fireworks.chat("accounts/fireworks/models/minimax-m2p7");
  const fallback = fireworks.chat("accounts/fireworks/models/minimax-m2p5");
  return withFallback(primary, fallback);
}

export function visionModel() {
  return createFireworks().chat("accounts/fireworks/models/qwen3-vl-30b-a3b-thinking");
}

export function namingModel() {
  return createFireworks().chat("accounts/fireworks/models/llama-v3p3-70b-instruct");
}
