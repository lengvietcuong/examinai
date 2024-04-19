'use client';

import React from 'react';
import TogglerIcon from '../icons/TogglerIcon';
import useSidebarStore from '@/stores/sidebarStore';
import styles from './DesktopSidebarToggler.module.css';

const DesktopSideBarToggler: React.FC = () => {
    const { isOpenDesktop, setIsOpenDesktop } = useSidebarStore();

    return (
        <button className={styles.toggler} onClick={() => setIsOpenDesktop(!isOpenDesktop)}>
            <TogglerIcon className={`${styles.togglerIcon} ${!isOpenDesktop ? '' : styles.flipped}`}/>
        </button>
    );
};

export default DesktopSideBarToggler;
