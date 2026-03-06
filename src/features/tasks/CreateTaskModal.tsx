import { FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
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
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const fallbackColumnId = useMemo(() => initialColumnId ?? columns[0]?.id ?? "", [columns, initialColumnId]);

  const remainingTagOptions = useMemo(
    () =>
      availableTags.filter((tag) => {
        const alreadySelected = selectedTags.some((selectedTag) => selectedTag.toLowerCase() === tag.toLowerCase());
        const matchesQuery = tag.toLowerCase().includes(tagInput.trim().toLowerCase());
        return !alreadySelected && matchesQuery;
      }),
    [availableTags, selectedTags, tagInput]
  );

  const addTagCandidate = (rawCandidate: string) => {
    const candidate = rawCandidate.trim();
    if (!candidate) {
      return false;
    }

    if (candidate.length > 24) {
      setValidationError("Tag must be 24 characters or fewer.");
      return false;
    }

    if (selectedTags.length >= 8) {
      setValidationError("A task can only have up to 8 tags.");
      return false;
    }

    setValidationError(null);
    let didAdd = false;
    setSelectedTags((current) =>
      current.some((item) => item.toLowerCase() === candidate.toLowerCase())
        ? current
        : (() => {
            didAdd = true;
            return [...current, candidate];
          })()
    );
    return didAdd;
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setColumnId(fallbackColumnId);
    setTitle("");
    setDescription("");
    setDueDate(defaultDueDate());
    setTagInput("");
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

  const addTypedTag = () => {
    const didAdd = addTagCandidate(tagInput);
    if (didAdd) {
      setTagInput("");
    }
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

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Tags</span>
            <div>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm">
                {selectedTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => removeTag(tag)}
                    disabled={isSubmitting}
                    className="inline-flex h-7 items-center gap-1.5 rounded-md bg-blue-50 px-2.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-60"
                  >
                    <span>{tag}</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                ))}
                <input
                  value={tagInput}
                  onChange={(event) => {
                    setTagInput(event.target.value);
                    setValidationError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      addTypedTag();
                    }
                    if (event.key === "Backspace" && !tagInput.trim() && selectedTags.length > 0) {
                      removeTag(selectedTags[selectedTags.length - 1]);
                    }
                  }}
                  placeholder={selectedTags.length === 0 ? "Type tag and press Enter..." : "Add another tag..."}
                  disabled={isSubmitting}
                  className="h-7 min-w-[180px] flex-1 border-0 bg-transparent px-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
                />
              </div>

              {remainingTagOptions.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {remainingTagOptions.slice(0, 8).map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="secondary"
                      className="h-7 px-2.5 text-xs"
                      disabled={isSubmitting}
                      onClick={() => {
                        const didAdd = addTagCandidate(tag);
                        if (didAdd) {
                          setTagInput("");
                        }
                      }}
                    >
                      + {tag}
                    </Button>
                  ))}
                </div>
              ) : null}

              <p className="mt-2 text-xs text-slate-500">Up to 8 tags. Press Enter or comma to add.</p>
            </div>
            {selectedTags.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">Selected: {selectedTags.length}/8</p>
            ) : null}
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
