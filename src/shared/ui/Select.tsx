import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  icon?: ReactNode;
};

export const Select = ({ className, icon, children, ...props }: SelectProps) => {
  return (
    <label className="relative flex h-9 items-center rounded-lg border border-slate-200 bg-white pl-3 pr-8 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/40">
      {icon ? <span className="mr-2 inline-flex text-slate-500">{icon}</span> : null}
      <select
        className={cn(
          "h-full w-full appearance-none bg-transparent pr-2 text-sm text-slate-700 focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-slate-400" />
    </label>
  );
};
