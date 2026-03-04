import {
  type DragCancelEvent,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
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
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BoardColumn } from "@/features/board/types";
import { Column } from "@/features/board/Column";
import { TaskCard } from "@/features/board/TaskCard";
import { CreateColumnInline } from "@/features/board/components/CreateColumnInline";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/shared/lib/cn";
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
type TasksByColumn = Record<string, Task[]>;
const sortTransition = {
  duration: 420,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)"
};
type DragSize = {
  width: number;
  height: number;
};
type InsertAnimationState = {
  taskId: string;
  columnId: string;
} | null;

const cloneTasksByColumn = (tasksByColumn: TasksByColumn): TasksByColumn =>
  Object.fromEntries(Object.entries(tasksByColumn).map(([columnId, tasks]) => [columnId, tasks.map((task) => ({ ...task }))]));

const normalizeColumnTasks = (tasks: Task[], columnId: string) =>
  tasks.map((task, index) => ({ ...task, columnId, order: index }));

const findTaskLocation = (tasksByColumn: TasksByColumn, taskId: string) => {
  for (const [columnId, tasks] of Object.entries(tasksByColumn)) {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index >= 0) {
      return { columnId, index, task: tasks[index] };
    }
  }

  return null;
};

const resolveTaskDropTarget = (tasksByColumn: TasksByColumn, overId: string) => {
  if (overId.startsWith("task-")) {
    const overTaskId = overId.replace("task-", "");
    const overTaskLocation = findTaskLocation(tasksByColumn, overTaskId);
    if (!overTaskLocation) {
      return null;
    }

    return { columnId: overTaskLocation.columnId, index: overTaskLocation.index };
  }

  if (overId.startsWith("column-drop-")) {
    const columnId = overId.replace("column-drop-", "");
    return { columnId, index: (tasksByColumn[columnId] ?? []).length };
  }

  if (overId.startsWith("column-")) {
    const columnId = overId.replace("column-", "");
    return { columnId, index: (tasksByColumn[columnId] ?? []).length };
  }

  return null;
};

const SortableTaskCard = ({
  task,
  assigneeName,
  onTaskClick,
  dragSize,
  isInsertionAnimated
}: {
  task: Task;
  assigneeName?: string;
  onTaskClick: () => void;
  dragSize: DragSize | null;
  isInsertionAnimated: boolean;
}) => {
  const sortable = useSortable({
    id: getTaskDragId(task.id),
    transition: sortTransition,
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
      className={cn(
        "transition-[transform,opacity] duration-300",
        sortable.isDragging ? "z-20 opacity-70" : "opacity-100",
        !sortable.isDragging && isInsertionAnimated ? "task-insert-animate" : null
      )}
      style={{
        width: sortable.isDragging && dragSize ? `${dragSize.width}px` : undefined,
        minHeight: sortable.isDragging && dragSize ? `${dragSize.height}px` : undefined,
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
  width,
  children
}: {
  columnId: string;
  width: string;
  children: ReactNode;
}) => {
  const sortable = useSortable({
    id: getColumnDragId(columnId),
    transition: sortTransition,
    data: { type: "column", columnId }
  });

  return (
    <div
      ref={sortable.setNodeRef}
      className="shrink-0"
      data-column-drag-id={columnId}
      style={{
        width,
        minWidth: width,
        flexBasis: width,
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
  const [overDragId, setOverDragId] = useState<string | null>(null);
  const [activeTaskDragSize, setActiveTaskDragSize] = useState<DragSize | null>(null);
  const [previewTasksByColumn, setPreviewTasksByColumn] = useState<TasksByColumn | null>(null);
  const [insertAnimation, setInsertAnimation] = useState<InsertAnimationState>(null);
  const insertAnimationTimeoutRef = useRef<number | null>(null);
  const isTaskDragActive = Boolean(activeDragId?.startsWith("task-"));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columnIds = columns.map((column) => getColumnDragId(column.id));
  const renderedTasksByColumn = previewTasksByColumn ?? tasksByColumn;
  const boardColumnCount = Math.max(columns.length, 1);
  const gapPx = 16;
  const columnWidth = `calc((100% - ${(boardColumnCount - 1) * gapPx}px) / ${boardColumnCount})`;

  const findTaskByDragId = (id: string, map: TasksByColumn = renderedTasksByColumn) => {
    if (!id.startsWith("task-")) {
      return null;
    }

    const taskId = id.replace("task-", "");
    for (const column of columns) {
      const found = (map[column.id] ?? []).find((task) => task.id === taskId);
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
  }, [activeDragId, columns, renderedTasksByColumn]);

  const onDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    setActiveDragId(activeId);
    setOverDragId(null);
    const isTaskDrag = activeId.startsWith("task-");
    setPreviewTasksByColumn(isTaskDrag ? cloneTasksByColumn(tasksByColumn) : null);

    if (!isTaskDrag) {
      setActiveTaskDragSize(null);
      return;
    }

    const taskId = activeId.replace("task-", "");
    const taskNode = document.querySelector<HTMLElement>(`[data-task-drag-id="${taskId}"]`);
    if (!taskNode) {
      setActiveTaskDragSize(null);
      return;
    }

    const taskRect = taskNode.getBoundingClientRect();
    setActiveTaskDragSize({
      width: Math.round(taskRect.width),
      height: Math.round(taskRect.height)
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    setOverDragId(overId);

    if (!overId || !activeId.startsWith("task-")) {
      return;
    }

    setPreviewTasksByColumn((current) => {
      const working = current ?? cloneTasksByColumn(tasksByColumn);
      const activeTaskId = activeId.replace("task-", "");
      const source = findTaskLocation(working, activeTaskId);
      const target = resolveTaskDropTarget(working, overId);

      if (!source || !target) {
        return current;
      }

      if (source.columnId === target.columnId && source.index === target.index) {
        return current;
      }

      const next = { ...working };
      const sourceTasks = [...(next[source.columnId] ?? [])];
      const [movedTask] = sourceTasks.splice(source.index, 1);

      if (!movedTask) {
        return current;
      }

      next[source.columnId] = normalizeColumnTasks(sourceTasks, source.columnId);

      const destinationTasks = [...(next[target.columnId] ?? [])];
      const clampedIndex = Math.max(0, Math.min(target.index, destinationTasks.length));
      destinationTasks.splice(clampedIndex, 0, { ...movedTask, columnId: target.columnId });
      next[target.columnId] = normalizeColumnTasks(destinationTasks, target.columnId);

      return next;
    });
  };

  const onDragCancel = (_event: DragCancelEvent) => {
    setActiveDragId(null);
    setOverDragId(null);
    setActiveTaskDragSize(null);
    setPreviewTasksByColumn(null);
    setInsertAnimation(null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const previewMap = previewTasksByColumn ?? tasksByColumn;
    setActiveDragId(null);
    setOverDragId(null);
    setActiveTaskDragSize(null);
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;

    if (!overId) {
      setPreviewTasksByColumn(null);
      setInsertAnimation(null);
      return;
    }

    if (activeId.startsWith("column-") && overId.startsWith("column-")) {
      setPreviewTasksByColumn(null);
      setInsertAnimation(null);
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
      setPreviewTasksByColumn(null);
      setInsertAnimation(null);
      return;
    }

    const activeTask = findTaskByDragId(activeId, tasksByColumn);
    if (!activeTask) {
      setPreviewTasksByColumn(null);
      setInsertAnimation(null);
      return;
    }

    const source = findTaskLocation(tasksByColumn, activeTask.id);
    const target = resolveTaskDropTarget(previewMap, overId);

    if (!source || !target) {
      setPreviewTasksByColumn(null);
      setInsertAnimation(null);
      return;
    }

    const targetColumnId = target.columnId;
    const targetIndex = target.index;

    if (source.columnId === targetColumnId && source.index === targetIndex) {
      setPreviewTasksByColumn(null);
      setInsertAnimation(null);
      return;
    }

    setInsertAnimation({ taskId: activeTask.id, columnId: targetColumnId });
    setPreviewTasksByColumn(previewMap);

    onReorderTasks({
      taskId: activeTask.id,
      fromColumnId: activeTask.columnId,
      toColumnId: targetColumnId,
      fromIndex: source.index,
      toIndex: targetIndex
    });
  };

  const resolveTaskOverColumnId = (overId: string | null) => {
    if (!overId) {
      return null;
    }

    if (overId.startsWith("task-")) {
      const overTask = findTaskByDragId(overId);
      return overTask?.columnId ?? null;
    }

    if (overId.startsWith("column-drop-")) {
      return overId.replace("column-drop-", "");
    }

    if (overId.startsWith("column-")) {
      return overId.replace("column-", "");
    }

    return null;
  };

  const activeOverColumnId = isTaskDragActive ? resolveTaskOverColumnId(overDragId) : null;

  useEffect(() => {
    if (!insertAnimation) {
      return;
    }

    if (insertAnimationTimeoutRef.current) {
      window.clearTimeout(insertAnimationTimeoutRef.current);
    }

    insertAnimationTimeoutRef.current = window.setTimeout(() => {
      setInsertAnimation(null);
      setPreviewTasksByColumn(null);
      insertAnimationTimeoutRef.current = null;
    }, 320);

    return () => {
      if (insertAnimationTimeoutRef.current) {
        window.clearTimeout(insertAnimationTimeoutRef.current);
        insertAnimationTimeoutRef.current = null;
      }
    };
  }, [insertAnimation]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div className="no-scrollbar flex min-w-0 gap-4 overflow-x-auto overflow-y-hidden pb-2">
          {columns.map((column) => {
            const tasks = renderedTasksByColumn[column.id] ?? [];
            return (
              <SortableColumnWrapper key={column.id} columnId={column.id} width={columnWidth}>
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
                    isTaskDragActive={isTaskDragActive}
                    isTaskDragOver={activeOverColumnId === column.id}
                    renderSortableTask={(task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        dragSize={activeDragId === getTaskDragId(task.id) ? activeTaskDragSize : null}
                        isInsertionAnimated={insertAnimation?.taskId === task.id && insertAnimation?.columnId === column.id}
                        assigneeName={assigneesById[task.assigneeId]}
                        onTaskClick={() => onTaskClick(task.id)}
                      />
                    )}
                  />
                </SortableContext>
              </SortableColumnWrapper>
            );
          })}

          {isCreateColumnOpen ? (
            <div className="shrink-0" style={{ width: columnWidth, minWidth: columnWidth, flexBasis: columnWidth }}>
              <CreateColumnInline
                draft={newColumnDraft}
                isSubmitting={isCreatingColumn}
                errorMessage={columnCreateError}
                onDraftChange={onCreateColumnDraftChange}
                onCreate={onCreateColumnSubmit}
                onCancel={onCreateColumnCancel}
              />
            </div>
          ) : (
            <section className="shrink-0 rounded-xl bg-slate-50 p-3" style={{ width: columnWidth, minWidth: columnWidth, flexBasis: columnWidth }}>
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
          <div
            className="opacity-95"
            style={{
              width: activeTaskDragSize ? `${activeTaskDragSize.width}px` : undefined,
              minHeight: activeTaskDragSize ? `${activeTaskDragSize.height}px` : undefined
            }}
          >
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
