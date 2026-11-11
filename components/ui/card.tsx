import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Surface container shared by dashboard panels. */
export function Card({ className, ...divProps }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
      {...divProps}
    />
  );
}
