import React from 'react';
import Message from './Message';
import styles from './TextMessage.module.css';

export interface TextMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

const renderNewLines = (content: string) => {
    return content.split('\n').map((item, key) => {
        return <React.Fragment key={key}>{item}<br /></React.Fragment>
    });
};

const formatContent = (content: string) => {
    const parts = content.split('~~~');
    if (parts.length > 1) {
        return (
            <>
                <strong><em>{parts[0]}</em></strong>
                <br />
                <br />
                {renderNewLines(parts[1])}
            </>
        );
    }
    return renderNewLines(parts[0]);
};

const TextMessage: React.FC<TextMessageProps> = ({ role, content }) => {
    return (
        <Message role={role}>
            <p className={styles.content}>{formatContent(content)}</p>
        </Message>
    );
};

export default TextMessage;
