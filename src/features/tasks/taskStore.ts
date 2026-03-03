import { create } from "zustand";

type TaskUIState = {
  selectedTaskId: string | null;
  isDrawerOpen: boolean;
  searchQuery: string;
  assigneeFilter: string;
  tagFilter: string;
  openTask: (taskId: string) => void;
  closeDrawer: () => void;
  setSearchQuery: (value: string) => void;
  setAssigneeFilter: (value: string) => void;
  setTagFilter: (value: string) => void;
};

export const useTaskStore = create<TaskUIState>((set) => ({
  selectedTaskId: null,
  isDrawerOpen: false,
  searchQuery: "",
  assigneeFilter: "all",
  tagFilter: "all",
  openTask: (taskId) => set({ selectedTaskId: taskId, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, selectedTaskId: null }),
  setSearchQuery: (value) => set({ searchQuery: value }),
  setAssigneeFilter: (value) => set({ assigneeFilter: value }),
  setTagFilter: (value) => set({ tagFilter: value })
}));