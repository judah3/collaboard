import { cn } from "@/shared/lib/cn";

type AvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md";
  className?: string;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const Avatar = ({ name, src, size = "sm", className }: AvatarProps) => {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-white bg-slate-200 font-medium text-slate-700",
        size === "sm" && "h-7 w-7 text-xs",
        size === "md" && "h-8 w-8 text-xs",
        className
      )}
      title={name}
      aria-label={name}
    >
      {src ? <img src={src} alt={name} className="h-full w-full rounded-full object-cover" /> : getInitials(name)}
    </div>
  );
};