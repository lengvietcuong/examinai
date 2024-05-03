'use client';

import React, { useState, useEffect, useRef } from 'react';
import Message from './message/Message';
import MessageType from '@/types/message';
import StylizedText from './message/StylizedText';
import LoadingMessage from './message/LoadingMessage';
import EssaySubmissionInstruction from './message/EssaySubmissionInstruction';
import SideBySideCorrection from "@/components/message/SideBySideCorrection";
import BandScores from "@/components/message/BandScores";
import CheckListIcon from './icons/CheckListIcon';
import ToolsIcon from './icons/ToolsIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import SparklesIcon from './icons/SparklesIcon';
import getInitialSpeakingPrompt from '@/utils/getInitialSpeakingPrompt';
import timeout from '@/utils/timeout';
import { useUserMessageStore } from '@/stores/userMessageStore';
import { useSkillStore } from '@/stores/skillStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { handleSpeaking, handleWriting } from '@/lib/groq';
import { montserrat } from '@/fonts/fonts';
import styles from './Conversation.module.css';

const Conversation: React.FC = () => {
    const renderMessage = (message: MessageType, index: number) => {
        switch (message.type) {
            case 'text':
                return <Message key={index} role={message.role}>
                    <StylizedText text={message.content || ''}/>
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
                return <Message key={index} role='assistant'>
                    <div ref={messagesEndRef} className={styles.messagesEndRef} />
                    <div className={styles.headingContainer}>
                        <CheckListIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.fill}`} />
                        <h2 className={styles.assessmentHeading}>Band Scores</h2>
                    </div>
                    <BandScores bandScores={message.bandScores || ''} />
                </Message>
            case 'sideBySideCorrection':
                return <Message key={index} role='assistant'>
                    <div className={styles.headingContainer}>
                        <ToolsIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.fill}`} />
                        <h2 className={styles.assessmentHeading}>Corrections</h2>
                    </div>
                    <SideBySideCorrection key={index} leftContent={message.leftContent || ''} rightContent={message.rightContent || ''} />
                </Message>
            case 'ideaSuggestions':
                return <Message key={index} role='assistant'>
                    <div className={styles.headingContainer}>
                        <LightBulbIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.fill}`} />
                        <h2 className={styles.assessmentHeading}>Idea Suggestions</h2>
                    </div>
                    <StylizedText text={message.content || ''}/>
                </Message>
            case 'improvedVersion':
                return <Message key={index} role='assistant'>
                    <div className={styles.headingContainer}>
                        <SparklesIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.stroke}`} />
                        <h2 className={styles.assessmentHeading}>Improved Version</h2>
                    </div>
                    <StylizedText text={message.content || ''}/>
                </Message>
            case 'error':
                return <Message key={index} role='assistant'>
                    <p className={styles.errorMessage}>{message.content}</p>
                </Message>
            default:
                return null;
        }
    }

    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const [skillNumber, setSkillNumber] = useState<number>(0);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const { userMessage, setUserMessage } = useUserMessageStore((state) => ({ userMessage: state.userMessage, setUserMessage: state.setUserMessage }));
    const { isLoading, setIsLoading } = useLoadingStore((state) => ({ isLoading: state.isLoading, setIsLoading: state.setIsLoading }));
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const MAX_WAIT_TIME_MS = 20000;

    async function generateResponse() {
        if (!userMessage || !selectedSkill) return;

        let updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        setIsLoading(true);
        let responseMessages: MessageType[] = [];
        try {
            if (selectedSkill.startsWith('Speaking')) {
                const textMessages = updatedMessages
                    .filter(message => message.type === 'text' || message.type === 'displayHidden')
                    .map(({ role, content }) => ({ role, content: content || '' }));
                responseMessages = await Promise.race([handleSpeaking(textMessages), timeout(MAX_WAIT_TIME_MS)]);
            } else {
                responseMessages = await Promise.race([handleWriting(skillNumber as 1 | 2, userMessage.essayQuestion || '', userMessage.essay || ''), timeout(MAX_WAIT_TIME_MS)]);
            }
        } catch (error) {
            responseMessages = [{
                role: 'assistant',
                type: 'error',
                content: "I'm sorry, but the server seems to be busy right now. Please try again later."
            }];
        } finally {
            setMessages(prevMessages => [...prevMessages, ...responseMessages]);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        generateResponse();
    }, [userMessage]);

    useEffect(() => {
        if (!selectedSkill) return;

        const number = parseInt(selectedSkill[selectedSkill.length - 1]);
        setSkillNumber(number);
        if (selectedSkill?.startsWith('Speaking')) {
            setUserMessage(getInitialSpeakingPrompt(number as 1 | 2 | 3));
        }
    }, [selectedSkill]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            {messages.length === 0 && (selectedSkill?.startsWith("Writing")) &&
                <EssaySubmissionInstruction taskType={selectedSkill} />
            }
            <div className={styles.conversation}>
                {messages.map((message, index) => renderMessage(message, index))}
                {isLoading && <LoadingMessage />}
            </div>
            <div ref={messagesEndRef} />
        </>
    );
};

export default Conversation;