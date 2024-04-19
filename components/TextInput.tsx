'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Inter } from "next/font/google";
import SendIcon from './icons/SendIcon';
import { useUserMessageStore } from '@/stores/userMessageStore';
import { useSkillStore } from '@/stores/skillStore';
import styles from './TextInput.module.css';

const inter = Inter({ subsets: ["latin"] });

const TextInput: React.FC = () => {
    const { userMessage, setUserMessage } = useUserMessageStore();
    const { selectedSkill } = useSkillStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [input, setInput] = useState<string>('');

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if a previous message is processing or if the input is empty
        if (userMessage || !input.trim()) return;

        setUserMessage(input.trim());
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return selectedSkill && (
        <div className={styles.textInputContainer}>
            <form className={styles.textInputForm} onSubmit={handleSubmit}>
                <textarea
                    ref={textareaRef}
                    id="textInput"
                    className={`${styles.textarea} ${inter.className}`}
                    placeholder='Message Examinai...'
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    value={input}
                >
                </textarea>
                <button className={styles.sendButton} type="submit">
                    <SendIcon className={styles.sendIcon} />
                </button>
            </form>
        </div>
    );
};

export default TextInput;