export default interface MessageType {
    role: 'user' | 'assistant';
    type: 'text' | 'essaySubmission' | 'displayHidden' | 'bandScores' | 'sideBySideCorrection' | 'ideaSuggestions' | 'improvedVersion' | 'error';
    content?: string;
    essayQuestion?: string;
    essay?: string;
    leftContent?: string;
    rightContent?: string;
    bandScores?: string;
}