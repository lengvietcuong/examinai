'use client';

import React, { useState, useEffect, useRef } from 'react';
import TextMessage from "@/components/message/TextMessage";
import SideBySideMessage from "@/components/message/SideBySideMessage";
import GradeMessage from "@/components/message/GradeMessage";
import { useUserMessageStore } from '@/stores/userMessageStore';
import { useSkillStore } from '@/stores/skillStore';
import handleUserMessage from '@/lib/groq';
import styles from './Conversation.module.css';

interface MessageProps {
    role: 'user' | 'assistant';
    type: 'text' | 'sideBySide' | 'grade';
    content?: string;
    leftContent?: string;
    rightContent?: string;
    bandScores?: { criterion: string, score: number }[];
}

const Conversation: React.FC = () => {
    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const { userMessage, setUserMessage } = useUserMessageStore((state) => ({ userMessage: state.userMessage, setUserMessage: state.setUserMessage }));
    const messagesEndRef = useRef<HTMLDivElement>(null);

    async function onUserMessage(userMessage: string) {
        const updatedMessages = [...messages, { role: 'user' as 'user' | 'assistant', type: 'text' as 'text' | 'sideBySide' | 'grade', content: userMessage }];
        console.log(updatedMessages);
        setMessages(updatedMessages);

        const textMessages = updatedMessages
            .filter((message: MessageProps) => message.type === 'text')
            .map(({ role, content }) => ({ role, content: content || '' }));
        const chatCompletion = await handleUserMessage(textMessages, selectedSkill);
        chatCompletion.forEach((message: MessageProps) => {
            setMessages(prevMessages => [...prevMessages, { ...message }]);
        });

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
            {messages.map((message, index) => {
                switch (message.type) {
                    case 'text':
                        return <TextMessage key={index} role={message.role} content={message.content || ''} />;
                    case 'sideBySide':
                        return <SideBySideMessage key={index} role={message.role} leftContent={message.leftContent || ''} rightContent={message.rightContent || ''} />;
                    case 'grade':
                        return <GradeMessage key={index} role={message.role} bandScores={message.bandScores || []} />;
                    default:
                        return null;
                }
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default Conversation;