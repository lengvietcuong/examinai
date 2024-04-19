import React from 'react';
import { Comfortaa } from 'next/font/google';
import HeaderButtons from './HeaderButtons';
import styles from './Header.module.css';

const comfortaa = Comfortaa({subsets: ['latin'], weight: ['700']});

const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <h1 className={`${styles.heading} ${comfortaa.className}`}>Examin<span className={styles.accentText}>ai</span></h1>
            <HeaderButtons />
        </header>
    );
};

export default Header;
