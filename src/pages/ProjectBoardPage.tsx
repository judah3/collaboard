import { useMemo } from "react";
import { Funnel, Kanban, List, Plus, Rows3, SlidersHorizontal } from "lucide-react";
import { Board } from "@/features/board/Board";
import { ProjectHeader } from "@/features/projects/ProjectHeader";
import { mockTasks, mockUsers } from "@/features/tasks/mockTasks";
import { TaskDrawer } from "@/features/tasks/TaskDrawer";
import { useTaskStore } from "@/features/tasks/taskStore";
import type { TaskStatus } from "@/features/tasks/types";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";

const statuses: TaskStatus[] = ["Backlog", "In Progress", "Completed"];

export const ProjectBoardPage = () => {
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);
  const isDrawerOpen = useTaskStore((state) => state.isDrawerOpen);
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const assigneeFilter = useTaskStore((state) => state.assigneeFilter);
  const tagFilter = useTaskStore((state) => state.tagFilter);
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
      <div className="min-w-0 flex-1">
        <ProjectHeader />

        <section className="border-b border-slate-200 bg-white px-3 py-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary">
                <Kanban className="h-4 w-4" />
                Board
              </Button>
              <Button variant="secondary">
                <List className="h-4 w-4" />
                List
              </Button>
              <Button variant="secondary">
                <Rows3 className="h-4 w-4" />
                Timeline
              </Button>
              <Button variant="ghost" className="text-slate-700">
                <Funnel className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="ghost" className="text-slate-700">
                <SlidersHorizontal className="h-4 w-4" />
                Sort
              </Button>
              <Button variant="ghost" className="text-slate-700">
                Group
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
              <Select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} icon={<Funnel className="h-4 w-4" />}>
                <option value="all">Filter</option>
                {mockUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
              <Select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                <option value="all">Sort</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </Select>
              <Button variant="secondary">
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </div>
          </div>
        </section>

        <div className="bg-slate-50 px-3 py-4 sm:px-4 lg:px-6">
          <Board tasksByStatus={tasksByStatus} onTaskClick={openTask} />
        </div>
      </div>

      <TaskDrawer isOpen={isDrawerOpen} task={selectedTask} onClose={closeDrawer} />
    </div>
  );
};
