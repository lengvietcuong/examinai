'use server';

import Groq from "groq-sdk";
import { diffWords } from 'diff';


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function handleUserMessage(messages: { role: string, content: string }[], skill: string) {
    switch (skill) {
        case "Speaking Part 1":
            return handleSpeakingPart1(messages);
        case "Speaking Part 2":
            return handleSpeakingPart2(messages);
        case "Speaking Part 3":
            return handleSpeakingPart3(messages);
        case "Writing Task 1":
            return handleWritingTask1(messages);
        case "Writing Task 2":
            return handleWritingTask2(messages);
        default:
            throw new Error(`Invalid skill: ${skill}`);
    }
}

async function handleSpeakingPart1(messages: { role: string, content: string }[]) {
    return [];
}

async function handleSpeakingPart2(messages: { role: string, content: string }[]) {
    return [];
}

async function handleSpeakingPart3(messages: { role: string, content: string }[]) {
    return [];
}

async function handleWritingTask1(messages: { role: string, content: string }[]) {
    return [];
}

async function handleWritingTask2(messages: { role: string, content: string }[]) {
    const questionAndEssay = messages[messages.length - 1].content;
    const essay = questionAndEssay.split('~~~')[1];

    const correctionPrompt = `Rewrite the following essay with all language mistakes corrected (grammar, word choice, awkward phrasing, spelling). Avoid unnecessary modifications at all costs. You must only correct actual mistakes and must not change anything else or paraphrase when there's nothing wrong with the original.\n\n${essay}`;
    const correctedEssay = await getGroqChatCompletion([{ role: "user", content: correctionPrompt }]);

    const changes = diffWords(essay, correctedEssay);
    const highlightedMistakes = changes.map(change => {
        if (change.removed) {
            return `#${change.value}#`;
        }
        if (!change.added) {
            return change.value;
        }
        return '';
    }).join('').replace(/# #/g, ' ');

    const highlightedCorrections = changes.map(change => {
        if (change.added) {
            return `*${change.value}*`;
        }
        if (!change.removed) {
            return change.value;
        }
        return '';
    }).join('').replace(/\* \*/g, ' ');

    return [{
        role: 'assistant' as 'user' | 'assistant',
        type: 'sideBySide' as 'text' | 'sideBySide' | 'grade',
        leftContent: highlightedMistakes,
        rightContent: highlightedCorrections
    }];
}

async function getGroqChatCompletion(messages: { role: string, content: string }[]) {
    const completion = await groq.chat.completions.create({
        messages: messages,
        model: "mixtral-8x7b-32768",
        temperature: 0.3
    });
    return completion.choices[0].message.content;
}

export default handleUserMessage;