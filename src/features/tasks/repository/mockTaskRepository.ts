import { mockTasks } from "@/features/tasks/mockTasks";
import type { TaskRepository } from "@/features/tasks/repository/types";
import { normalizeRequest, shapeResponse } from "@/shared/lib/interceptors";

let tasks = mockTasks.map((task) => ({
  ...task,
  projectId: task.projectId ?? "mad-dogs-portal"
}));

export const mockTaskRepository: TaskRepository = {
  getTasksByProjectId: async (projectId) => {
    normalizeRequest({ payload: { action: "get_tasks", projectId } });
    return shapeResponse(tasks.filter((task) => task.projectId === projectId));
  },
  updateTask: async (projectId, taskId, patch) => {
    normalizeRequest({ payload: { action: "update_task", projectId, taskId } });
    const index = tasks.findIndex((task) => task.projectId === projectId && task.id === taskId);

    if (index < 0) {
      throw new Error("Task not found");
    }

    tasks[index] = {
      ...tasks[index],
      ...patch
    };

    return shapeResponse(tasks[index]);
  }
};
