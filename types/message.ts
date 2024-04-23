export default interface MessageType {
    role: 'user' | 'assistant';
    type: 'text' | 'essaySubmission' | 'sideBySide' | 'grade' | 'displayHidden';
    content?: string;
    essayQuestion?: string;
    essay?: string;
    leftContent?: string;
    rightContent?: string;
    bandScores?: { criterion: string, score: number }[]
}