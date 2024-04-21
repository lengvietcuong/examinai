import React from 'react';
import styles from './Message.module.css';
import ExaminaiIcon from './icons/ExaminaiIcon';
import ProfileIcon from './icons/ProfileIcon';

export interface MessageProps {
    role: 'user' | 'assistant';
    content: string;
}

const Message: React.FC<MessageProps> = ({ role, content }) => {
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

    const renderSenderAvatar = () => {
        if (role === 'assistant') {
            return <ExaminaiIcon className={styles.svgAvatar} />;
        }
        if (userAvatar) {
            return userAvatar;
        }
        return <ProfileIcon className={styles.svgAvatar} />;
    };

    const formattedContent = content.split('\n').map((item, key) => {
        return <React.Fragment key={key}>{applyStyles(item)}<br /></React.Fragment>
    });
    const userAvatar = null;
    const displayName = role === 'user' ? 'You' : 'Examinai';

    return (
        <div className={`${styles.message} ${role !== 'assistant' ? styles.alignRight : ''}`}>
            <div className={styles.avatarContainer}>
                {renderSenderAvatar()}
            </div>
            <div className={styles.messageString}>
                <span className={styles.sender}>{displayName}</span>
                <p className={styles.content}>{formattedContent}</p>
            </div>
        </div>
    );
};

export default Message;
