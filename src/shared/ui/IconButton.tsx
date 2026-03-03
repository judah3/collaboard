import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const IconButton = ({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        className
      )}
      {...props}
    />
  );
};
