'use client';

import React, { useState, useEffect, useRef } from 'react';
import SendIcon from './icons/SendIcon';
import { useUserMessageStore } from '@/stores/userMessageStore';
import { useSkillStore } from '@/stores/skillStore';
import { useLoadingStore } from '@/stores/loadingStore';
import sanitize from '@/utils/sanitize';
import styles from './TextInput.module.css';

const TextInput: React.FC = () => {
    const setUserMessage = useUserMessageStore((state) => state.setUserMessage);
    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const isLoading = useLoadingStore((state) => state.isLoading);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [input, setInput] = useState<string>('');

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [selectedSkill]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !input.trim()) return;

        setUserMessage({type: 'text', content: sanitize(input)});
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

    return selectedSkill && selectedSkill.startsWith('Speaking') && (
        <div className={styles.textInputContainer}>
            <form className={styles.textInputForm} onSubmit={handleSubmit}>
                <textarea
                    ref={textareaRef}
                    id="textInput"
                    className={`${styles.textarea}`}
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