import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, query, DocumentData, doc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import useConversationStore from '@/stores/conversationStore';
import useSkillStore from '@/stores/skillStore';
import useUserMessageStore from '@/stores/userMessageStore';
import TrashcanIcon from '../icons/TrashcanIcon';
import DashedCircleIcon from '../icons/DashedCircleIcon';
import ConversationIcon from '../icons/ConversationIcon';
import styles from './ConversationHistory.module.css';

const ConversationHistory: React.FC = () => {
    const { setMessages, conversationId, setConversationId, setIsNewConversation } = useConversationStore((state) => ({ setMessages: state.setMessages, conversationId: state.conversationId, setConversationId: state.setConversationId, setIsNewConversation: state.setIsNewConversation }));
    const setSelectedSkill = useSkillStore((state) => state.setSelectedSkill);
    const setUserMessage = useUserMessageStore((state) => state.setUserMessage);
    const [user, loading] = useAuthState(auth);
    const [conversations, setConversations] = useState<DocumentData[]>([]);
    const [docLimit, setDocLimit] = useState(30);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (!user) return;
        let conversationsRef = collection(db, `chats/${user.uid}/conversations`);
        let q = query(conversationsRef, orderBy('lastModified', 'desc'), limit(docLimit));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newConversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setConversations(newConversations);
            setHasMore(snapshot.docs.length === docLimit);
        });

        return () => unsubscribe();
    }, [user, docLimit]);

    const lastConversationElementRef = useCallback((node: HTMLLIElement | null) => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setDocLimit(prev => prev + 30);
            }
        });
        if (node) observer.current.observe(node);
    }, [hasMore]);

    const deleteConversation = async (id: string) => {
        if (!user) return;

        if (id === conversationId) {
            setIsNewConversation(true);
            setConversationId(null);
            setSelectedSkill(null);
            setMessages(() => []);
            setUserMessage(null);
        }
        setConversations(conversations.filter(conversation => conversation.id !== id));

        const conversationRef = doc(db, `chats/${user.uid}/conversations`, id);
        await deleteDoc(conversationRef);
    };

    const handleSelectConversation = async (id: string) => {
        const conversation = conversations.find(conversation => conversation.id === id);
        if (!conversation) return;
        setIsNewConversation(false);
        setConversationId(id);
        setSelectedSkill(conversation.skill);
        setMessages(() => conversation.messages);
        setUserMessage(null);
    };

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
                let isHighlighted = conversationId === conversation.id;
                return (
                    <li
                        key={i}
                        ref={i === conversations.length - 1 ? lastConversationElementRef : null}
                        className={`${styles.conversation} ${isHighlighted ? styles.highlighted : ''}`}
                        onClick={() => handleSelectConversation(conversation.id)}
                    >
                        <div className={styles.skillCodeContainer}>
                            <span className={styles.skillCode}>{skillCode}</span>
                        </div>
                        <span className={styles.conversationName}>{conversation.name}</span>
                        <TrashcanIcon className={styles.trashcanIcon} onClick={(e) => { e.stopPropagation(); deleteConversation(conversation.id); }} />
                    </li>
                )
            })}
        </ul>
    );
};

export default ConversationHistory;