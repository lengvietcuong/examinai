'use server';

import Groq from "groq-sdk";
import { diffWords } from 'diff';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function getWritingAssessment(essayQuestion: string, essay: string) {
    return {};
}

async function getWritingCorrection(essay: string) {
    const correctionPrompt = `Rewrite the following essay with all language mistakes corrected (grammar, word choice, awkward phrasing, spelling, etc.). Avoid making redundant changes. Only output the corrected version (do not include "Here is the corrected essay:").\n\n${essay}`;

    let correctedEssay = await getGroqChatCompletion([{ role: "user", content: correctionPrompt }]);
    if (correctedEssay.startsWith('Here is')) {
        const lines = correctedEssay.split('\n\n').slice(1);
        correctedEssay = lines.join('\n\n');
    }

    const changes = diffWords(essay, correctedEssay);
    const highlightedMistakes = changes.map(change => {
        if (change.removed && change.value !== '\n') {
            return `#${change.value}#`;
        }
        if (!change.added && change.value !== '\n') {
            return change.value;
        }
        return '';
    }).join('').replace(/# #/g, ' ');

    const highlightedCorrections = changes.map(change => {
        if (change.added && change.value !== '\n') {
            return `*${change.value}*`;
        }
        if (!change.removed && change.value !== '\n') {
            return change.value;
        }
        return '';
    }).join('').replace(/\* \*/g, ' ');

    return {
        role: 'assistant' as 'user' | 'assistant',
        type: 'sideBySide' as 'text' | 'essaySubmission' | 'sideBySide' | 'grade',
        leftContent: highlightedMistakes,
        rightContent: highlightedCorrections
    };
}

async function getWritingSuggestions(essayQuestion: string, essay: string) {
    return {};
}

async function getWritingImprovedVersion(essay: string) {
    return {};
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

async function handleWritingTask1(essayQuestion: string, essay: string) {
    return [];
}

async function handleWritingTask2(essayQuestion: string, essay: string) {
    return [await getWritingCorrection(essay)];
    // return Promise.all([
    //     getWritingAssessment(essayQuestion, essay),
    //     getWritingCorrection(essay),
    //     getWritingSuggestions(essayQuestion, essay),
    //     getWritingImprovedVersion(essay)
    // ]);
}

async function getGroqChatCompletion(messages: { role: string, content: string }[]) {
    const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-70b-8192",
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