'use client';

import React, { useState, useEffect, useRef } from 'react';
import Message from './message/Message';
import MessageType from '@/types/message';
import SideBySideCorrection from "@/components/message/SideBySideCorrection";
import EssayForm from './EssayForm';
import BandScores from "@/components/message/BandScores";
import CheckListIcon from './icons/CheckListIcon';
import ToolsIcon from './icons/ToolsIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import SparklesIcon from './icons/SparklesIcon';
import { useUserMessageStore } from '@/stores/userMessageStore';
import { useSkillStore } from '@/stores/skillStore';
import { handleSpeakingPart1, handleSpeakingPart2, handleSpeakingPart3, handleWritingTask1, handleWritingTask2 } from '@/lib/groq';
import { montserrat } from '@/fonts/fonts';
import styles from './Conversation.module.css';

const Conversation: React.FC = () => {
    const EssaySubmissionInstruction: React.FC = () => {
        return (
            <Message role="assistant">
                <p>
                    Please submit the essay question and your essay. I will assess it and provide detailed feedback.
                    <br />
                    <br />
                    Don't know where to find {selectedSkill} questions? Check out <a href="https://study4.com/tests/?term=IELTS+Writing" target="_blank" rel="noopener noreferrer">Study4</a>.
                </p>
            </Message>
        );
    }
    const LoadingMessage: React.FC = () => {
        return (
            <Message role="assistant">
                <p>
                    Just a second
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                </p>
            </Message>
        );
    }

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
                    <EssaySubmissionInstruction />
                    <EssayForm />
                </>
            }
            <div className={styles.conversation}>
                {messages.map((message, index) => {
                    switch (message.type) {
                        case 'text':
                            return <Message key={index} role={message.role}>
                                <p>{message.content}</p>
                            </Message>;
                        case 'essaySubmission':
                            return <Message key={index} role='user'>
                                <p>
                                    <strong><em>{message.essayQuestion}</em></strong>
                                    <br />
                                    <br />
                                    {message.essay}
                                </p>
                            </Message>
                        case 'bandScores':
                            return <>
                                <Message key={index} role='assistant'>
                                    <div className={styles.headingContainer}>
                                        <CheckListIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.fill}`} />
                                        <h2 className={styles.assessmentHeading}>Band Scores</h2>
                                    </div>
                                    <p>{message.content}</p>
                                </Message>
                            </>
                        case 'sideBySideCorrection':
                            return <>
                                <Message key={index} role='assistant'>
                                    <div className={styles.headingContainer}>
                                        <ToolsIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.fill}`} />
                                        <h2 className={styles.assessmentHeading}>Corrections</h2>
                                    </div>
                                    <SideBySideCorrection key={index} leftContent={message.leftContent || ''} rightContent={message.rightContent || ''} />
                                </Message>
                            </>
                        case 'ideaSuggestions':
                            return <>
                                <Message key={index} role='assistant'>
                                    <div className={styles.headingContainer}>
                                        <LightBulbIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.fill}`} />
                                        <h2 className={styles.assessmentHeading}>Idea Suggestions</h2>
                                    </div>
                                    <p>{message.content}</p>
                                </Message>
                            </>
                        case 'improvedVersion':
                            return <>
                                <Message key={index} role='assistant'>
                                    <div className={styles.headingContainer}>
                                        <SparklesIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.stroke}`} />
                                        <h2 className={styles.assessmentHeading}>Improved Version</h2>
                                    </div>
                                    <p>{message.content}</p>
                                </Message>
                            </>
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