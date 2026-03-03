import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState, type ReactNode } from "react";
import type { BoardColumn } from "@/features/board/types";
import { Column } from "@/features/board/Column";
import { TaskCard } from "@/features/board/TaskCard";
import { CreateColumnInline } from "@/features/board/components/CreateColumnInline";
import type { Task } from "@/features/tasks/types";
import { Button } from "@/shared/ui/Button";
import { Plus } from "lucide-react";

type ReorderTaskPayload = {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  fromIndex: number;
  toIndex: number;
};

type BoardProps = {
  columns: BoardColumn[];
  tasksByColumn: Record<string, Task[]>;
  assigneesById: Record<string, string>;
  activeCreateTaskColumnId: string | null;
  isCreateColumnOpen: boolean;
  newColumnDraft: string;
  isCreatingColumn: boolean;
  columnCreateError: string | null;
  isCreatingTask: boolean;
  taskCreateError: string | null;
  onTaskClick: (taskId: string) => void;
  onCreateTaskOpen: (columnId: string) => void;
  onCreateTaskCancel: () => void;
  onCreateTaskSubmit: (columnId: string, title: string) => void;
  onCreateColumnOpen: () => void;
  onCreateColumnCancel: () => void;
  onCreateColumnDraftChange: (value: string) => void;
  onCreateColumnSubmit: () => void;
  onReorderColumns: (orderedColumnIds: string[]) => void;
  onReorderTasks: (payload: ReorderTaskPayload) => void;
};

const getTaskDragId = (taskId: string) => `task-${taskId}`;
const getColumnDragId = (columnId: string) => `column-${columnId}`;
const getColumnDropId = (columnId: string) => `column-drop-${columnId}`;

const SortableTaskCard = ({ task, assigneeName, onTaskClick }: { task: Task; assigneeName?: string; onTaskClick: () => void }) => {
  const sortable = useSortable({
    id: getTaskDragId(task.id),
    data: {
      type: "task",
      taskId: task.id,
      columnId: task.columnId,
      index: task.order
    }
  });

  return (
    <div
      ref={sortable.setNodeRef}
      data-task-drag-id={task.id}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition
      }}
      {...sortable.attributes}
      {...sortable.listeners}
    >
      <TaskCard task={task} assigneeName={assigneeName} onClick={onTaskClick} />
    </div>
  );
};

const SortableColumnWrapper = ({
  columnId,
  children
}: {
  columnId: string;
  children: ReactNode;
}) => {
  const sortable = useSortable({
    id: getColumnDragId(columnId),
    data: { type: "column", columnId }
  });

  return (
    <div
      ref={sortable.setNodeRef}
      data-column-drag-id={columnId}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition
      }}
      {...sortable.attributes}
      {...sortable.listeners}
    >
      {children}
    </div>
  );
};

const ColumnDropZone = ({ columnId }: { columnId: string }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: getColumnDropId(columnId),
    data: { type: "column-drop", columnId }
  });

  return (
    <div
      ref={setNodeRef}
      data-column-drop-id={columnId}
      className={`h-16 rounded-lg border border-dashed px-3 py-2 text-xs text-slate-500 ${
        isOver ? "border-blue-400 bg-blue-50" : "border-slate-300"
      }`}
    >
      Drop task here
    </div>
  );
};

export const Board = ({
  columns,
  tasksByColumn,
  assigneesById,
  activeCreateTaskColumnId,
  isCreateColumnOpen,
  newColumnDraft,
  isCreatingColumn,
  columnCreateError,
  isCreatingTask,
  taskCreateError,
  onTaskClick,
  onCreateTaskOpen,
  onCreateTaskCancel,
  onCreateTaskSubmit,
  onCreateColumnOpen,
  onCreateColumnCancel,
  onCreateColumnDraftChange,
  onCreateColumnSubmit,
  onReorderColumns,
  onReorderTasks
}: BoardProps) => {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columnIds = columns.map((column) => getColumnDragId(column.id));

  const findTaskByDragId = (id: string) => {
    if (!id.startsWith("task-")) {
      return null;
    }

    const taskId = id.replace("task-", "");
    for (const column of columns) {
      const found = (tasksByColumn[column.id] ?? []).find((task) => task.id === taskId);
      if (found) {
        return found;
      }
    }

    return null;
  };

  const dragOverlayTask = useMemo(() => {
    if (!activeDragId || !activeDragId.startsWith("task-")) {
      return null;
    }

    return findTaskByDragId(activeDragId);
  }, [activeDragId, columns, tasksByColumn]);

  const onDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;

    if (!overId) {
      return;
    }

    if (activeId.startsWith("column-") && overId.startsWith("column-")) {
      if (activeId === overId) {
        return;
      }

      const from = columnIds.indexOf(activeId);
      const to = columnIds.indexOf(overId);

      if (from < 0 || to < 0) {
        return;
      }

      const reordered = [...columns];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      onReorderColumns(reordered.map((column) => column.id));
      return;
    }

    if (!activeId.startsWith("task-")) {
      return;
    }

    const activeTask = findTaskByDragId(activeId);
    if (!activeTask) {
      return;
    }

    let targetColumnId = activeTask.columnId;
    let targetIndex = 0;

    if (overId.startsWith("task-")) {
      const overTask = findTaskByDragId(overId);
      if (!overTask) {
        return;
      }
      targetColumnId = overTask.columnId;
      targetIndex = overTask.order;
    } else if (overId.startsWith("column-drop-")) {
      targetColumnId = overId.replace("column-drop-", "");
      targetIndex = (tasksByColumn[targetColumnId] ?? []).length;
    } else if (overId.startsWith("column-")) {
      targetColumnId = overId.replace("column-", "");
      targetIndex = (tasksByColumn[targetColumnId] ?? []).length;
    } else {
      return;
    }

    if (activeTask.columnId === targetColumnId && activeTask.order === targetIndex) {
      return;
    }

    onReorderTasks({
      taskId: activeTask.id,
      fromColumnId: activeTask.columnId,
      toColumnId: targetColumnId,
      fromIndex: activeTask.order,
      toIndex: targetIndex
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div className="flex min-w-0 gap-4 overflow-x-auto pb-2">
          {columns.map((column) => {
            const tasks = tasksByColumn[column.id] ?? [];
            return (
              <SortableColumnWrapper key={column.id} columnId={column.id}>
                <SortableContext items={tasks.map((task) => getTaskDragId(task.id))} strategy={verticalListSortingStrategy}>
                  <Column
                    column={column}
                    tasks={tasks}
                    isCreateTaskOpen={activeCreateTaskColumnId === column.id}
                    isCreatingTask={isCreatingTask}
                    taskCreateError={taskCreateError}
                    onCreateTaskOpen={() => onCreateTaskOpen(column.id)}
                    onCreateTaskCancel={onCreateTaskCancel}
                    onCreateTaskSubmit={(title) => onCreateTaskSubmit(column.id, title)}
                    renderSortableTask={(task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        assigneeName={assigneesById[task.assigneeId]}
                        onTaskClick={() => onTaskClick(task.id)}
                      />
                    )}
                    dropZone={<ColumnDropZone columnId={column.id} />}
                  />
                </SortableContext>
              </SortableColumnWrapper>
            );
          })}

          {isCreateColumnOpen ? (
            <CreateColumnInline
              draft={newColumnDraft}
              isSubmitting={isCreatingColumn}
              errorMessage={columnCreateError}
              onDraftChange={onCreateColumnDraftChange}
              onCreate={onCreateColumnSubmit}
              onCancel={onCreateColumnCancel}
            />
          ) : (
            <section className="min-w-[320px] rounded-xl bg-slate-50 p-3">
              <Button variant="secondary" className="w-full justify-start" onClick={onCreateColumnOpen}>
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </section>
          )}
        </div>
      </SortableContext>

      <DragOverlay>
        {dragOverlayTask ? (
          <div className="w-[320px] opacity-95">
            <TaskCard
              task={dragOverlayTask}
              assigneeName={assigneesById[dragOverlayTask.assigneeId]}
              onClick={() => undefined}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
