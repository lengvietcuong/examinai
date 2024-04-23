'use client';

import React, { useState, useEffect, useRef } from 'react';
import Message from './message/Message';
import MessageType from '@/types/message';
import TextMessage from "@/components/message/TextMessage";
import EssaySubmissionMessage from './message/EssaySubmissionMessage';
import SideBySideMessage from "@/components/message/SideBySideMessage";
import GradeMessage from "@/components/message/GradeMessage";
import EssayForm from './EssayForm';
import { useUserMessageStore } from '@/stores/userMessageStore';
import { useSkillStore } from '@/stores/skillStore';
import { handleSpeakingPart1, handleSpeakingPart2, handleSpeakingPart3, handleWritingTask1, handleWritingTask2 } from '@/lib/groq';
import styles from './Conversation.module.css';

const LoadingMessage: React.FC = () => {
    const [dots, setDots] = useState('');
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(dots => dots.length < 3 ? dots + '.' : '');
        }, 250);
        return () => clearInterval(interval);
    }, []);
    return (
        <Message role="assistant">
            <p>Just a second{dots}</p>
        </Message>
    );
};

const Conversation: React.FC = () => {
    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const { userMessage, setUserMessage } = useUserMessageStore((state) => ({ userMessage: state.userMessage, setUserMessage: state.setUserMessage }));
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function onUserMessage(userMessage: MessageType) {
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        setIsLoading(true);
        let responseMessages: MessageType[] = [];
        switch (selectedSkill) {
            case 'Speaking Part 1':
            case 'Speaking Part 2':
            case 'Speaking Part 3': {
                const textMessages = updatedMessages
                    .filter(message => message.type === 'text' || message.type === 'displayHidden')
                    .map(({ role, content }) => ({ role, content: content || '' }));
                if (selectedSkill === 'Speaking Part 1') {
                    responseMessages = await handleSpeakingPart1(textMessages);
                } else if (selectedSkill === 'Speaking Part 2') {
                    responseMessages = await handleSpeakingPart2(textMessages);
                } else {
                    responseMessages = await handleSpeakingPart3(textMessages);
                }
                break;
            }
            case 'Writing Task 1':
                responseMessages = await handleWritingTask1(userMessage.essayQuestion || '', userMessage.essay || '');
                break;
            case 'Writing Task 2':
                responseMessages = await handleWritingTask2(userMessage.essayQuestion || '', userMessage.essay || '');
                break;
            default:
                break;
        }
        setMessages(prevMessages => [...prevMessages, ...responseMessages]);

        setUserMessage(null);
        setIsLoading(false);
    }

    useEffect(() => {
        if (selectedSkill && selectedSkill.startsWith('Speaking')) {
            setUserMessage({
                type: 'displayHidden',
                content: `Act as an IELTS Speaking examiner. Ask me one random ${selectedSkill} question, and when I'm finished answering, ask me another one and repeat this process.`,
            });
        }
    }, [selectedSkill]);

    useEffect(() => {
        if (userMessage) {
            onUserMessage(userMessage);
        }
    }, [userMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            {messages.length === 0 && (selectedSkill === 'Writing Task 1' || selectedSkill === 'Writing Task 2') &&
                <>
                    <Message role="assistant">
                        <p className={styles.instruction}>
                            Please submit the essay question and your essay. I will assess it and provide detailed feedback.
                            <br />
                            <br />
                            Don't know where to find {selectedSkill} questions? Check out <a href="https://study4.com/tests/?term=IELTS+Writing" target="_blank" rel="noopener noreferrer">Study4</a>.
                        </p>
                    </Message>
                    <EssayForm />
                </>
            }
            <div className={styles.conversation}>
                {messages.map((message, index) => {
                    switch (message.type) {
                        case 'text':
                            return <TextMessage key={index} role={message.role} content={message.content || ''} />;
                        case 'essaySubmission':
                            return <EssaySubmissionMessage key={index} essayQuestion={message.essayQuestion || ''} essay={message.essay || ''} />;
                        case 'sideBySide':
                            return <SideBySideMessage key={index} leftContent={message.leftContent || ''} rightContent={message.rightContent || ''} />;
                        case 'grade':
                            return <GradeMessage key={index} bandScores={message.bandScores || []} />;
                        default:
                            return null;
                    }
                })}
                {isLoading && <LoadingMessage />}
                <div ref={messagesEndRef} />
            </div>
        </>
    );
};

export default Conversation;