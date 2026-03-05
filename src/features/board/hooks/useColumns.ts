import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/app/repositories";
import type { CreateColumnInput, UpdateColumnInput } from "@/features/board/repository.types";

export const useColumns = (projectId: string) => {
  const { columnRepository } = useRepositories();

  return useQuery({
    queryKey: ["columns", projectId],
    queryFn: () => columnRepository.getColumnsByProjectId(projectId)
  });
};

export const useCreateColumn = (projectId: string) => {
  const { columnRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateColumnInput) => columnRepository.createColumn(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", projectId] });
    }
  });
};

export const useReorderColumns = (projectId: string) => {
  const { columnRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedColumnIds: string[]) => columnRepository.reorderColumns(projectId, orderedColumnIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", projectId] });
    }
  });
};

export const useUpdateColumn = (projectId: string) => {
  const { columnRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, input }: { columnId: string; input: UpdateColumnInput }) =>
      columnRepository.updateColumn(projectId, columnId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", projectId] });
    }
  });
};

export const useDeleteColumn = (projectId: string) => {
  const { columnRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) => columnRepository.deleteColumn(projectId, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", projectId] });
    }
  });
};
