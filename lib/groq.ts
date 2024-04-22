'use server';

import Groq from "groq-sdk";
import { diffWords } from 'diff';
import Message from "@/types/message";


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function handleSpeakingPart1(messages: { role: string, content: string }[]) {
    return [];
}

async function handleSpeakingPart2(messages: { role: string, content: string }[]) {
    return [];
}

async function handleSpeakingPart3(messages: { role: string, content: string }[]) {
    return [];
}

async function handleWritingTask1(essayQuestion: string, essay: string) {
    return [];
}

async function handleWritingTask2(essayQuestion: string, essay: string) {
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
        type: 'sideBySide' as 'text' | 'essaySubmission' | 'sideBySide' | 'grade',
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

export {
    handleSpeakingPart1,
    handleSpeakingPart2,
    handleSpeakingPart3,
    handleWritingTask1,
    handleWritingTask2
};