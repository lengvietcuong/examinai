export function getWordCount(input: string): number {
  return input.split(/\s+/).filter((word) => word).length;
}

export function sanitize(input: string): string {
  return input
    .replace(/(\r?\n|\r){3,}/g, "\n\n") // Collapse 3 or more consecutive line breaks into 2
    .replace(/’/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .trim();
}