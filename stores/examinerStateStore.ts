import { create } from "zustand";

type ExaminerState = {
  examinerState: "idle" | "initiating" | "generating" | "error";
  setExaminerState: (examinerState: ExaminerState["examinerState"]) => void;
};

const useExaminerStateStore = create<ExaminerState>((set) => ({
  examinerState: "idle",
  setExaminerState: (examinerState) => set({ examinerState }),
}));

export default useExaminerStateStore;
