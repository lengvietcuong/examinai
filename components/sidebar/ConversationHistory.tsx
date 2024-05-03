import React from 'react';
import TrashcanIcon from '../icons/TrashcanIcon';
import styles from './ConversationHistory.module.css';

const ConversationHistory: React.FC = () => {
    return (
        <ul className={styles.conversationHistory}>
            {Array.from({ length: 100 }, (_, i) => (
                <li key={i} className={styles.conversation}>
                    <span className={styles.conversationName}>Conversation {i + 1}</span>
                    <TrashcanIcon className={styles.trashcanIcon} />
                </li>
            ))}
        </ul>
    );
};

export default ConversationHistory;
