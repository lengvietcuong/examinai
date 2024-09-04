import { create } from 'zustand';

type SidebarState = {
    isDesktopSidebarOpen: boolean;
    isMobileSidebarOpen: boolean;
    setIsDesktopSidebarOpen: (isOpen: boolean) => void;
    setIsMobileSidebarOpen: (isOpen: boolean) => void;
};

const useSidebarStore = create<SidebarState>((set) => ({
    isDesktopSidebarOpen: true,
    isMobileSidebarOpen: false,
    setIsDesktopSidebarOpen: (isDesktopSidebarOpen) => set({ isDesktopSidebarOpen }),
    setIsMobileSidebarOpen: (isMobileSidebarOpen) => set({ isMobileSidebarOpen }),}));

export default useSidebarStore;