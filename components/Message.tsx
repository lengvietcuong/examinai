import React from 'react';
import styles from './Message.module.css';
import ExaminaiIcon from './icons/ExaminaiIcon';
import ProfileIcon from './icons/ProfileIcon';

export interface MessageProps {
    sender: string;
    content: string;
}

const Message: React.FC<MessageProps> = ({ sender, content }) => {
    const formattedContent = content.split('\n').map((item, key) => {
        return <React.Fragment key={key}>{item}<br /></React.Fragment>
    });

    const renderSenderAvatar = () => {
        if (sender === 'Examinai') {
            return <ExaminaiIcon className={styles.svgAvatar} />;
        }
        if (userAvatar) {
            return userAvatar;
        }
        return <ProfileIcon className={styles.svgAvatar} />;
    };

    const userAvatar = null;

    return (
        <div className={`${styles.message} ${sender !== 'Examinai' ? styles.alignRight : ''}`}>
            <div className={styles.avatarContainer}>
                {renderSenderAvatar()}
            </div>
            <div className={styles.messageString}>
                <span className={styles.sender}>{sender}</span>
                <p className={styles.content}>{formattedContent}</p>
            </div>
        </div>
    );
};

export default Message;
