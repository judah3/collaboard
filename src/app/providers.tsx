import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { queryClient } from "@/app/queryClient";
import { RepositoryContext, columnRepository, projectRepository, taskRepository } from "@/app/repositories";

export const AppProviders = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <RepositoryContext.Provider value={{ projectRepository, columnRepository, taskRepository }}>
      {children}
    </RepositoryContext.Provider>
  </QueryClientProvider>
);