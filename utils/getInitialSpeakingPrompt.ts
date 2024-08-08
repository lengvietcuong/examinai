import speakingQuestions from '@/public/speakingQuestions.json';

export default function getInitialSpeakingPrompt(partNumber: 1 | 2 | 3) {
    const questions = getRandomSpeakingQuestions(partNumber);
    const topicNotes = partNumber === 1 || partNumber === 3 ? `You should modify questions or create new ones to flexibly adapt to the conversation.\nAlways say "Let's talk about <topic>" before asking about a new topic.` : `For the improved version, you must break it up into 3 or more paragraphs, paraphrase extensively, and ensure substantial length (1000+ words).\nIf you run out of questions in the list, create new ones.\nWith every question, provide a bullet list of what the candidate should say.`;

    return {
        role: 'user' as 'user',
        type: 'displayHidden' as 'displayHidden',
        content: `You are an IELTS Speaking examiner for Part ${partNumber}. You should ask the following questions, one at a time:\n${questions}\n\nAfter the candidate answers, first give a reaction in one sentence. Then, provide detailed feedback exactly as follows:\n## Corrections\nFix any major mistakes in the response. Do not rephrase sentences that are already fine.\n## Idea Suggestions\nProvide 3 concrete ideas to expand their answer.\n## Improved Version\nRefine the language used and incorporate the ideas you suggested. If the candidate's response indicates that they are a beginner in English, stick with basic, 5th-grader vocabulary only, so they can easily understand. Otherwise, use sophisticated language and add creative and humorous expressions (e.g. quotes, idioms, metaphors, etc.) to make it an engaging speech.\n### Vocabulary and phrases\nProvide a bullet list with bold formatting of definitions for all the new lexical features you employed in the improved version (that are not in the candidate's original answer).\n\n## Next question\nAsk the next question.\n\nNotes:\nThis speaking exam is informal.\n${topicNotes}\nUse Markdown-style formatting.\n\nLet's get started.`
    }
}

function getRandomSpeakingQuestions(partNumber: 1 | 2 | 3): string {
    const partQuestions = speakingQuestions[`part_${partNumber}`];
    const questions = sample(partQuestions, 3);
    
    let questionsString: string;
    if (partNumber === 2) {
        // Only topic cards
        questionsString = (questions as string[]).join('\n\n');
    } else {
        // Multiple topics, each with multiple questions (2D array)
        questionsString = (questions as string[][]).map(innerArray => innerArray.join('\n')).join('\n\n');
    }

    return questionsString;
}

function sample<T>(array: T[] | T[][], size: number): T[] | T[][] {
    const shuffled = array.slice();
    let currentIndex = shuffled.length;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap it with the current element.
        [shuffled[currentIndex], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[currentIndex],
        ];
    }

    return shuffled.slice(0, size);
}