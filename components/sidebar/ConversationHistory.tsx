import React from 'react';
import TrashcanIcon from '../icons/TrashcanIcon';
import styles from './ConversationHistory.module.css';

const ConversationHistory: React.FC = () => {
    return (
        <ul className={styles.conversationHistory}>
            <li className={styles.conversation}>
                <span className={styles.conversationName}>Conversation 1</span>
                <TrashcanIcon className={styles.trashcanIcon} />
            </li>
            <li className={styles.conversation}>
                <span className={styles.conversationName}>Conversation 2</span>
                <TrashcanIcon className={styles.trashcanIcon} />
            </li>
            <li className={styles.conversation}>
                <span className={styles.conversationName}>Conversation 3</span>
                <TrashcanIcon className={styles.trashcanIcon} />
            </li>
            <li className={styles.conversation}>
                <span className={styles.conversationName}>Conversation 4</span>
                <TrashcanIcon className={styles.trashcanIcon} />
            </li>
            <li className={styles.conversation}>
                <span className={styles.conversationName}>Very very very long conversation</span>
                <TrashcanIcon className={styles.trashcanIcon} />
            </li>
        </ul>
    );
};

export default ConversationHistory;
