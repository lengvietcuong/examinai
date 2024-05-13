'use client';

import React, { useState, useEffect, useRef } from 'react';
import SendIcon from './icons/SendIcon';
import useUserMessageStore from '@/stores/userMessageStore';
import useSkillStore from '@/stores/skillStore';
import useExaminerProcessingStore from '@/stores/examinerProcessingStore';
import useConversationStore from '@/stores/conversationStore';
import sanitize from '@/utils/sanitize';
import styles from './TextInput.module.css';

const TextInput: React.FC = () => {
    const [userMessage, setUserMessage] = useUserMessageStore((state) => [state.userMessage, state.setUserMessage]);
    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const [conversationId, isNewconversation] = useConversationStore((state) => [state.conversationId, state.isNewConversation]);
    const isExaminerProcessing = useExaminerProcessingStore((state) => state.isExaminerProcessing);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [input, setInput] = useState<string>('');

    useEffect(() => {
        // Reset when 'New chat' is pressed or when switching between past conversations
        if (!userMessage || (conversationId && !isNewconversation)) {
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'inherit';
            }
        }
    }, [userMessage, conversationId, isNewconversation]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'inherit';
        if (e.target.scrollHeight > e.target.clientHeight) {
            e.target.style.height = `${e.target.scrollHeight}px`;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isExaminerProcessing || !input.trim()) return;

        setUserMessage({ type: 'text', content: sanitize(input) });
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