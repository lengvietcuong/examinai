import { create } from 'zustand';

type ExaminerProcessingState = {
    isExaminerProcessing: boolean;
    setIsExaminerProcessing: (isExaminerProcessing: boolean) => void;
};

const useExaminerProcessingStore = create<ExaminerProcessingState>((set) => ({
    isExaminerProcessing: false,
    setIsExaminerProcessing: (isExaminerProcessing: boolean) => set({ isExaminerProcessing }),
}));

export default useExaminerProcessingStore;