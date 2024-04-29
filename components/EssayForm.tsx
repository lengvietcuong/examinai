'use client';

import React, { useState, useEffect, useRef } from 'react';
import QuestionIcon from './icons/QuestionIcon';
import EssayIcon from './icons/EssayIcon';
import SendIcon from './icons/SendIcon';
import { useUserMessageStore } from '@/stores/userMessageStore';
import { useSkillStore } from '@/stores/skillStore';
import sanitize from '@/utils/sanitize';
import { montserrat } from '@/fonts/fonts';
import styles from './EssayForm.module.css';

const EssayForm: React.FC = () => {
    const setUserMessage = useUserMessageStore((state) => state.setUserMessage);
    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const [question, setQuestion] = useState('');
    const [essay, setEssay] = useState('');
    const [wordCount, setWordCount] = useState(0);
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
        setWordCount(event.target.value.split(/\s+/).filter((word) => word).length); // Update word count
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const sanitizedQuestion = sanitize(question);
        const sanitizedEssay = sanitize(essay);
        if (!sanitizedQuestion || !sanitizedEssay) return;

        // Check word count based on selected skill
        const minWordCount = selectedSkill === 'Writing Task 1' ? 150 : selectedSkill === 'Writing Task 2' ? 250 : 0;
        if (wordCount < minWordCount) {
            const taskNumber = selectedSkill?.charAt(selectedSkill.length - 1);
            alert(`Your essay is too short. You must write at least ${minWordCount} words for Task ${taskNumber}.`);
            return;
        }

        // Check if word count exceeds maximum limit
        const maxWordCount = 500;
        if (wordCount > maxWordCount) {
            alert('Your essay is too long. Please write at most 500 words.');
            return;
        }

        setUserMessage({ type: 'essaySubmission', essayQuestion: sanitizedQuestion, essay: sanitizedEssay});
    };

    return (
        <form onSubmit={handleSubmit} className={styles.essayForm}>
            <div>
                <label className={styles.label} htmlFor="question">
                    <QuestionIcon className={`${styles.icon} ${styles.fill}`} />
                    Essay question
                </label>
                <textarea
                    ref={questionRef}
                    className={`${styles.textarea} ${styles.question}`}
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
                    className={`${styles.textarea} ${styles.essay}`}
                    id="essay"
                    value={essay}
                    onChange={handleEssayChange}
                    placeholder="Enter your essay..."
                />
                {wordCount > 0 && <p className={styles.wordCount}>Word count: {wordCount}</p>}
            </div>
            <button type="submit" className={`${styles.submitButton} ${montserrat.className}`}>
                <SendIcon className={`${styles.icon} ${styles.stroke}`} />
                Submit
            </button>
        </form>
    );
};

export default EssayForm;