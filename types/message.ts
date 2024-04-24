export default interface MessageType {
    role: 'user' | 'assistant';
    type: 'text' | 'essaySubmission' | 'displayHidden' | 'bandScores' | 'sideBySideCorrection' | 'ideaSuggestions' | 'improvedVersion';
    content?: string;
    essayQuestion?: string;
    essay?: string;
    leftContent?: string;
    rightContent?: string;
    bandScores?: { criterion: string, score: number }[]
}