import { create } from 'zustand';

type SkillState = {
    selectedSkill: string | null;
    setSelectedSkill: (message: string) => void;
};

export const useSkillStore = create<SkillState>((set) => ({
    selectedSkill: null,
    setSelectedSkill: (selectedSkill: string) => set({ selectedSkill }),
}));