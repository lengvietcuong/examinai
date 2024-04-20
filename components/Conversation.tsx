'use client';

import React, { useState, useEffect, useRef } from 'react';
import SkillSelection from "@/components/SkillSelection";
import Message from "@/components/Message";
import { MessageProps } from '@/components/Message';
import getGroqChatCompletion from '@/lib/groq';
import { useUserMessageStore } from '@/stores/userMessageStore';
import { useSkillStore } from '@/stores/skillStore';
import styles from './Conversation.module.css';

const Conversation: React.FC = () => {
    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const { userMessage, setUserMessage } = useUserMessageStore((state) => ({userMessage: state.userMessage, setUserMessage: state.setUserMessage}));
    const messagesEndRef = useRef<HTMLDivElement>(null);

    async function onUserMessage(userMessage: string) {
        const updatedMessages = [...messages, { role: 'user' as 'user' | 'assistant', content: userMessage }];
        setMessages(updatedMessages);

        const chatCompletion = await getGroqChatCompletion(updatedMessages);
        const exmainaiMessage = {
            role: 'assistant' as 'user' | 'assistant',
            content: chatCompletion.choices[0].message.content,
        };
        setMessages(prevMessages => [...prevMessages, exmainaiMessage]);

        setUserMessage('');
    }

    useEffect(() => {
        if (userMessage) {
            onUserMessage(userMessage);
        }
    }, [userMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className={styles.conversation}>
            <SkillSelection />
            {messages.map((message, index) => (
                <Message key={index} role={message.role} content={message.content} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default Conversation;