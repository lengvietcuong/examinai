import speakingQuestions from '@/public/speakingQuestions.json';

export default function getInitialSpeakingPrompt(partNumber: 1 | 2 | 3) {
    const questionsString = getRandomSpeakingQuestions(partNumber);
    const formattingNotes = partNumber === 2 ? `\n(after the phrase 'You should say:', list the hints using hyphens on separate lines).` : '';
    const topicNotes = partNumber === 1 || partNumber === 3 ? ` If I say I don't know, don't have, or have never done something, still provide feedback on my response but you must skip or modify future questions related to that topic. Also, always say "Let's talk about <topic>." before asking about a new topic and change topics every 3-5 questions.` : '';

    return {
        role: 'user' as 'user',
        type: 'displayHidden' as 'displayHidden',
        content: `Help me practice IELTS Speaking Part ${partNumber}. Here's a list of questions you should ask:\n${questionsString}${formattingNotes}\n\nAfter I answer, provide feedback as follows:\n1. Corrections: Fix every mistake in my response (grammar, word choice, awkward phrasing, logic, etc.). Only include significant errors, not minor improvements. Note that informal expressions are perfectly fine for speaking.\n2. Idea Suggestions: Provide 3 new and specific ideas to expand my answer.\n3. Improved Version: Write a more eloquent and longer version of my speech. You should use less common and sophisticated language, add creative, playful, and humorous expressions, and incorporate your suggestions to expand it extensively. Then, provide a comprehensive list of brief definitions for all the advanced vocabularies and phrases in the revised version (use hyphens).\n\nAfter the feedback, ask me another question and repeat this process.\n\nIMPORTANT:${topicNotes} If you run out of questions in the list, make up new topics and questions.\n\nLet's get started (ask the first question and say nothing else).`
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