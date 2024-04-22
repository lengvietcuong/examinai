export default function sanitize(input: string): string {
    const trimmedInput = input.trim();
    const sanitizedInput = trimmedInput.replace(/’/g, "'");
    return sanitizedInput;
}
