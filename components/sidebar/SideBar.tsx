import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

const SideBar = () => {
    return (
        <>
            <DesktopSidebar />
            <MobileSidebar />
        </>
    );
}

export default SideBar;