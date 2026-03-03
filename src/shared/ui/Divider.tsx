import { cn } from "@/shared/lib/cn";

export const Divider = ({ className }: { className?: string }) => <div className={cn("h-px w-full bg-slate-200", className)} />;