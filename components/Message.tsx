import React from 'react';
import styles from './Message.module.css';
import ExaminaiIcon from './icons/ExaminaiIcon';
import ProfileIcon from './icons/ProfileIcon';

export interface MessageProps {
    role: 'user' | 'assistant';
    content: string;
}

const Message: React.FC<MessageProps> = ({ role, content }) => {
    const formattedContent = content.split('\n').map((item, key) => {
        return <React.Fragment key={key}>{item}<br /></React.Fragment>
    });

    const renderSenderAvatar = () => {
        if (role === 'assistant') {
            return <ExaminaiIcon className={styles.svgAvatar} />;
        }
        if (userAvatar) {
            return userAvatar;
        }
        return <ProfileIcon className={styles.svgAvatar} />;
    };

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
