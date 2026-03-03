import { create } from "zustand";
import type { Task } from "@/features/tasks/types";

export type DragState = {
  activeTaskId: string | null;
  activeColumnId: string | null;
};

export type TaskUIState = {
  selectedTaskId: string | null;
  isTaskDrawerOpen: boolean;
  searchQuery: string;
  assigneeFilter: string;
  tagFilter: string;
  sortKey: "manual" | "dueDate";
  activeCreateTaskColumnId: string | null;
  isCreateColumnOpen: boolean;
  newColumnDraft: string;
  editingTaskDraft: Partial<Task> | null;
  dragState: DragState;
  openTaskDrawer: (taskId: string) => void;
  closeTaskDrawer: () => void;
  setSearchQuery: (value: string) => void;
  setAssigneeFilter: (value: string) => void;
  setTagFilter: (value: string) => void;
  setSortKey: (value: "manual" | "dueDate") => void;
  resetFilters: () => void;
  openCreateTaskInline: (columnId: string) => void;
  closeCreateTaskInline: () => void;
  openCreateColumn: () => void;
  closeCreateColumn: () => void;
  setNewColumnDraft: (value: string) => void;
  startTaskEdit: (task: Task) => void;
  updateTaskDraft: (patch: Partial<Task>) => void;
  cancelTaskEdit: () => void;
  setDragState: (next: Partial<DragState>) => void;
};

const initialDragState: DragState = {
  activeTaskId: null,
  activeColumnId: null
};

export const useTaskStore = create<TaskUIState>((set) => ({
  selectedTaskId: null,
  isTaskDrawerOpen: false,
  searchQuery: "",
  assigneeFilter: "all",
  tagFilter: "all",
  sortKey: "manual",
  activeCreateTaskColumnId: null,
  isCreateColumnOpen: false,
  newColumnDraft: "",
  editingTaskDraft: null,
  dragState: initialDragState,
  openTaskDrawer: (taskId) => set({ selectedTaskId: taskId, isTaskDrawerOpen: true }),
  closeTaskDrawer: () => set({ isTaskDrawerOpen: false, selectedTaskId: null }),
  setSearchQuery: (value) => set({ searchQuery: value }),
  setAssigneeFilter: (value) => set({ assigneeFilter: value }),
  setTagFilter: (value) => set({ tagFilter: value }),
  setSortKey: (value) => set({ sortKey: value }),
  resetFilters: () => set({ searchQuery: "", assigneeFilter: "all", tagFilter: "all", sortKey: "manual" }),
  openCreateTaskInline: (columnId) => set({ activeCreateTaskColumnId: columnId }),
  closeCreateTaskInline: () => set({ activeCreateTaskColumnId: null }),
  openCreateColumn: () => set({ isCreateColumnOpen: true }),
  closeCreateColumn: () => set({ isCreateColumnOpen: false, newColumnDraft: "" }),
  setNewColumnDraft: (value) => set({ newColumnDraft: value }),
  startTaskEdit: (task) => set({ editingTaskDraft: task }),
  updateTaskDraft: (patch) =>
    set((state) => ({
      editingTaskDraft: state.editingTaskDraft ? { ...state.editingTaskDraft, ...patch } : patch
    })),
  cancelTaskEdit: () => set({ editingTaskDraft: null }),
  setDragState: (next) => set((state) => ({ dragState: { ...state.dragState, ...next } }))
}));

export const taskStoreSelectors = {
  selectedTaskId: (state: TaskUIState) => state.selectedTaskId,
  isTaskDrawerOpen: (state: TaskUIState) => state.isTaskDrawerOpen,
  searchQuery: (state: TaskUIState) => state.searchQuery,
  assigneeFilter: (state: TaskUIState) => state.assigneeFilter,
  tagFilter: (state: TaskUIState) => state.tagFilter,
  sortKey: (state: TaskUIState) => state.sortKey,
  activeCreateTaskColumnId: (state: TaskUIState) => state.activeCreateTaskColumnId,
  isCreateColumnOpen: (state: TaskUIState) => state.isCreateColumnOpen,
  newColumnDraft: (state: TaskUIState) => state.newColumnDraft,
  editingTaskDraft: (state: TaskUIState) => state.editingTaskDraft,
  dragState: (state: TaskUIState) => state.dragState
};