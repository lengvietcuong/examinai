'use server';

import Groq from "groq-sdk";
import { diffWords } from 'diff';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

function stripRedundantPhrase(text: string) {
    if (text.startsWith('Here')) {
        const lines = text.split('\n\n').slice(1);
        return lines.join('\n\n');
    }
    return text;
}

async function getWritingAssessment(essayQuestion: string, essay: string) {
    const assessmentPrompt = `Grade the following IELTS Writing essay based on 4 criteria: Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.\n\n${essayQuestion}\n\n${essay}`;
    const bandScores = stripRedundantPhrase(await getGroqChatCompletion([{ role: "user", content: assessmentPrompt }]));

    return {
        role: 'assistant' as 'assistant',
        type: 'bandScores' as 'bandScores',
        content: bandScores
    };
}

async function getWritingCorrection(essay: string) {
    const correctionPrompt = `Rewrite the following essay with all language mistakes corrected (grammar, word choice, awkward phrasing, spelling, etc.). Avoid making redundant changes. Only output the corrected version (do not include "Here is the corrected essay:").\n\n${essay}`;
    const correctedEssay = stripRedundantPhrase(await getGroqChatCompletion([{ role: "user", content: correctionPrompt }]));

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
        role: 'assistant' as 'assistant',
        type: 'sideBySideCorrection' as 'sideBySideCorrection',
        leftContent: highlightedMistakes,
        rightContent: highlightedCorrections
    };
}

async function getWritingSuggestions(essayQuestion: string, essay: string) {
    const suggestionPrompt = `Provide a comprehensive list of potential ideas to expand and strengthen the arguments in the following essay.\n\n${essayQuestion}\n\n${essay}`;
    const ideaSuggestions = stripRedundantPhrase(await getGroqChatCompletion([{ role: "user", content: suggestionPrompt }]));

    return {
        role: 'assistant' as 'assistant',
        type: 'ideaSuggestions' as 'ideaSuggestions',
        content: ideaSuggestions
    };
}

async function getWritingImprovedVersion(essay: string) {
    const improvementPrompt = `Write an improved version of the following academic essay by using more sophisticated language and expanding on existing ideas. Then, provide a comprehensive list of brief definitions for all the advanced vocabularies and phrases used. Only output the improved version and explanations (do not include "Here is the corrected essay:").\n\n${essay}`;
    const improvedVersion = stripRedundantPhrase(await getGroqChatCompletion([{ role: "user", content: improvementPrompt }]));

    return {
        role: 'assistant' as 'assistant',
        type: 'improvedVersion' as 'improvedVersion',
        content: improvedVersion
    };
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
    return Promise.all([
        // getWritingAssessment(essayQuestion, essay),
        // getWritingCorrection(essay),
        // getWritingSuggestions(essayQuestion, essay),
        getWritingImprovedVersion(essay)
    ]);
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