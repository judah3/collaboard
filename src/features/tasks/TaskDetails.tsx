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
  const [selectedTag, setSelectedTag] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const currentTags = useMemo(() => draft.tags ?? [], [draft.tags]);

  const addSelectedTag = () => {
    const candidate = (selectedTag || newTagInput).trim();
    if (!candidate) {
      return;
    }

    if (candidate.length > 24) {
      setTagError("Tag must be 24 characters or fewer.");
      return;
    }

    if (currentTags.length >= 8) {
      setTagError("A task can only have up to 8 tags.");
      return;
    }

    const exists = currentTags.some((tag) => tag.toLowerCase() === candidate.toLowerCase());
    if (!exists) {
      onDraftChange({ tags: [...currentTags, candidate] });
    }
    setTagError(null);
    setSelectedTag("");
    setNewTagInput("");
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
          <div className="flex flex-col gap-2">
            <Input
              value={newTagInput}
              onChange={(event) => setNewTagInput(event.target.value)}
              placeholder="Type a new tag (e.g. backend)"
            />
            <select
              value={selectedTag}
              onChange={(event) => setSelectedTag(event.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="">{availableTags.length === 0 ? "No project tags found" : "Select project tag"}</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <Button type="button" variant="secondary" onClick={addSelectedTag} disabled={!(selectedTag || newTagInput.trim())}>
              Add
            </Button>
          </div>

          {currentTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {currentTags.map((tag) => (
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
          {tagError ? <p className="text-xs text-red-600">{tagError}</p> : null}
        </div>
      </div>
    </section>
  );
};

