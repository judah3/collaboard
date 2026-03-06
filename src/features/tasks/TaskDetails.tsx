import { X } from "lucide-react";
import { useMemo, useState } from "react";
import type { BoardColumn } from "@/features/board/types";
import type { Task } from "@/features/tasks/types";
import { Button } from "@/shared/ui/Button";
import { formatDueDate } from "@/shared/lib/date";
import { Avatar } from "@/shared/ui/Avatar";
import { Badge } from "@/shared/ui/Badge";
import { Divider } from "@/shared/ui/Divider";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";

type TaskDetailsProps = {
  draft: Task;
  usersById: Record<string, string>;
  columns: BoardColumn[];
  availableTags: string[];
  isEditing: boolean;
  onDraftChange: (patch: Partial<Task>) => void;
};

export const TaskDetails = ({ draft, usersById, columns, availableTags, isEditing, onDraftChange }: TaskDetailsProps) => {
  const assigneeName = usersById[draft.assigneeId];
  const priorityTone = draft.priority === "High" ? "red" : draft.priority === "Medium" ? "amber" : "slate";
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const currentTags = useMemo(() => draft.tags ?? [], [draft.tags]);
  const remainingTagOptions = useMemo(
    () =>
      availableTags.filter((tag) => {
        const alreadySelected = currentTags.some((currentTag) => currentTag.toLowerCase() === tag.toLowerCase());
        const matchesQuery = tag.toLowerCase().includes(tagInput.trim().toLowerCase());
        return !alreadySelected && matchesQuery;
      }),
    [availableTags, currentTags, tagInput]
  );

  const addTagCandidate = (rawCandidate: string) => {
    const candidate = rawCandidate.trim();
    if (!candidate) {
      return false;
    }

    if (candidate.length > 24) {
      setTagError("Tag must be 24 characters or fewer.");
      return false;
    }

    if (currentTags.length >= 8) {
      setTagError("A task can only have up to 8 tags.");
      return false;
    }

    const exists = currentTags.some((tag) => tag.toLowerCase() === candidate.toLowerCase());
    if (!exists) {
      onDraftChange({ tags: [...currentTags, candidate] });
    }
    setTagError(null);
    return true;
  };

  const addTypedTag = () => {
    const didAdd = addTagCandidate(tagInput);
    if (didAdd) {
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    onDraftChange({ tags: currentTags.filter((item) => item !== tag) });
    setTagError(null);
  };

  if (!isEditing) {
    return (
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">{draft.title}</h2>
          <p className="text-sm text-slate-600">{draft.description}</p>
        </div>

        <Divider />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Assignee</p>
            <div className="flex items-center gap-2 text-slate-700">
              {assigneeName ? <Avatar name={assigneeName} size="sm" /> : null}
              {assigneeName}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Priority</p>
            <Badge label={draft.priority} tone={priorityTone} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Due Date</p>
            <p className="text-sm text-slate-700">{formatDueDate(draft.dueDate)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Tags</p>
            <div className="flex flex-wrap gap-2">
              {draft.tags.map((tag) => (
                <Badge key={tag} label={`#${tag}`} tone="blue" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <Input value={draft.title} onChange={(event) => onDraftChange({ title: event.target.value.slice(0, 120) })} />
        <textarea
          value={draft.description}
          onChange={(event) => onDraftChange({ description: event.target.value.slice(0, 1000) })}
          className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none"
        />
      </div>

      <Divider />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Assignee</p>
          <Select value={draft.assigneeId} onChange={(event) => onDraftChange({ assigneeId: event.target.value })}>
            {Object.entries(usersById).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-500">Priority</p>
          <Select value={draft.priority} onChange={(event) => onDraftChange({ priority: event.target.value as Task["priority"] })}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-500">Due Date</p>
          <Input type="date" value={draft.dueDate} onChange={(event) => onDraftChange({ dueDate: event.target.value })} />
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-500">Column</p>
          <Select value={draft.columnId} onChange={(event) => onDraftChange({ columnId: event.target.value })}>
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="col-span-2 space-y-1">
          <p className="text-xs text-slate-500">Tags</p>
          <div>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm">
              {currentTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => removeTag(tag)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md bg-blue-50 px-2.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <span>{tag}</span>
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <input
                value={tagInput}
                onChange={(event) => {
                  setTagInput(event.target.value);
                  setTagError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addTypedTag();
                  }
                  if (event.key === "Backspace" && !tagInput.trim() && currentTags.length > 0) {
                    removeTag(currentTags[currentTags.length - 1]);
                  }
                }}
                placeholder={currentTags.length === 0 ? "Type tag and press Enter..." : "Add another tag..."}
                className="h-7 min-w-[180px] flex-1 border-0 bg-transparent px-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
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

          {currentTags.length > 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              Selected: {currentTags.length}/8
            </p>
          ) : null}
          {tagError ? <p className="text-xs text-red-600">{tagError}</p> : null}
        </div>
      </div>
    </section>
  );
};

