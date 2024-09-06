import { diffWords } from "diff";

export function tagCorrections(original: string, corrected: string) {
  const originalParagraphs = original
    .split(/\r?\n/)
    .filter((paragraph) => paragraph.trim() !== "");
  const correctedParagraphs = corrected
    .split(/\r?\n/)
    .filter((paragraph) => paragraph.trim() !== "");

  const maxLength = Math.max(
    originalParagraphs.length,
    correctedParagraphs.length,
  );
  for (let index = 0; index < maxLength; index++) {
    const originalParagraph = originalParagraphs[index] ?? "";
    const correctedParagraph = correctedParagraphs[index] ?? "";

    const changes = diffWords(originalParagraph, correctedParagraph);
    const taggedOriginalParts: string[] = [];
    const taggedCorrectedParts: string[] = [];
    changes.forEach((change) => {
      if (change.removed) {
        taggedOriginalParts.push(`--${change.value}--`);
      } else if (change.added) {
        taggedCorrectedParts.push(`++${change.value}++`);
      } else {
        taggedOriginalParts.push(change.value);
        taggedCorrectedParts.push(change.value);
      }
    });

    originalParagraphs[index] = taggedOriginalParts
      .join("")
      .replace(/-- +--/g, " ");
    correctedParagraphs[index] = taggedCorrectedParts
      .join("")
      .replace(/\+\+ +\+\+/g, " ");
  }

  return {
    original: originalParagraphs.join("\n\n").trim(),
    corrected: correctedParagraphs.join("\n\n").trim(),
  };
}
