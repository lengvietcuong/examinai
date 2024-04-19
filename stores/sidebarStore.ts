import { create } from 'zustand';

type SidebarStore = {
    isOpenMobile: boolean;
    isOpenDesktop: boolean;
    setIsOpenMobile: (isOpenMobile: boolean) => void;
    setIsOpenDesktop: (isOpenDesktop: boolean) => void;
};

const useSidebarStore = create<SidebarStore>((set) => ({
    isOpenMobile: false,
    isOpenDesktop: true,
    setIsOpenMobile: (isOpenMobile) => set({ isOpenMobile }),
    setIsOpenDesktop: (isOpenDesktop) => set({ isOpenDesktop }),
}));

export default useSidebarStore;