'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import Message from './message/Message';
import MessageType from '@/types/message';
import StylizedText from './message/StylizedText';
import LoadingMessage from './message/LoadingMessage';
import EssaySubmissionPopup from './essaySubmissionPopup/EssaySubmissionPopup';
import SideBySideCorrection from "@/components/message/SideBySideCorrection";
import BandScores from "@/components/message/BandScores";
import CheckListIcon from './icons/CheckListIcon';
import ToolsIcon from './icons/ToolsIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import SparklesIcon from './icons/SparklesIcon';
import getInitialSpeakingPrompt from '@/utils/getInitialSpeakingPrompt';
import timeout from '@/utils/timeout';
import useUserMessageStore from '@/stores/userMessageStore';
import useSkillStore from '@/stores/skillStore';
import useExaminerProcessingStore from '@/stores/examinerProcessingStore';
import useConversationStore from '@/stores/conversationStore';
import { handleSpeaking, handleWriting, getConversationName } from '@/lib/groq';
import { montserrat } from '@/fonts/fonts';
import styles from './Conversation.module.css';

const Conversation: React.FC = () => {
    const renderMessage = (message: MessageType, index: number) => {
        switch (message.type) {
            case 'text':
                return <Message key={index} role={message.role}>
                    <StylizedText text={message.content || ''} />
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
                    {isNewConversation && <div ref={messagesEndRef} className={styles.messagesEndRef} />}
                    <div className={styles.headingContainer}>
                        <CheckListIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.fill}`} />
                        <h2 className={styles.assessmentHeading}>Band Scores</h2>
                    </div>
                    <BandScores bandScores={message.bandScores || {}} />
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
                    <StylizedText text={message.content || ''} />
                </Message>
            case 'improvedVersion':
                return <Message key={index} role='assistant'>
                    <div className={styles.headingContainer}>
                        <SparklesIcon className={`${montserrat.className} ${styles.assessmentIcon} ${styles.stroke}`} />
                        <h2 className={styles.assessmentHeading}>Improved Version</h2>
                    </div>
                    <StylizedText text={message.content || ''} />
                </Message>
            case 'error':
                return <Message key={index} role='assistant'>
                    <p className={styles.errorMessage}>{message.content}</p>
                </Message>
            default:
                return null;
        }
    }

    const [user, loading] = useAuthState(auth);
    const [conversationName, setConversationName] = useState<string>('New chat');
    const { messages, setMessages, conversationId, setConversationId, isNewConversation } = useConversationStore((state) => ({ messages: state.messages, setMessages: state.setMessages, conversationId: state.conversationId, setConversationId: state.setConversationId, isNewConversation: state.isNewConversation }));
    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const [skillNumber, setSkillNumber] = useState<number>(0);
    const { userMessage, setUserMessage } = useUserMessageStore((state) => ({ userMessage: state.userMessage, setUserMessage: state.setUserMessage }));
    const [pendingMessages, setPendingMessages] = useState<MessageType[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isExaminerProcessing, setIsExaminerProcessing } = useExaminerProcessingStore((state) => ({ isExaminerProcessing: state.isExaminerProcessing, setIsExaminerProcessing: state.setIsExaminerProcessing }));
    const MAX_WAIT_TIME_MS = 20000;

    const addMessagesFirestore = async (messages: MessageType[]) => {
        if (loading) {
            setPendingMessages(prev => [...prev, ...messages]);
            return;
        }

        if (!user) return;

        if (!conversationId) {
            // Add new conversation
            const ref = await addDoc(collection(db, `chats/${user.uid}/conversations`), {
                skill: selectedSkill,
                name: conversationName,
                messages: messages,
                lastModified: serverTimestamp()
            });
            setConversationId(ref.id);
        } else {
            // Append messages to existing conversation
            await updateDoc(doc(db, `chats/${user.uid}/conversations/${conversationId}`), {
                messages: arrayUnion(...messages),
                lastModified: serverTimestamp()
            });
        }
    }

    const getExaminerResponses = async (messages: MessageType[]) => {
        if (selectedSkill?.startsWith('Speaking')) {
            const textMessages = messages.map(({ role, content }) => ({ role, content: content || '' }));
            return await Promise.race([handleSpeaking(textMessages), timeout(MAX_WAIT_TIME_MS)]);
        }
        if (userMessage?.essayQuestion && userMessage?.essay) {
            return await Promise.race([handleWriting(skillNumber as 1 | 2, userMessage.essayQuestion, userMessage.essay), timeout(MAX_WAIT_TIME_MS)]);
        }
        return [];
    }

    useEffect(() => {
        const onSkillSelection = async () => {
            // If the conversation ID exists, it means the user has selected a conversation from the sidebar
            if (!selectedSkill || conversationId) return;

            const number = parseInt(selectedSkill[selectedSkill.length - 1]);
            setSkillNumber(number);

            if (selectedSkill?.startsWith('Speaking')) {
                const initialPrompt = getInitialSpeakingPrompt(number as 1 | 2 | 3);
                setUserMessage(initialPrompt);
            }
        }

        onSkillSelection();
    }, [selectedSkill]);

    useEffect(() => {
        const onUserMessage = async () => {
            if (!userMessage) return;

            setMessages((prev: MessageType[]) => [...prev, userMessage]);
            setIsExaminerProcessing(true);
            let examinerResponses: MessageType[] = [];
            try {
                examinerResponses = await getExaminerResponses([...messages, userMessage]);
                addMessagesFirestore([userMessage, ...examinerResponses]);
            } catch (error) {
                examinerResponses = [{
                    role: 'assistant',
                    type: 'error',
                    content: "I'm sorry, but the server seems to be busy right now. Please try again later."
                }];
            } finally {
                setMessages((prev: MessageType[]) => [...prev, ...examinerResponses]);
                setIsExaminerProcessing(false);
            }
        }
        onUserMessage();
    }, [userMessage]);

    useEffect(() => {
        if (user && pendingMessages.length > 0) {
            addMessagesFirestore(pendingMessages);
            setPendingMessages([]);
        }
    }, [user, pendingMessages]);

    useEffect(() => {
        const updateConversationName = async () => {
            if (!(user && conversationId && conversationName === 'New chat')) return;

            const firstUserMessage = messages[0];
            let context;
            if (selectedSkill?.startsWith('Speaking') && firstUserMessage?.content) {
                // Get the first speaking question (in the second line of the user's message)
                context = firstUserMessage.content.split('\n')[1];
            } else if (firstUserMessage?.essayQuestion) {
                context = firstUserMessage.essayQuestion;
            } else {
                return;
            }
            const name = await getConversationName(context);
            setConversationName(name);
            await updateDoc(doc(db, `chats/${user.uid}/conversations/${conversationId}`), {
                name: name
            });
        }

        updateConversationName();
    }, [user, conversationId]);

    useEffect(() => {
        // Handle 'New chat' button click
        if (conversationId === null) {
            setConversationName('New chat');
        }
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        // Reset scrolling if the user selects a writing conversation from the sidebar
        if (selectedSkill?.startsWith('Writing') && !isNewConversation) {
            window.scrollTo(0, 0);
        }
    }, [conversationId]);

    return (
        <>
            {messages.length === 0 && (selectedSkill?.startsWith("Writing")) &&
                <EssaySubmissionPopup taskType={selectedSkill} />
            }
            <div className={styles.conversation}>
                {messages.map((message, index) => renderMessage(message, index))}
                {isExaminerProcessing && <LoadingMessage />}
            </div>
            {(isNewConversation || selectedSkill?.startsWith('Speaking')) && <div ref={messagesEndRef} />}
        </>
    );
};

export default Conversation;