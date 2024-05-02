import speakingQuestions from '@/public/speakingQuestions.json';

export default function getInitialSpeakingPrompt(partNumber: 1 | 2 | 3) {
    const questions_string = getRandomSpeakingQuestions(partNumber);
    const formattingNotes = partNumber === 2 ? ` (after the phrase 'You should say:', list the hints using hyphens on separate lines)` : '';
    const topicNotes = partNumber === 1 || partNumber === 3 ? ` You must skip or modify questions according to what I've said. If I say I don't know, don't have, or have never done something, still provide the feedback but on the next question, please switch to something else instead. Also, always say "Let's talk about <topic>." before asking questions on a new topic and ask 3-5 questions on one topic before changing to another.` : '';

    return {
        role: 'user' as 'user',
        type: 'displayHidden' as 'displayHidden',
        content: `You are an IELTS Speaking examiner who will help me practice Speaking Part ${partNumber}. Here's the list of questions you should ask:\n${questions_string}\n\nAsk one question at a time${formattingNotes}, and after I answer, provide feedback as follows:\n1. Corrections: Specifically point out and fix all the mistakes in my response (grammar, word choice, awkward phrasing, logic, etc.). Avoid unnecessary corrections (e.g. something that's a bit formal or a bit informal is fine).\n2. Idea Suggestions: Provide 3 specific ideas to expand my answer.\n3. Improved Version: Improve my speech by using more sophisticated and witty language (I love creative and humorous expressions!), and incorporating the ideas you suggested to make it longer. Then, provide a comprehensive list of brief definitions for all the advanced vocabularies and phrases in the revised version (use hyphens).\n\nAfter the feedback, ask me another question and repeat this process.\n\nIMPORTANT NOTES: This speaking test is supposed to be informal.${topicNotes} If you run out of questions in the list, make up new topics and questions.\n\nLet's get started (dive straight into the question).`
    }
}

function getRandomSpeakingQuestions(partNumber: 1 | 2 | 3): string {
    const partQuestions = speakingQuestions[`part_${partNumber}`];
    const questions = sample(partQuestions, 3);
    
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