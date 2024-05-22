'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient, LiveClient, LiveTranscriptionEvent, LiveTranscriptionEvents } from '@deepgram/sdk';
import { getDeepgramTemporaryKey } from '@/lib/deepgram';
import MicrophoneIcon from '../icons/MicrophoneIcon';
import SendIcon from '../icons/SendIcon';
import useUserMessageStore from '@/stores/userMessageStore';
import useSkillStore from '@/stores/skillStore';
import useExaminerProcessingStore from '@/stores/examinerProcessingStore';
import useConversationStore from '@/stores/conversationStore';
import sanitize from '@/utils/sanitize';
import { getTextWidth } from 'get-text-width';
import styles from './TextInput.module.css';

const TextInput = () => {
    const [userMessage, setUserMessage] = useUserMessageStore((state) => [state.userMessage, state.setUserMessage]);
    const selectedSkill = useSkillStore((state) => state.selectedSkill);
    const [conversationId, isNewconversation] = useConversationStore((state) => [state.conversationId, state.isNewConversation]);
    const isExaminerProcessing = useExaminerProcessingStore((state) => state.isExaminerProcessing);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [initialWidth, setInitialWidth] = useState<number>(0);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const connectionRef = useRef<LiveClient | null>(null);
    const microphoneRef = useRef<MediaRecorder | null>(null);
    const fixedInput = useRef('');
    const keepAliveInterval = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        // Get initial width of textarea (without padding)
        if (textareaRef.current) {
            const style = window.getComputedStyle(textareaRef.current);
            const leftPadding = parseInt(style.paddingLeft, 10);
            const rightPadding = parseInt(style.paddingRight, 10);
            const widthWithoutPadding = textareaRef.current.clientWidth - leftPadding - rightPadding;
            setInitialWidth(widthWithoutPadding);
        }
    }, [textareaRef.current]);

    useEffect(() => {
        // Reset textarea content when 'New chat' is clicked or a past conversation is selected
        if (!userMessage || (conversationId && !isNewconversation)) {
            setInput('');
        }
    }, [userMessage, conversationId, isNewconversation]);

    useEffect(() => {
        if (!textareaRef.current) return;
        
        // Dynamically adjust textarea height based on content
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

        // Scroll to the bottom
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }, [input]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        fixedInput.current = e.target.value;

        const currentWidth = getTextWidth(e.target.value);
        setIsExpanded(currentWidth > initialWidth);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isExaminerProcessing || !input.trim()) return;
        
        setUserMessage({ type: 'text', content: sanitize(input) });
        setInput('');
        setIsExpanded(false);
        fixedInput.current = '';
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const initializeConnection = async () => {
        const key = await getDeepgramTemporaryKey();
        const deepgram = createClient(key);
        const conn = deepgram.listen.live({
            model: 'nova-2',
            interim_results: true,
            smart_format: true,
            filler_words: true,
            utterance_end_ms: 3000,
        });
        conn.addListener(LiveTranscriptionEvents.Transcript, (data: LiveTranscriptionEvent) => {
            const transcript = data.channel.alternatives[0].transcript;
            const newText = (fixedInput.current + ' ' + transcript).trim();
            setInput(newText);
            if (data.is_final) {
                fixedInput.current += ' ' + transcript;
            }

            const currentWidth = getTextWidth(newText);
            setIsExpanded(currentWidth > initialWidth);
        });
        connectionRef.current = conn;

        keepAliveInterval.current = setInterval(() => {
            connectionRef.current?.keepAlive();
        }, 10_000);
    }

    const initializeMicrophone = async () => {
        const userMedia = await navigator.mediaDevices.getUserMedia({
            audio: {
                noiseSuppression: true,
                echoCancellation: true,
            },
        });
        const mic = new MediaRecorder(userMedia);
        mic.addEventListener('dataavailable', (e: BlobEvent) => {
            if (microphoneRef.current?.state !== 'recording') return;
            if (!e.data.size) {
                window.alert('Please allow microphone access to use voice input.');
                stopListening();
                return;
            }
            connectionRef.current?.send(e.data);
        });
        microphoneRef.current = mic;
    }

    const startListening = async () => {
        setIsConnecting(true);
        try {
            if (!connectionRef.current) {
                await initializeConnection();
            }
            if (!microphoneRef.current) {
                await initializeMicrophone();
            }

            microphoneRef.current?.start(250); // Send data every 250ms
            textareaRef.current?.focus();
            setIsListening(true);
        } catch (error) {
            if (error instanceof Error && error.name === 'NotAllowedError') {
                window.alert('Please allow microphone access to use voice input.');
            }
            setIsListening(false);
        } finally {
            clearInterval(keepAliveInterval.current); // No need to keep alive if listening or failed to connect
            setIsConnecting(false);
        }
    };

    const stopListening = () => {
        microphoneRef.current?.stop();
        connectionRef.current?.keepAlive();
        keepAliveInterval.current = setInterval(() => {
            connectionRef.current?.keepAlive();
        }, 10_000);
        setIsListening(false);
    }

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return selectedSkill && selectedSkill.startsWith('Speaking') && (
        <div className={styles.textInputContainer}>
            <form className={`${styles.textInputForm} ${isExpanded ? styles.expanded : ''}`} onSubmit={handleSubmit}>
                {(isConnecting || isListening) && (
                    <div className={styles.statusMessage}>
                        {isConnecting ? "Connecting..." : "Listening..."}
                    </div>
                )}
                <textarea
                    ref={textareaRef}
                    id="textInput"
                    className={styles.textarea}
                    placeholder='Message Examinai...'
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    value={input}
                >
                </textarea>
                <div className={styles.buttonContainer}>
                    <button
                        className={`${styles.microphoneButton} ${isListening ? styles.listening : ''}`}
                        type="button"
                        onClick={toggleListening}
                    >
                        <MicrophoneIcon className={styles.microphoneIcon} />
                        {isConnecting &&
                            <div className={styles.loadingWrapper}>
                                <div className={styles.loadingSpinner} />
                            </div>
                        }
                    </button>
                    <button className={styles.sendButton} type="submit">
                        <SendIcon className={styles.sendIcon} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TextInput;