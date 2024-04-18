import { create } from 'zustand';

type SkillState = {
    selectedSkill: string;
    setSelectedSkill: (message: string) => void;
};

export const useSkillStore = create<SkillState>((set) => ({
    selectedSkill: '',
    setSelectedSkill: (selectedSkill: string) => set({ selectedSkill }),
}));