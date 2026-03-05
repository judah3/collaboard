import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none",
        className
      )}
      {...props}
    />
  );
};


