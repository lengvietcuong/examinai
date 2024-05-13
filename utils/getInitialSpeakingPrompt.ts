import speakingQuestions from '@/public/speakingQuestions.json';

export default function getInitialSpeakingPrompt(partNumber: 1 | 2 | 3) {
    const questionsString = getRandomSpeakingQuestions(partNumber);
    const formattingNotes = partNumber === 2 ? `\nProvide the list of hints after the phrase 'You should say:' and format it with asterisks` : '';
    const topicNotes = partNumber === 1 || partNumber === 3 ? `You should modify questions or create new ones to flexibly adapt to the conversation. Also, always say "Let's talk about <topic>" before asking about a new topic.` : 'Part 2 responses should be of substantial length and detail. In the improved version, you must be extremely elaborate and use paragraphing and paraphrasing effectively. If you run out of questions in the list, create new ones with appropriate hints.';

    return {
        role: 'user' as 'user',
        type: 'displayHidden' as 'displayHidden',
        content: `Help me practice IELTS Speaking Part ${partNumber}. Here's a list of sample questions:\n${questionsString}${formattingNotes}\n\nAfter I answer, first give a brief comment/reaction in one sentence. Then, provide detailed feedback as follows:\n1. Corrections: Fix any mistake in my response (grammar, word choice, awkward phrasing, logic, etc.). You must only include significant errors, NOT small improvements. Informal or moderately formal expressions are perfectly fine.\n2. Idea Suggestions: Provide 3 specific and straightforward ideas to expand my answer.\n3. Improved Version: Revamp my speech by using eloquent language and adding creative, playful, and humorous expressions. Also, incorporate your suggestions to expand it extensively. 4. Vocabularies and phrases: Define all the new lexical features employed in the improved version that are not in my response. This should be a comprehensive list with bold formatting.\n\nAfter the feedback, ask me another question.\n\nNotes: ${topicNotes}\n\nLet's get started (ask the first question and say nothing else).`
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