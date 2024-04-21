import React from 'react';
import Message from './Message';
import styles from './SideBySideMessage.module.css';

export interface SideBySideMessageProps {
    role: 'user' | 'assistant';
    leftContent: string;
    rightContent: string;
}

const SideBySideMessage: React.FC<SideBySideMessageProps> = ({ role, leftContent, rightContent }) => {
    const applyStyles = (text: string) => {
        const regex = /(\*[^*]+\*)|(\#[^#]+\#)|([^\*#]+)/g;
        let match;
        let result = [];

        while ((match = regex.exec(text)) !== null) {
            let segment = match[0];
            if (segment.startsWith('#') && segment.endsWith('#')) {
                const displayText = segment.slice(1, -1);
                result.push(<span key={match.index} className={styles.mistake}>{displayText}</span>);
            } else if (segment.startsWith('*') && segment.endsWith('*')) {
                const cleanedSegment = segment.slice(1, -1);
                result.push(<span key={match.index} className={styles.correction}>{cleanedSegment}</span>);
            } else {
                result.push(segment);
            }
        }

        return result;
    };

    function formatContent(content: string) {
        return content.split('\n').map((item, key) => {
            return <React.Fragment key={key}>{applyStyles(item)}<br /></React.Fragment>
        });
    }

    return (
        <Message role={role}>
            <div className={styles.sideBySideContainer}>
                <p className={styles.content}>{formatContent(leftContent)}</p>
                <hr className={styles.separator}/>
                <p className={styles.content}>{formatContent(rightContent)}</p>
            </div>
        </Message>
    );};

export default SideBySideMessage;
