'use client';

import React, { useState, useEffect, useRef } from 'react';
import QuestionIcon from './icons/QuestionIcon';
import EssayIcon from './icons/EssayIcon';
import SendIcon from './icons/SendIcon';
import { useSkillStore } from '@/stores/skillStore';
import { useUserMessageStore } from '@/stores/userMessageStore';
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

        const cleanedQuestion = question.trim().replace(/’/g, "'");
        const cleanedEssay = essay.trim().replace(/’/g, "'");
        setUserMessage(`${cleanedQuestion}~~~${cleanedEssay}`);
        setIsVisible(false);
    };

    return isVisible && (selectedSkill === 'Writing Task 1' || selectedSkill === 'Writing Task 2') && (
        <form onSubmit={handleSubmit} className={styles.essayForm}>
            <div>
                <label className={styles.label} htmlFor="question">
                    <QuestionIcon className={`${styles.icon} ${styles.fill}`} />
                    Question
                </label>
                <textarea
                    ref={questionRef}
                    className={styles.textarea}
                    id="question"
                    value={question}
                    onChange={handleQuestionChange}
                    placeholder="Enter the question..."
                />
            </div>
            <div>
                <label className={styles.label} htmlFor="essay">
                    <EssayIcon className={`${styles.icon} ${styles.fill}`} />
                    Essay
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
            <button type="submit" className={styles.submitButton}>
                <SendIcon className={`${styles.icon} ${styles.stroke}`} />
                Submit
            </button>
        </form>
    );
};

export default EssayForm;