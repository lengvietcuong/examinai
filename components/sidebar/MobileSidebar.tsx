'use client';

import React from 'react';
import ConversationHistory from './ConversationHistory';
import CloseIcon from '../icons/CloseIcon';
import useSidebarStore from '@/stores/sidebarStore';
import styles from './MobileSidebar.module.css';

const MobileSidebar = () => {
    const { isOpenMobile, setIsOpenMobile } = useSidebarStore((state) => ({ isOpenMobile: state.isOpenMobile, setIsOpenMobile: state.setIsOpenMobile }));

    return (
        <>
            <div className={`${styles.sidebarContainer} ${isOpenMobile ? '' : styles.closed}`}>
                <button className={styles.closeButton} onClick={() => setIsOpenMobile(false)}>
                    <CloseIcon className={styles.closeIcon} />
                </button>
                <ConversationHistory />
            </div>
            <div className={styles.overlay} onClick={() => setIsOpenMobile(false)}></div>
        </>
    );
};

export default MobileSidebar;