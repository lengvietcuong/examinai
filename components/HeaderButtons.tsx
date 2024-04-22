'use client';

import React from 'react';
import PlusIcon from './icons/PlusIcon';
import ProfileIcon from './icons/ProfileIcon';
import HamburgerMenuIcon from './icons/HamburgerMenuIcon';
import useSidebarStore from '@/stores/sidebarStore';
import { montserrat } from '@/fonts/fonts';
import styles from './HeaderButtons.module.css';

const HeaderButtons: React.FC = () => {
    const { setIsOpenMobile } = useSidebarStore();
    return (
        <>
            <button className={`${styles.hamburgerMenuButton} ${styles.buttonContainer}`} onClick={() => setIsOpenMobile(true)}>
                <HamburgerMenuIcon className={styles.buttonIcon} />
            </button>
            <button className={`${styles.newChatButton} ${styles.buttonContainer}`}>
                <PlusIcon className={styles.buttonIcon} />
                <span className={`${styles.buttonText} ${montserrat.className}`}>New chat</span>
            </button>
            <button className={`${styles.signInButton} ${styles.buttonContainer}`}>
                <ProfileIcon className={styles.buttonIcon} />
                <span className={`${styles.buttonText} ${montserrat.className}`}>Sign in</span>
            </button>
        </>
    );
};

export default HeaderButtons;
