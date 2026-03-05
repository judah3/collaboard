import { createContext, useContext } from "react";
import { apiColumnRepository } from "@/features/board/repository/apiColumnRepository";
import type { ColumnRepository } from "@/features/board/repository.types";
import { mockProjectRepository } from "@/features/projects/repository/mockProjectRepository";
import type { ProjectRepository } from "@/features/projects/repository/types";
import { apiTaskRepository } from "@/features/tasks/repository/apiTaskRepository";
import type { TaskRepository } from "@/features/tasks/repository/types";

type RepositoryRegistry = {
  projectRepository: ProjectRepository;
  columnRepository: ColumnRepository;
  taskRepository: TaskRepository;
};

export const projectRepository = mockProjectRepository;
export const columnRepository = apiColumnRepository;
export const taskRepository = apiTaskRepository;

const defaultRepositories: RepositoryRegistry = {
  projectRepository,
  columnRepository,
  taskRepository
};

export const RepositoryContext = createContext<RepositoryRegistry>(defaultRepositories);

export const useRepositories = () => useContext(RepositoryContext);
