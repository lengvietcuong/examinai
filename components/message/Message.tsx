import React, { ReactNode } from 'react';
import styles from './Message.module.css';
import ExaminaiIcon from '../icons/ExaminaiIcon';
import ProfileIcon from '../icons/ProfileIcon';

export interface MessageProps {
    role: 'user' | 'assistant';
    children?: ReactNode;
}

const Message: React.FC<MessageProps> = ({ role, children }) => {
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
            <div className={styles.messageInfo}>
                <span className={styles.sender}>{displayName}</span>
                {children}
            </div>
        </div>
    );
};

export default Message;