import React, { ReactNode } from 'react';
import ExaminaiIcon from '../icons/ExaminaiIcon';
import UserAvatar from './UserAvatar';
import styles from './Message.module.css';

export interface MessageProps {
    role: 'user' | 'assistant';
    children?: ReactNode;
}

const Message: React.FC<MessageProps> = ({ role, children }) => {
    const displayName = role === 'user' ? 'You' : 'Examinai';

    return (
        <div className={styles.message}>
            <div className={styles.avatarContainer}>
                {role === 'assistant' ? <ExaminaiIcon className={styles.svgAvatar} /> : <UserAvatar />}
            </div>
            <div className={styles.messageInfo}>
                <span className={styles.sender}>{displayName}</span>
                {children}
            </div>
        </div>
    );
};

export default Message;