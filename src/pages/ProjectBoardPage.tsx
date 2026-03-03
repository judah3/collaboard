import { useMemo } from "react";
import { Funnel, Plus, SlidersHorizontal } from "lucide-react";
import { Board } from "@/features/board/Board";
import { useProjectLayoutContext } from "@/features/projects/context/ProjectLayoutContext";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { groupTasksByStatus } from "@/features/tasks/lib/selectors";
import { TaskDrawer } from "@/features/tasks/TaskDrawer";
import { taskStoreSelectors, useTaskStore } from "@/features/tasks/taskStore";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";

export const ProjectBoardPage = () => {
  const { projectId, project } = useProjectLayoutContext();
  const selectedTaskId = useTaskStore(taskStoreSelectors.selectedTaskId);
  const isDrawerOpen = useTaskStore(taskStoreSelectors.isTaskDrawerOpen);
  const searchQuery = useTaskStore(taskStoreSelectors.searchQuery);
  const assigneeFilter = useTaskStore(taskStoreSelectors.assigneeFilter);
  const tagFilter = useTaskStore(taskStoreSelectors.tagFilter);
  const sortKey = useTaskStore(taskStoreSelectors.sortKey);
  const setAssigneeFilter = useTaskStore((state) => state.setAssigneeFilter);
  const setTagFilter = useTaskStore((state) => state.setTagFilter);
  const setSortKey = useTaskStore((state) => state.setSortKey);
  const openTaskDrawer = useTaskStore((state) => state.openTaskDrawer);
  const closeTaskDrawer = useTaskStore((state) => state.closeTaskDrawer);

  const { data: tasks = [], isLoading, isError } = useTasks(projectId, {
    searchQuery,
    assigneeFilter,
    tagFilter
  });

  const allTags = useMemo(() => Array.from(new Set(tasks.flatMap((task) => task.tags))).sort(), [tasks]);

  const normalizedTasks = useMemo(() => {
    if (sortKey !== "dueDate") {
      return tasks;
    }

    return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [sortKey, tasks]);

  const tasksByStatus = useMemo(() => groupTasksByStatus(normalizedTasks), [normalizedTasks]);
  const assigneesById = useMemo(
    () =>
      project.members.reduce<Record<string, string>>((acc, member) => {
        acc[member.id] = member.name;
        return acc;
      }, {}),
    [project.members]
  );

  const selectedTask = normalizedTasks.find((task) => task.id === selectedTaskId) ?? null;

  if (isLoading) {
    return (
      <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading board...</div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Failed to load tasks for this project.</div>
      </section>
    );
  }

  return (
    <div className="flex min-h-0 gap-4 lg:gap-6">
      <div className="min-w-0 flex-1">
        <section className="border-b border-slate-200 bg-white px-3 py-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
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
          </div>
        </section>

        <div className="bg-slate-50 px-3 py-4 sm:px-4 lg:px-6">
          <Board tasksByStatus={tasksByStatus} assigneesById={assigneesById} onTaskClick={openTaskDrawer} />
        </div>
      </div>

      <TaskDrawer
        isOpen={isDrawerOpen}
        task={selectedTask}
        users={project.members}
        onClose={closeTaskDrawer}
      />
    </div>
  );
};
