import { createContext, useContext } from "react";
import { mockColumnRepository } from "@/features/board/mockColumnRepository";
import type { ColumnRepository } from "@/features/board/repository.types";
import { mockProjectRepository } from "@/features/projects/repository/mockProjectRepository";
import type { ProjectRepository } from "@/features/projects/repository/types";
import { mockTaskRepository } from "@/features/tasks/repository/mockTaskRepository";
import type { TaskRepository } from "@/features/tasks/repository/types";

type RepositoryRegistry = {
  projectRepository: ProjectRepository;
  columnRepository: ColumnRepository;
  taskRepository: TaskRepository;
};

export const projectRepository = mockProjectRepository;
export const columnRepository = mockColumnRepository;
export const taskRepository = mockTaskRepository;

const defaultRepositories: RepositoryRegistry = {
  projectRepository,
  columnRepository,
  taskRepository
};

export const RepositoryContext = createContext<RepositoryRegistry>(defaultRepositories);

export const useRepositories = () => useContext(RepositoryContext);