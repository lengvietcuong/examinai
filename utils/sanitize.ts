export default function sanitize(input: string): string {
    // 1. Trims leading and trailing whitespace.
    // 2. Replaces three or more consecutive line breaks with two line breaks.
    // 3. Replaces all instances of the character ’ with '.
    return input
        .trim()
        .replace(/(\r?\n|\r){3,}/g, "\n\n")
        .replace(/’/g, "'");
}