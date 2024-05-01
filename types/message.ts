export default interface MessageType {
    role: 'user' | 'assistant';
    type: 'text' | 'essaySubmission' | 'bandScores' | 'sideBySideCorrection' | 'ideaSuggestions' | 'improvedVersion' | 'error' | 'displayHidden';
    content?: string;
    essayQuestion?: string;
    essay?: string;
    leftContent?: string;
    rightContent?: string;
    bandScores?: string;
}