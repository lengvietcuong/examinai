import { create } from 'zustand';

type SkillState = {
    selectedSkill: string | null;
    setSelectedSkill: (selectedSkill: string) => void;
};

export const useSkillStore = create<SkillState>((set) => ({
    selectedSkill: null,
    setSelectedSkill: (selectedSkill: string) => set({ selectedSkill }),
}));