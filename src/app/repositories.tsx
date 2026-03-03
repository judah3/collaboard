import { createContext, useContext } from "react";
import { mockProjectRepository } from "@/features/projects/repository/mockProjectRepository";
import type { ProjectRepository } from "@/features/projects/repository/types";
import { mockTaskRepository } from "@/features/tasks/repository/mockTaskRepository";
import type { TaskRepository } from "@/features/tasks/repository/types";

type RepositoryRegistry = {
  projectRepository: ProjectRepository;
  taskRepository: TaskRepository;
};

export const projectRepository = mockProjectRepository;
export const taskRepository = mockTaskRepository;

const defaultRepositories: RepositoryRegistry = {
  projectRepository,
  taskRepository
};

export const RepositoryContext = createContext<RepositoryRegistry>(defaultRepositories);

export const useRepositories = () => useContext(RepositoryContext);