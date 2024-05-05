import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, DocumentData } from 'firebase/firestore/lite';
import TrashcanIcon from '../icons/TrashcanIcon';
import DashedCircleIcon from '../icons/DashedCircleIcon';
import ConversationIcon from '../icons/ConversationIcon';
import styles from './ConversationHistory.module.css';

const ConversationHistory: React.FC = () => {
    const [user, loading] = useAuthState(auth);
    const [conversations, setConversations] = useState<DocumentData[]>([]);

    useEffect(() => {
        if (user) {
            const fetchConversations = async () => {
                const conversationsRef = collection(db, `chats/${user.uid}/conversations`);
                const conversationsSnapshot = await getDocs(conversationsRef);
                setConversations(conversationsSnapshot.docs.map(doc => doc.data()));
            };
            fetchConversations();
        }
    }, [user]);

    if (loading) {
        return <div className={styles.centerContainer}>
            <DashedCircleIcon className={styles.loadingSpinner} />
        </div>
    }

    if (!user) {
        return <div className={styles.tipContainer}>
            <ConversationIcon className={styles.conversationIcon} />
            <p className={styles.tip}>
                {`Sign in to save\nyour conversations!`}
            </p>
        </div>
    }

    return (
        <ul className={styles.conversationHistory}>
            {conversations.map((conversation, i) => {
                let skillCode = conversation.skill.charAt(0) + conversation.skill.slice(-1);
                return (
                    <li key={i} className={styles.conversation}>
                        <div className={styles.skillCodeContainer}>
                            <span className={styles.skillCode}>{skillCode}</span>
                        </div>
                        <span className={styles.conversationName}>{conversation.name}</span>
                        <TrashcanIcon className={styles.trashcanIcon} />
                    </li>
                )
            })}
        </ul>
    );
};

export default ConversationHistory;