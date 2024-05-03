import React from 'react';
import { comfortaa } from '@/fonts/fonts';
import HeaderButtons from './HeaderButtons';
import styles from './Header.module.css';


const Header: React.FC = () => {
    return (
        <div className={styles.header}>
            <h1 className={`${styles.heading} ${comfortaa.className}`}>Examin<span className={styles.accentText}>ai</span></h1>
            <HeaderButtons />
        </div>
    );
};

export default Header;
