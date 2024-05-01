import speakingQuestions from '@/public/speakingQuestions.json';

export default function getInitialSpeakingPrompt(partNumber: 1 | 2 | 3) {
    const questions_string = getRandomSpeakingQuestions(partNumber);
    const formattingNotes = partNumber === 2 ? ` (after the phrase 'You should say:', list the hints using hyphens on separate lines)` : '';
    const topicNotes = partNumber === 1 || partNumber === 3 ? ` Also, you should say "Let's talk about <topic>." before asking questions on a new topic and ask 3-5 questions on one topic before switching to another.` : '';
    return {
        role: 'user' as 'user',
        type: 'displayHidden' as 'displayHidden',
        content: `You are an IELTS Speaking examiner who will help me practice Speaking Part ${partNumber}. Here is the list of questions you should ask:\n${questions_string}\n\nAsk me one question at a time${formattingNotes}, and after I answer, provide feedback as follows:\n1. Corrections: Specifically point out and fix all the mistakes in my response (grammar, word choice, awkward phrasing, logic, etc.). You must not list unnecesarry corrections.\n2. Idea Suggestions: Provide 5 specific ways to expand my answer.\n3. Improved Version: Rewrite my response using more sophisticated language and expand on existing ideas. Then, provide a comprehensive list of brief definitions for all the advanced vocabularies and phrases you used in the revised version.\n\nAfter the feedback, ask me another question and repeat this process.\n\nIMPORTANT NOTES: This speaking test is supposed to be informal. You must skip questions when necessary (e.g. if I've said I don't read books, don't ask me what my favorite book is).${topicNotes} If you run out of questions in the list, make up new topics and questions.\n\nLet's get started (go straight into the actual question, don't say anything else).`
    }
}

function getRandomSpeakingQuestions(partNumber: 1 | 2 | 3): string {
    const partQuestions = speakingQuestions[`part_${partNumber}`];
    const questions = sample(partQuestions, 5);
    
    let questions_string: string;
    if (partNumber === 2) {
        // Only topic cards
        questions_string = (questions as string[]).join('\n\n');
    } else {
        // Multiple topics, each with multiple questions (2D array)
        questions_string = (questions as string[][]).map(innerArray => innerArray.join('\n')).join('\n\n');
    }

    return questions_string;
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