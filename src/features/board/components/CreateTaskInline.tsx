import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";

type CreateTaskInlineProps = {
  isSubmitting: boolean;
  errorMessage: string | null;
  onCreate: (title: string) => void;
  onCancel: () => void;
};

export const CreateTaskInline = ({ isSubmitting, errorMessage, onCreate, onCancel }: CreateTaskInlineProps) => {
  const [title, setTitle] = useState("");
  const [touched, setTouched] = useState(false);

  const submit = () => {
    setTouched(true);
    if (!title.trim()) {
      return;
    }

    onCreate(title);
  };

  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <Input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
        placeholder="Task title"
      />
      {touched && !title.trim() ? <p className="pt-2 text-xs text-red-600">Task title is required</p> : null}
      {errorMessage ? <p className="pt-2 text-xs text-red-600">{errorMessage}</p> : null}

      <div className="flex items-center gap-2 pt-3">
        <Button variant="primary" onClick={submit} disabled={isSubmitting}>
          <Check className="h-4 w-4" />
          Save
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
};