import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";

type CreateColumnInlineProps = {
  draft: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onDraftChange: (value: string) => void;
  onCreate: () => void;
  onCancel: () => void;
};

export const CreateColumnInline = ({
  draft,
  isSubmitting,
  errorMessage,
  onDraftChange,
  onCreate,
  onCancel
}: CreateColumnInlineProps) => {
  const [touched, setTouched] = useState(false);

  const handleSubmit = () => {
    setTouched(true);
    onCreate();
  };

  const showRequired = touched && !draft.trim();

  return (
    <section className="min-w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">New Column</h3>
      <div className="pt-2">
        <Input
          autoFocus
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }

            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
          placeholder="Column name"
        />
        {showRequired ? <p className="pt-2 text-xs text-red-600">Column name is required</p> : null}
        {errorMessage ? <p className="pt-2 text-xs text-red-600">{errorMessage}</p> : null}
      </div>
      <div className="flex items-center gap-2 pt-3">
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
          <Check className="h-4 w-4" />
          Create
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </section>
  );
};