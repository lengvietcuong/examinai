'use client';

import React, { useState } from 'react';
import TrashcanIcon from './icons/TrashcanIcon';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.sidebarContainer}>
            <ul className={`${styles.sidebarContent} ${isOpen ? '' : styles.closed}`}>
                <li className={styles.conversation}>
                    <span className={styles.conversationName}>Conversation 1</span>
                    <TrashcanIcon className={styles.trashcanIcon}/>
                </li>
                <li className={styles.conversation}>
                    <span className={styles.conversationName}>Conversation 2</span>
                    <TrashcanIcon className={styles.trashcanIcon}/>
                </li>
                <li className={styles.conversation}>
                    <span className={styles.conversationName}>Conversation 3</span>
                    <TrashcanIcon className={styles.trashcanIcon}/>
                </li>
                <li className={styles.conversation}>
                    <span className={styles.conversationName}>Conversation 4</span>
                    <TrashcanIcon className={styles.trashcanIcon}/>
                </li>
                <li className={styles.conversation}>
                    <span className={styles.conversationName}>Very very very long conversation</span>
                    <TrashcanIcon className={styles.trashcanIcon}/>
                </li>
            </ul>
            <button className={styles.toggler} onClick={toggleSidebar}>
                {isOpen ? '<' : '>'}
            </button>
        </div>
    );
};

export default Sidebar;