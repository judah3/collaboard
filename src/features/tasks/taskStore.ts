import { create } from "zustand";

export type TaskUIState = {
  selectedTaskId: string | null;
  isTaskDrawerOpen: boolean;
  searchQuery: string;
  assigneeFilter: string;
  tagFilter: string;
  sortKey: "manual" | "dueDate";
  openTaskDrawer: (taskId: string) => void;
  closeTaskDrawer: () => void;
  setSearchQuery: (value: string) => void;
  setAssigneeFilter: (value: string) => void;
  setTagFilter: (value: string) => void;
  setSortKey: (value: "manual" | "dueDate") => void;
  resetFilters: () => void;
};

export const useTaskStore = create<TaskUIState>((set) => ({
  selectedTaskId: null,
  isTaskDrawerOpen: false,
  searchQuery: "",
  assigneeFilter: "all",
  tagFilter: "all",
  sortKey: "manual",
  openTaskDrawer: (taskId) => set({ selectedTaskId: taskId, isTaskDrawerOpen: true }),
  closeTaskDrawer: () => set({ isTaskDrawerOpen: false, selectedTaskId: null }),
  setSearchQuery: (value) => set({ searchQuery: value }),
  setAssigneeFilter: (value) => set({ assigneeFilter: value }),
  setTagFilter: (value) => set({ tagFilter: value }),
  setSortKey: (value) => set({ sortKey: value }),
  resetFilters: () => set({ searchQuery: "", assigneeFilter: "all", tagFilter: "all", sortKey: "manual" })
}));

export const taskStoreSelectors = {
  selectedTaskId: (state: TaskUIState) => state.selectedTaskId,
  isTaskDrawerOpen: (state: TaskUIState) => state.isTaskDrawerOpen,
  searchQuery: (state: TaskUIState) => state.searchQuery,
  assigneeFilter: (state: TaskUIState) => state.assigneeFilter,
  tagFilter: (state: TaskUIState) => state.tagFilter,
  sortKey: (state: TaskUIState) => state.sortKey
};
