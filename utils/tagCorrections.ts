import { diffWords } from "diff";
import { sanitize } from "./essaySubmission";

export function tagCorrections(original: string, corrected: string) {
  const changes = diffWords(original, corrected);
  const removals: string[] = [];
  const additions: string[] = [];

  changes.forEach((change) => {
    if (change.removed) {
      if (!change.value.includes("\n")) removals.push(`--${change.value}--`);
      else removals.push(change.value);
    } else if (change.added) {
      if (!change.value.includes("\n")) additions.push(`++${change.value}++`);
      else additions.push(change.value);
    } else {
      removals.push(change.value);
      additions.push(change.value);
    }
  });

  return {
    original: sanitize(removals.join("").replace(/-- --/g, " ")),
    corrected: sanitize(additions.join("").replace(/\+\+ \+\+/g, " "))
  };
}