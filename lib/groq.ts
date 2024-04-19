'use server';

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function getGroqChatCompletion(messages: { role: string, content: string }[]) {
    return groq.chat.completions.create({
        messages: messages,
        model: "mixtral-8x7b-32768"
    });
}

export default getGroqChatCompletion;