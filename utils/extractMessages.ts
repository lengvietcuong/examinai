import { CoreMessage } from "ai";
import { ScoreReport, type Message } from "@/types/messages";
import { isWritingScore, calculateOverallWritingTaskScore } from "./skillUtils";

export function extractCoreMessages(messages: Message[]): CoreMessage[] {
  const coreMessages: CoreMessage[] = [];

  for (const message of messages) {
    if (message.type === "text" || message.type === "hidden") {
      const { role, content } = message;
      coreMessages.push({ role, content });
    }
  }

  return coreMessages;
}

export function mergeCoreMessages(messages: CoreMessage[]) {
  const coreMessages: CoreMessage[] = [];

  for (const message of messages) {
    const { role, content } = message;
    // Merge content of consecutive messages with the same role
    // This ensures the messages sent to the LLM alternate between "user" and "assistant"
    if (
      coreMessages.length > 0 &&
      coreMessages[coreMessages.length - 1].role === role
    ) {
      // Also strip any leading dashes that was used for formatting
      coreMessages[coreMessages.length - 1].content += (
        content as string
      ).replace("---", "");
    } else {
      coreMessages.push(message);
    }
  }

  return coreMessages;
}

export function extractSpeakingExaminerResponse(response: string) {
  let reaction, nextQuestion;

  const parts = response.split("\n");
  const firstLine = parts[0];
  const remainingLines = parts.slice(1).join("\n").trim();

  if (remainingLines) {
    // This is the expected case
    reaction = firstLine;
    nextQuestion = `---\n${remainingLines}`;
  } else {
    // This is the unexpected case where the model doesn't write the question on a separate line
    // Split the response string by the first sentence and the rest
    const match = response.match(/([^.!?]+[.!?])([\s\S]*)/) ?? [];
    reaction = match[1].trim();
    nextQuestion = `---\n${match[2].trim()}`;
  }

  return { reaction, nextQuestion };
}

export function extractLastQuestionAndAnswer(messages: CoreMessage[]) {
  const secondLastMessage = messages[messages.length - 2].content as string;
  const lastMessage = messages[messages.length - 1].content as string;
  const question = secondLastMessage.replace("---", "").trim();
  const answer = lastMessage;

  return { question, answer };
}

export function extractWritingScores(response: string): ScoreReport {
  const scores: ScoreReport = {};
  const lines = response.split("\n");
  for (let line of lines) {
    const parts = line.split(":");
    const criterion = parts[0].trim();
    if (isWritingScore(criterion)) {
      const score = parseInt((parts[1] || "").trim());
      scores[criterion] = score;
    }
  }

  scores["Overall"] = calculateOverallWritingTaskScore(Object.values(scores));
  return scores;
}

export function stripRedundantPhrases(response: string) {
  const lines = response.split("\n");
  const firstLine = lines[0];
  const lastLine = lines[lines.length - 1] ?? "";
  if (
    firstLine.startsWith("<") ||
    firstLine.startsWith("Here") ||
    firstLine.endsWith(":")
  ) {
    // Remove phrases like "<rewritten_version>" or "Here is the improved version:"
    lines.shift();
  }
  if (lastLine.startsWith("Note") || lastLine.startsWith("Let")) {
    // Remove phrases like "Note: I made sure to maintained a conversational tone." or "Let me know if you need anything else."
    lines.pop();
  }
  
  // Strip leading and trailing double quotes
  return lines.join("\n").replace(/^"|"$/g, "");
}

export function removeRedundantDefinitions(
  userMessage: string,
  response: string,
): string {
  // Ensure the definition list only includes words the user hasn't used 
  userMessage = userMessage.toLowerCase();
  const lines = response.split("\n");
  const pattern = /\*\s\*\*(.*?)\*\*/; // Matches * **word**

  const filteredLines = lines.filter((line) => {
    const match = line.match(pattern);
    if (match) {
      const word = match[1].toLowerCase();
      return !userMessage.includes(word);
    }

    return true;
  });

  return filteredLines.join("\n");
}

export function getConversationContext(messages: Message[]) {
  const firstMessage = messages[0];
  if ("content" in firstMessage) {
    const speakingExaminerInstructions = firstMessage.content;
    const lines = speakingExaminerInstructions.split("\n");
    const firstQuestion = lines[2];
    return firstQuestion;
  } else if ("question" in firstMessage) {
    const essayQuestion = firstMessage.question;
    return essayQuestion;
  } else {
    return null;
  }
}
