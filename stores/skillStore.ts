import { create } from 'zustand';

type SkillState = {
    selectedSkill: string | null;
    setSelectedSkill: (selectedSkill: string | null) => void;
};

const useSkillStore = create<SkillState>((set) => ({
    selectedSkill: null,
    setSelectedSkill: (selectedSkill) => set({ selectedSkill }),
}));

export default useSkillStore;