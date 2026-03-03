import { cn } from "@/shared/lib/cn";

type BadgeTone = "slate" | "blue" | "red" | "amber" | "green";

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  className?: string;
};

export const Badge = ({ label, tone = "slate", className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-lg px-2 text-xs font-medium",
        tone === "slate" && "bg-slate-100 text-slate-600",
        tone === "blue" && "bg-blue-100 text-blue-700",
        tone === "red" && "bg-red-100 text-red-700",
        tone === "amber" && "bg-amber-100 text-amber-700",
        tone === "green" && "bg-green-100 text-green-700",
        className
      )}
    >
      {label}
    </span>
  );
};