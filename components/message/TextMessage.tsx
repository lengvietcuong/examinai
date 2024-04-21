import React from 'react';
import Message from './Message';
import styles from './TextMessage.module.css';

export interface TextMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

const TextMessage: React.FC<TextMessageProps> = ({ role, content }) => {
    const formattedContent = content.split('\n').map((item, key) => {
        return <React.Fragment key={key}>{item}<br /></React.Fragment>
    });

    return (
        <Message role={role}>
            <p className={styles.content}>{formattedContent}</p>
        </Message>
    );
};

export default TextMessage;
