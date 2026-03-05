import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = ({ className, variant = "secondary", type = "button", ...props }: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700",
        variant === "secondary" && "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        variant === "ghost" && "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        className
      )}
      {...props}
    />
  );
};


