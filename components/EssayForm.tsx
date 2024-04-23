'use client';

import React, { useState, useEffect, useRef } from 'react';
import Message from './message/Message';
import QuestionIcon from './icons/QuestionIcon';
import EssayIcon from './icons/EssayIcon';
import SendIcon from './icons/SendIcon';
import { useSkillStore } from '@/stores/skillStore';
import { useUserMessageStore } from '@/stores/userMessageStore';
import sanitize from '@/utils/sanitize';
import { montserrat } from '@/fonts/fonts';
import styles from './EssayForm.module.css';

const EssayForm: React.FC = () => {
    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const setUserMessage = useUserMessageStore((state) => state.setUserMessage);
    const [question, setQuestion] = useState('');
    const [essay, setEssay] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const questionRef = useRef(null);
    const essayRef = useRef(null);

    const adjustTextareaHeight = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight(questionRef);
        adjustTextareaHeight(essayRef);
    }, [question, essay]);

    const handleQuestionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(event.target.value);
    };

    const handleEssayChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEssay(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!question.trim() || !essay.trim()) return;

        setUserMessage({ type: 'essaySubmission', essayQuestion: sanitize(question), essay: sanitize(essay) });
        setIsVisible(false);
    };

    return isVisible && (selectedSkill === 'Writing Task 1' || selectedSkill === 'Writing Task 2') && (
        <>
            <Message role="assistant">
                <p className={styles.instruction}>
                    Please submit the essay question and your essay. I will assess it and provide detailed feedback.
                    <br />
                    <br />
                    Don't have a question to write about? Visit <a href="https://study4.com/tests/?term=IELTS+Writing" target="_blank" rel="noopener noreferrer">Study4</a> to find one.
                </p>
            </Message>
            <form onSubmit={handleSubmit} className={styles.essayForm}>
                <div>
                    <label className={styles.label} htmlFor="question">
                        <QuestionIcon className={`${styles.icon} ${styles.fill}`} />
                        Essay question
                    </label>
                    <textarea
                        ref={questionRef}
                        className={styles.textarea}
                        id="question"
                        value={question}
                        onChange={handleQuestionChange}
                        placeholder="Enter the essay question..."
                    />
                </div>
                <div>
                    <label className={styles.label} htmlFor="essay">
                        <EssayIcon className={`${styles.icon} ${styles.fill}`} />
                        Your essay
                    </label>
                    <textarea
                        ref={essayRef}
                        className={styles.textarea}
                        id="essay"
                        value={essay}
                        onChange={handleEssayChange}
                        placeholder="Enter your essay..."
                    />
                </div>
                <button type="submit" className={`${styles.submitButton} ${montserrat.className}`}>
                    <SendIcon className={`${styles.icon} ${styles.stroke}`} />
                    Submit
                </button>
            </form>
        </>
    );
};

export default EssayForm;