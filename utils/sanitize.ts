export default function sanitize(input: string): string {
    const trimmedInput = input.trim().replace(/(\r?\n|\r){3,}/g, "\n\n");
    const sanitizedInput = trimmedInput.replace(/’/g, "'");
    return sanitizedInput;
}
