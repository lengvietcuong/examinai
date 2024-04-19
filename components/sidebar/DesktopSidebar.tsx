'use client';

import React from 'react';
import ConversationHistory from './ConversationHistory';
import useSidebarStore from '@/stores/sidebarStore';
import styles from './DesktopSidebar.module.css';

const DesktopSidebar = () => {
    const { isOpenDesktop } = useSidebarStore();

    return (
        <div className={`${styles.sidebarContainer} ${isOpenDesktop ? '' : styles.closed}`}>
            <ConversationHistory />
        </div>
    );
};

export default DesktopSidebar;