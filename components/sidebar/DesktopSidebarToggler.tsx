'use client';

import React from 'react';
import useSidebarStore from '@/stores/sidebarStore';
import styles from './DesktopSidebarToggler.module.css';

const DesktopSideBarToggler: React.FC = () => {
    const { isOpenDesktop, setIsOpenDesktop } = useSidebarStore();

    return (
        <button className={styles.toggler} onClick={() => setIsOpenDesktop(!isOpenDesktop)}>
            {isOpenDesktop ? '<' : '>'}
        </button>
    );
};

export default DesktopSideBarToggler;
