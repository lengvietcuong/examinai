import React from 'react';
import PlusIcon from './icons/PlusIcon';
import ProfileIcon from './icons/ProfileIcon';
import styles from './Header.module.css';

const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <button className={`${styles.newChatButton} ${styles.pillButton}`}>
                <PlusIcon className={styles.buttonIcon} />
                <span className={styles.buttonText}>New chat</span>
            </button>
            <button className={`${styles.signInButton} ${styles.pillButton}`}>
                <ProfileIcon className={styles.buttonIcon} />
                <span className={styles.buttonText}>Sign in</span>
            </button>
            <h1 className={styles.heading}>Examin<span className={styles.accentText}>ai</span></h1>
        </header>
    );
};

export default Header;
