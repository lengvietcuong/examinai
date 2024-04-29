'use server';

import Groq from "groq-sdk";
import { diffWords } from 'diff';
import getBandDescriptorsString from "@/utils/formatBandDescriptors";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

function stripRedundantPhrases(text: string): string {
    let parts: string[] = text.split('\n\n');
    if (parts[0].startsWith('Here')) parts.shift();
    if (parts[parts.length - 1].startsWith('Note')) parts.pop();
    return parts.join('\n\n');
}

async function getWritingAssessment(taskType: 'task_1' | 'task_2', essayQuestion: string, essay: string) {
    const taskNumber = taskType.charAt(taskType.length - 1);
    // By default, the model is extremely strict, so the first sentence of the prompt is set to negate this
    const assessmentPrompt = `You are a lenient IELTS examiner who is known to give high marks. Every essay is assessed based on these 4 criteria:\n\n${getBandDescriptorsString('writing', taskType)}Now, help me assess the following Writing Task ${taskNumber} essay. Only provide the band scores for the 4 criteria, nothing else is required. Here is the essay question (make sure it is paraphrased appropriately in the essay and not just copied entirely):\n${essayQuestion}\n\nAnd here is the essay:\n${essay}`;
    const bandScores = stripRedundantPhrases(await getGroqChatCompletion([{ role: "user", content: assessmentPrompt }]));

    return {
        role: 'assistant' as 'assistant',
        type: 'bandScores' as 'bandScores',
        bandScores: bandScores
    };
}

async function getWritingCorrection(taskType: 'task_1' | 'task_2', essay: string) {
    const task1Notes = taskType === 'task_1' ? 'IMPORTANT: Do not change a number into a word (e.g. "6 months" into "six months" or "30 days" into "thirty days"). Finally, only output the corrected version, nothing else.' : '';
    const correctionPrompt = `Rewrite the following academic essay with all language mistakes corrected (grammar, word choice, awkward phrasing, spelling, etc.). You must not make unnecessary changes, i.e. do not change something if the original is perfectly fine.${task1Notes}\n\n${essay}`;

    const correctedEssay = stripRedundantPhrases(await getGroqChatCompletion([{ role: "user", content: correctionPrompt }]));

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
    const suggestionPrompt = `List 5 thoughtful and specific ideas to strengthen the main arguments in the following essay. Expand vertically and not horizontally, meaning you should go deeper into existing ideas and explore what has not been mentioned, and should not create completely different ones. Each suggestion should have a bold, direct title and a sample sentence below to show how the idea can be incorporated into the essay, and nothing else. Do not recommend studies, statistics, or generic ideas.\n\n${essayQuestion}\n\n${essay}`;
    const ideaSuggestions = stripRedundantPhrases(await getGroqChatCompletion([{ role: "user", content: suggestionPrompt }]));

    return {
        role: 'assistant' as 'assistant',
        type: 'ideaSuggestions' as 'ideaSuggestions',
        content: ideaSuggestions
    };
}

async function getWritingImprovedVersion(taskType: 'task_1' | 'task_2', essay: string) {
    const taskNotes = taskType === 'task_2' ? ' and adding more supporting ideas to make the main arguments longer. You should maintain the original structure' : '. When providing the overview, use the word "Overall"';
    const improvementPrompt = `Write an improved version of the following academic essay by using more sophisticated language (make sure to maintain a formal tone)${taskNotes}. Finally, provide a comprehensive list of brief definitions for all the advanced vocabularies and phrases used.\n\n${essay}`;
    const improvedVersion = stripRedundantPhrases(await getGroqChatCompletion([{ role: "user", content: improvementPrompt }]));

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
    return Promise.all([
        getWritingAssessment('task_1', essayQuestion, essay),
        getWritingCorrection('task_1', essay),
        getWritingImprovedVersion('task_1', essay)
    ]);
}

async function handleWritingTask2(essayQuestion: string, essay: string) {
    return Promise.all([
        getWritingAssessment('task_2', essayQuestion, essay),
        getWritingCorrection('task_2', essay),
        getWritingSuggestions(essayQuestion, essay),
        getWritingImprovedVersion('task_2', essay)
    ]);
}

async function getGroqChatCompletion(messages: { role: string, content: string }[]) {
    const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-70b-8192",
        temperature: 0
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