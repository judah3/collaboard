import { mockTasks } from "@/features/tasks/mockTasks";
import type { CreateTaskInput, ReorderTasksPayload, TaskRepository } from "@/features/tasks/repository/types";
import type { Task } from "@/features/tasks/types";
import { normalizeRequest, shapeResponse } from "@/shared/lib/interceptors";

let tasks = [...mockTasks];

const taskSorter = (a: Task, b: Task) => {
  if (a.columnId === b.columnId) {
    return a.order - b.order;
  }
  return a.columnId.localeCompare(b.columnId);
};

const ensureTaskValidation = (input: Pick<CreateTaskInput, "title" | "description" | "tags" | "dueDate">) => {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Task title is required");
  }

  if (title.length > 120) {
    throw new Error("Task title must be 120 characters or fewer");
  }

  const description = input.description?.trim() ?? "";
  if (description.length > 1000) {
    throw new Error("Description must be 1000 characters or fewer");
  }

  const tags = input.tags ?? [];
  if (tags.length > 8 || tags.some((tag) => tag.length > 24)) {
    throw new Error("Tags are invalid");
  }

  const dueDate = new Date(input.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    throw new Error("Due date is invalid");
  }

  return { title, description, tags };
};

const normalizeColumnOrders = (projectId: string, columnId: string) => {
  const scoped = tasks
    .filter((task) => task.projectId === projectId && task.columnId === columnId)
    .sort((a, b) => a.order - b.order)
    .map((task, index) => ({ ...task, order: index }));

  tasks = [...tasks.filter((task) => !(task.projectId === projectId && task.columnId === columnId)), ...scoped];
};

const orderedProjectTasks = (projectId: string) =>
  tasks
    .filter((task) => task.projectId === projectId)
    .sort(taskSorter);

export const mockTaskRepository: TaskRepository = {
  getTasksByProjectId: async (projectId) => {
    normalizeRequest({ payload: { action: "get_tasks", projectId } });
    return shapeResponse(orderedProjectTasks(projectId));
  },

  createTask: async (projectId, input) => {
    normalizeRequest({ payload: { action: "create_task", projectId } });
    const { title, description, tags } = ensureTaskValidation(input);

    const existingColumnTasks = tasks
      .filter((task) => task.projectId === projectId && task.columnId === input.columnId)
      .sort((a, b) => a.order - b.order)
      .map((task, index) => ({ ...task, order: index + 1 }));

    const created: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      columnId: input.columnId,
      order: 0,
      title,
      description,
      priority: input.priority ?? "Low",
      assigneeId: input.assigneeId,
      dueDate: input.dueDate,
      tags,
      commentsCount: 0,
      attachmentsCount: 0,
      comments: []
    };

    tasks = [
      ...tasks.filter((task) => !(task.projectId === projectId && task.columnId === input.columnId)),
      ...existingColumnTasks,
      created
    ];

    return shapeResponse(created);
  },

  updateTask: async (projectId, taskId, patch) => {
    normalizeRequest({ payload: { action: "update_task", projectId, taskId } });
    const index = tasks.findIndex((task) => task.projectId === projectId && task.id === taskId);

    if (index < 0) {
      throw new Error("Task not found");
    }

    if (typeof patch.title === "string") {
      ensureTaskValidation({
        title: patch.title,
        description: patch.description ?? tasks[index].description,
        tags: patch.tags ?? tasks[index].tags,
        dueDate: patch.dueDate ?? tasks[index].dueDate
      });
    }

    const previous = tasks[index];
    tasks[index] = { ...tasks[index], ...patch };

    if (patch.columnId && patch.columnId !== previous.columnId) {
      normalizeColumnOrders(projectId, previous.columnId);
      normalizeColumnOrders(projectId, patch.columnId);
    }

    return shapeResponse(tasks[index]);
  },

  reorderTasks: async (projectId, payload: ReorderTasksPayload) => {
    normalizeRequest({ payload: { action: "reorder_tasks", projectId, ...payload } });

    const moving = tasks.find((task) => task.projectId === projectId && task.id === payload.taskId);
    if (!moving) {
      throw new Error("Task not found");
    }

    const source = orderedProjectTasks(projectId).filter((task) => task.columnId === payload.fromColumnId);
    const movedTask = { ...moving, columnId: payload.toColumnId };

    if (payload.fromColumnId === payload.toColumnId) {
      const withoutMoved = source.filter((task) => task.id !== payload.taskId);
      const clampedIndex = Math.max(0, Math.min(payload.toIndex, withoutMoved.length));
      withoutMoved.splice(clampedIndex, 0, movedTask);
      const normalized = withoutMoved.map((task, index) => ({ ...task, order: index }));
      const untouched = tasks.filter((task) => task.projectId !== projectId || task.columnId !== payload.fromColumnId);
      tasks = [...untouched, ...normalized];
      return shapeResponse(orderedProjectTasks(projectId));
    }

    const destination = orderedProjectTasks(projectId).filter((task) => task.columnId === payload.toColumnId);
    const sourceWithout = source.filter((task) => task.id !== payload.taskId);
    const destinationWithoutMoving = destination.filter((task) => task.id !== payload.taskId);
    const clampedIndex = Math.max(0, Math.min(payload.toIndex, destinationWithoutMoving.length));
    destinationWithoutMoving.splice(clampedIndex, 0, movedTask);

    const untouched = tasks.filter(
      (task) =>
        task.projectId !== projectId ||
        (task.columnId !== payload.fromColumnId && task.columnId !== payload.toColumnId)
    );

    const normalizedSource = sourceWithout.map((task, index) => ({ ...task, order: index }));
    const normalizedDestination = destinationWithoutMoving.map((task, index) => ({ ...task, order: index }));

    tasks = [...untouched, ...normalizedSource, ...normalizedDestination];

    return shapeResponse(orderedProjectTasks(projectId));
  }
};
