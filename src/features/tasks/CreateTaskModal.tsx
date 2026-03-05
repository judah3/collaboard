import { FormEvent, useEffect, useMemo, useState } from "react";
import type { BoardColumn } from "@/features/board/types";
import type { TaskPriority } from "@/features/tasks/types";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";

type CreateTaskModalSubmitPayload = {
  columnId: string;
  title: string;
  description: string;
  dueDate: string;
  tags: string[];
  priority: TaskPriority;
  assigneeId?: string;
};

type CreateTaskModalProps = {
  isOpen: boolean;
  columns: BoardColumn[];
  assignees: Array<{ id: string; name: string }>;
  availableTags: string[];
  initialColumnId: string | null;
  initialAssigneeId?: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateTaskModalSubmitPayload) => void;
};

const defaultDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  return dueDate.toISOString().slice(0, 10);
};

export const CreateTaskModal = ({
  isOpen,
  columns,
  assignees,
  availableTags,
  initialColumnId,
  initialAssigneeId,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit
}: CreateTaskModalProps) => {
  const [columnId, setColumnId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [selectedTag, setSelectedTag] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const fallbackColumnId = useMemo(() => initialColumnId ?? columns[0]?.id ?? "", [columns, initialColumnId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setColumnId(fallbackColumnId);
    setTitle("");
    setDescription("");
    setDueDate(defaultDueDate());
    setSelectedTag("");
    setNewTagInput("");
    setSelectedTags([]);
    setPriority("Medium");
    setAssigneeId(initialAssigneeId ?? assignees[0]?.id ?? "");
    setValidationError(null);
  }, [assignees, fallbackColumnId, initialAssigneeId, isOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (!columnId) {
      setValidationError("Column is required.");
      return;
    }

    if (!title.trim()) {
      setValidationError("Task title is required.");
      return;
    }

    onSubmit({
      columnId,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      tags: selectedTags,
      priority,
      assigneeId: assigneeId || undefined
    });
  };

  const addSelectedTag = () => {
    const candidate = (selectedTag || newTagInput).trim();
    if (!candidate) {
      return;
    }

    if (candidate.length > 24) {
      setValidationError("Tag must be 24 characters or fewer.");
      return;
    }

    setValidationError(null);
    setSelectedTags((current) =>
      current.some((item) => item.toLowerCase() === candidate.toLowerCase()) ? current : [...current, candidate]
    );
    setSelectedTag("");
    setNewTagInput("");
  };

  const removeTag = (tag: string) => {
    setSelectedTags((current) => current.filter((item) => item !== tag));
  };

  return (
    <Modal isOpen={isOpen} title="Add Task" description="Create a new task for your board." onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Task Title</span>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" disabled={isSubmitting} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Task Details</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Task details"
            rows={4}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Column</span>
            <select
              value={columnId}
              onChange={(event) => setColumnId(event.target.value)}
              disabled={isSubmitting}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Due Date</span>
            <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} disabled={isSubmitting} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Assignee</span>
            <select
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              disabled={isSubmitting || assignees.length === 0}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              {assignees.length === 0 ? <option value="">No members available</option> : null}
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Tags</span>
            <div className="flex flex-col gap-2">
              <Input
                value={newTagInput}
                onChange={(event) => setNewTagInput(event.target.value)}
                placeholder="Type a new tag (e.g. backend)"
                disabled={isSubmitting}
              />
              <select
                value={selectedTag}
                onChange={(event) => setSelectedTag(event.target.value)}
                disabled={isSubmitting || availableTags.length === 0}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                <option value="">{availableTags.length === 0 ? "No project tags found" : "Select project tag"}</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                onClick={addSelectedTag}
                disabled={isSubmitting || !(selectedTag || newTagInput.trim())}
              >
                Add
              </Button>
            </div>
            {selectedTags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => removeTag(tag)}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
                  >
                    {tag} x
                  </button>
                ))}
              </div>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Priority</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              disabled={isSubmitting}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
        </div>

        {validationError ? <p className="text-sm text-red-600">{validationError}</p> : null}
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
