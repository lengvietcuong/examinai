import React from 'react';
import HeaderButtons from './HeaderButtons';
import styles from './Header.module.css';

const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <h1 className={styles.heading}>Examin<span className={styles.accentText}>ai</span></h1>
            <HeaderButtons />
        </header>
    );
};

export default Header;
