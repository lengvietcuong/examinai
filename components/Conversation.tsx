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
    const { selectedSkill, setSelectedSkill } = useSkillStore();
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const { userMessage, setUserMessage } = useUserMessageStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    async function onUserMessage(userMessage: string) {
        setMessages(prevMessages => [...prevMessages, { sender: 'You', content: userMessage }]);
        setUserMessage('');

        const chatCompletion = await getGroqChatCompletion(userMessage);
        const exmainaiMessage = {
            sender: 'Examinai',
            content: chatCompletion.choices[0].message.content,
        };
        setMessages(prevMessages => [...prevMessages, exmainaiMessage]);
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
                <Message key={index} sender={message.sender} content={message.content} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default Conversation;