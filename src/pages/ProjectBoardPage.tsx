import { useMemo } from "react";
import { Funnel, ListFilter, Plus, SquareKanban } from "lucide-react";
import { Board } from "@/features/board/Board";
import { ProjectHeader } from "@/features/projects/ProjectHeader";
import { mockTasks, mockUsers } from "@/features/tasks/mockTasks";
import { TaskDrawer } from "@/features/tasks/TaskDrawer";
import { useTaskStore } from "@/features/tasks/taskStore";
import type { TaskStatus } from "@/features/tasks/types";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";

const statuses: TaskStatus[] = ["Backlog", "In Progress", "Completed"];

export const ProjectBoardPage = () => {
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);
  const isDrawerOpen = useTaskStore((state) => state.isDrawerOpen);
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const assigneeFilter = useTaskStore((state) => state.assigneeFilter);
  const tagFilter = useTaskStore((state) => state.tagFilter);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const setAssigneeFilter = useTaskStore((state) => state.setAssigneeFilter);
  const setTagFilter = useTaskStore((state) => state.setTagFilter);
  const openTask = useTaskStore((state) => state.openTask);
  const closeDrawer = useTaskStore((state) => state.closeDrawer);

  const allTags = useMemo(() => Array.from(new Set(mockTasks.flatMap((task) => task.tags))).sort(), []);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return mockTasks.filter((task) => {
      const matchesAssignee = assigneeFilter === "all" || task.assigneeId === assigneeFilter;
      const matchesTag = tagFilter === "all" || task.tags.includes(tagFilter);
      const matchesQuery =
        query.length === 0 ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);

      return matchesAssignee && matchesTag && matchesQuery;
    });
  }, [assigneeFilter, searchQuery, tagFilter]);

  const tasksByStatus = useMemo(
    () =>
      statuses.reduce(
        (acc, status) => {
          acc[status] = filteredTasks.filter((task) => task.status === status);
          return acc;
        },
        {
          Backlog: [],
          "In Progress": [],
          Completed: []
        } as Record<TaskStatus, typeof filteredTasks>
      ),
    [filteredTasks]
  );

  const selectedTask = mockTasks.find((task) => task.id === selectedTaskId) ?? null;

  return (
    <div className="flex min-h-0 gap-4 lg:gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <ProjectHeader />

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button variant="primary" className="gap-2">
                <SquareKanban className="h-4 w-4" />
                Board
              </Button>
              <Button variant="secondary" className="gap-2">
                <ListFilter className="h-4 w-4" />
                Sort
              </Button>
            </div>

            <Button variant="secondary" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Input
              placeholder="Search tasks"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="md:col-span-2"
            />

            <Select
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
              icon={<Funnel className="h-4 w-4" />}
            >
              <option value="all">All assignees</option>
              {mockUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>

            <Select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} icon={<Funnel className="h-4 w-4" />}>
              <option value="all">All tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Select>
          </div>
        </section>

        <Board tasksByStatus={tasksByStatus} onTaskClick={openTask} />
      </div>

      <TaskDrawer isOpen={isDrawerOpen} task={selectedTask} onClose={closeDrawer} />
    </div>
  );
};
