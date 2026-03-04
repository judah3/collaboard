import { useMemo, useState } from "react";
import { Funnel, Plus, SlidersHorizontal } from "lucide-react";
import { Board } from "@/features/board/Board";
import { useColumns, useCreateColumn, useReorderColumns } from "@/features/board/hooks/useColumns";
import { useProjectLayoutContext } from "@/features/projects/context/ProjectLayoutContext";
import { TaskDrawer } from "@/features/tasks/TaskDrawer";
import { useCreateTask, useReorderTasks, useTasks, useUpdateTask } from "@/features/tasks/hooks/useTasks";
import { toTaskPatch } from "@/features/tasks/lib/mappers";
import { groupTasksByColumn } from "@/features/tasks/lib/selectors";
import { taskStoreSelectors, useTaskStore } from "@/features/tasks/taskStore";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";

export const ProjectBoardPage = () => {
  const { projectId, project } = useProjectLayoutContext();
  const selectedTaskId = useTaskStore(taskStoreSelectors.selectedTaskId);
  const isDrawerOpen = useTaskStore(taskStoreSelectors.isTaskDrawerOpen);
  const searchQuery = useTaskStore(taskStoreSelectors.searchQuery);
  const assigneeFilter = useTaskStore(taskStoreSelectors.assigneeFilter);
  const tagFilter = useTaskStore(taskStoreSelectors.tagFilter);
  const sortKey = useTaskStore(taskStoreSelectors.sortKey);
  const activeCreateTaskColumnId = useTaskStore(taskStoreSelectors.activeCreateTaskColumnId);
  const isCreateColumnOpen = useTaskStore(taskStoreSelectors.isCreateColumnOpen);
  const newColumnDraft = useTaskStore(taskStoreSelectors.newColumnDraft);
  const editingTaskDraft = useTaskStore(taskStoreSelectors.editingTaskDraft);

  const setAssigneeFilter = useTaskStore((state) => state.setAssigneeFilter);
  const setTagFilter = useTaskStore((state) => state.setTagFilter);
  const setSortKey = useTaskStore((state) => state.setSortKey);
  const openTaskDrawer = useTaskStore((state) => state.openTaskDrawer);
  const closeTaskDrawer = useTaskStore((state) => state.closeTaskDrawer);
  const openCreateTaskInline = useTaskStore((state) => state.openCreateTaskInline);
  const closeCreateTaskInline = useTaskStore((state) => state.closeCreateTaskInline);
  const openCreateColumn = useTaskStore((state) => state.openCreateColumn);
  const closeCreateColumn = useTaskStore((state) => state.closeCreateColumn);
  const setNewColumnDraft = useTaskStore((state) => state.setNewColumnDraft);
  const startTaskEdit = useTaskStore((state) => state.startTaskEdit);
  const updateTaskDraft = useTaskStore((state) => state.updateTaskDraft);
  const cancelTaskEdit = useTaskStore((state) => state.cancelTaskEdit);

  const { data: columns = [], isLoading: isLoadingColumns, isError: isColumnsError } = useColumns(projectId);
  const { data: tasks = [], isLoading: isLoadingTasks, isError: isTasksError } = useTasks(projectId, {
    searchQuery,
    assigneeFilter,
    tagFilter
  });

  const createColumnMutation = useCreateColumn(projectId);
  const reorderColumnsMutation = useReorderColumns(projectId);
  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask(projectId);
  const reorderTasksMutation = useReorderTasks(projectId);

  const [columnCreateError, setColumnCreateError] = useState<string | null>(null);
  const [taskCreateError, setTaskCreateError] = useState<string | null>(null);

  const allTags = useMemo(() => Array.from(new Set(tasks.flatMap((task) => task.tags))).sort(), [tasks]);

  const normalizedTasks = useMemo(() => {
    if (sortKey !== "dueDate") {
      return tasks;
    }

    return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [sortKey, tasks]);

  const tasksByColumn = useMemo(() => groupTasksByColumn(normalizedTasks, columns), [columns, normalizedTasks]);

  const assigneesById = useMemo(
    () =>
      project.members.reduce<Record<string, string>>((acc, member) => {
        acc[member.id] = member.name;
        return acc;
      }, {}),
    [project.members]
  );

  const selectedTask = normalizedTasks.find((task) => task.id === selectedTaskId) ?? null;
  const isTaskDrawerLoading = isDrawerOpen && (isLoadingTasks || (!!selectedTaskId && !selectedTask));

  const submitCreateColumn = async () => {
    try {
      setColumnCreateError(null);
      await createColumnMutation.mutateAsync({ name: newColumnDraft });
      closeCreateColumn();
    } catch (error) {
      setColumnCreateError(error instanceof Error ? error.message : "Failed to create column");
    }
  };

  const submitCreateTask = async (columnId: string, title: string) => {
    try {
      setTaskCreateError(null);
      const defaultAssignee = project.members[0]?.id;
      if (!defaultAssignee) {
        throw new Error("No project member available for assignee");
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      await createTaskMutation.mutateAsync({
        columnId,
        title,
        assigneeId: defaultAssignee,
        dueDate: dueDate.toISOString().slice(0, 10),
        priority: "Low",
        description: "",
        tags: []
      });

      closeCreateTaskInline();
    } catch (error) {
      setTaskCreateError(error instanceof Error ? error.message : "Failed to create task");
    }
  };

  const saveTaskDraft = async () => {
    if (!selectedTask || !editingTaskDraft) {
      return;
    }

    const nextAssigneeId = editingTaskDraft.assigneeId ?? selectedTask.assigneeId;
    if (!project.members.some((member) => member.id === nextAssigneeId)) {
      return;
    }

    await updateTaskMutation.mutateAsync({
      taskId: selectedTask.id,
      patch: toTaskPatch(editingTaskDraft)
    });

    cancelTaskEdit();
  };

  const openCreateTaskFromToolbar = () => {
    const targetColumnId = activeCreateTaskColumnId ?? columns[0]?.id;
    if (!targetColumnId) {
      return;
    }

    setTaskCreateError(null);
    openCreateTaskInline(targetColumnId);
  };

  if (isLoadingColumns || isLoadingTasks) {
    return (
      <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading board...</div>
      </section>
    );
  }

  if (isColumnsError || isTasksError) {
    return (
      <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Failed to load board data.</div>
      </section>
    );
  }

  return (
    <div className="flex min-h-0 gap-4 lg:gap-6">
      <div className="min-w-0 flex-1">
        <section className="border-b border-slate-200 bg-white px-3 py-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={assigneeFilter}
                onChange={(event) => setAssigneeFilter(event.target.value)}
                icon={<Funnel className="h-4 w-4" />}
              >
                <option value="all">Filter by Assignee</option>
                {project.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Select>
              <Select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                <option value="all">Filter by Tag</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </Select>
              <Select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as "manual" | "dueDate")}
                icon={<SlidersHorizontal className="h-4 w-4" />}
              >
                <option value="manual">Sort: Manual</option>
                <option value="dueDate">Sort: Due Date</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={openCreateTaskFromToolbar} disabled={columns.length === 0}>
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setColumnCreateError(null);
                  openCreateColumn();
                }}
              >
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </div>
          </div>
        </section>

        <div className="bg-slate-50 px-3 py-4 sm:px-4 lg:px-6">
          <Board
            columns={columns}
            tasksByColumn={tasksByColumn}
            assigneesById={assigneesById}
            activeCreateTaskColumnId={activeCreateTaskColumnId}
            isCreateColumnOpen={isCreateColumnOpen}
            newColumnDraft={newColumnDraft}
            isCreatingColumn={createColumnMutation.isPending}
            columnCreateError={columnCreateError}
            isCreatingTask={createTaskMutation.isPending}
            taskCreateError={taskCreateError}
            onTaskClick={openTaskDrawer}
            onCreateTaskCancel={() => {
              setTaskCreateError(null);
              closeCreateTaskInline();
            }}
            onCreateTaskSubmit={submitCreateTask}
            onCreateColumnCancel={() => {
              setColumnCreateError(null);
              closeCreateColumn();
            }}
            onCreateColumnDraftChange={setNewColumnDraft}
            onCreateColumnSubmit={submitCreateColumn}
            onReorderColumns={(orderedColumnIds) => reorderColumnsMutation.mutate(orderedColumnIds)}
            onReorderTasks={(payload) => reorderTasksMutation.mutate(payload)}
          />
        </div>
      </div>

      <TaskDrawer
        isOpen={isDrawerOpen}
        task={selectedTask}
        isLoading={isTaskDrawerLoading}
        users={project.members}
        columns={columns}
        draft={editingTaskDraft}
        isSaving={updateTaskMutation.isPending}
        onStartEdit={startTaskEdit}
        onDraftChange={updateTaskDraft}
        onCancelEdit={cancelTaskEdit}
        onSave={saveTaskDraft}
        onClose={() => {
          cancelTaskEdit();
          closeTaskDrawer();
        }}
      />
    </div>
  );
};
